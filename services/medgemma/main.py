"""
MedGemma Microservice
═════════════════════
FastAPI wrapper around Google's MedGemma model.

Supports TWO backends (controlled by env var MEDGEMMA_BACKEND):
  "local"   — loads google/medgemma-4b-it locally via HuggingFace Transformers
  "vertex"  — proxies to a Google Vertex AI endpoint (requires GCP credentials)
  "openrouter" — uses OpenRouter's medgemma endpoint (easiest for demos)

Default: "openrouter" (no GPU required, uses existing OPENAI_API_KEY)

Endpoints:
  POST /query   — Clinical NLP query with system prompt
  POST /analyze — Analyze a patient note for clinical insights
  GET  /health  — Health check
  GET  /model   — Active model/backend info
"""

import os, time, logging, asyncio
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [MedGemma] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("medgemma")

# ── Config ────────────────────────────────────────────────────────────────────
BACKEND          = os.getenv("MEDGEMMA_BACKEND", "openrouter")   # openrouter | vertex | local
OPENROUTER_KEY   = os.getenv("OPENAI_API_KEY", "")
OPENROUTER_BASE  = "https://openrouter.ai/api/v1"
MEDGEMMA_MODEL   = os.getenv("MEDGEMMA_MODEL", "google/gemma-2-9b-it")   # via OpenRouter
VERTEX_ENDPOINT  = os.getenv("VERTEX_ENDPOINT", "")               # used when BACKEND=vertex
LOCAL_MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "google/medgemma-4b-it")

REQUEST_TIMEOUT  = int(os.getenv("REQUEST_TIMEOUT", "45"))         # seconds
MAX_NEW_TOKENS   = int(os.getenv("MAX_NEW_TOKENS",  "512"))

# Local model handle (populated on startup when BACKEND=local)
_local_pipe = None

MEDGEMMA_SYSTEM_PROMPT = """You are MedGemma, a specialized clinical AI assistant trained on
medical literature. You assist clinicians and care teams with:
- Interpreting patient notes and lab values
- Identifying potential drug interactions and contraindications
- Summarising clinical findings in structured SOAP format
- Flagging red-flag symptoms that require urgent review
- Evidence-based nutritional recommendations for maternal health and chronic illness

IMPORTANT: You are a decision-support tool only. Always recommend physician review.
Do not diagnose, prescribe, or replace clinical judgment.
Respond concisely and use clinical terminology appropriate for healthcare professionals."""


# ── Lifespan: load local model on startup if configured ──────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _local_pipe
    if BACKEND == "local":
        log.info(f"Loading MedGemma locally: {LOCAL_MODEL_NAME}")
        try:
            from transformers import pipeline
            _local_pipe = pipeline(
                "text-generation",
                model=LOCAL_MODEL_NAME,
                device_map="auto",
                torch_dtype="auto",
                max_new_tokens=MAX_NEW_TOKENS,
            )
            log.info("Local MedGemma model loaded successfully.")
        except Exception as e:
            log.error(f"Failed to load local model: {e}. Falling back to openrouter.")
    yield
    _local_pipe = None


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="MedGemma Microservice",
    description="Clinical AI proxy for MedNutri dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query:          str   = Field(..., min_length=3, max_length=4000,
                                  description="Clinical query or patient note")
    context:        Optional[str] = Field(None, description="Additional patient context")
    temperature:    float = Field(0.3, ge=0.0, le=1.0)
    max_tokens:     int   = Field(512,  ge=64,  le=2048)

class AnalyzeRequest(BaseModel):
    patient_note:   str   = Field(..., min_length=10, max_length=8000)
    analysis_type:  str   = Field("soap",
                                  description="soap | flags | nutrition | summary")

class QueryResponse(BaseModel):
    response:       str
    model:          str
    backend:        str
    latency_ms:     int
    tokens_used:    Optional[int] = None


# ── Backend Dispatchers ───────────────────────────────────────────────────────

async def _query_openrouter(messages: list[dict], temperature: float, max_tokens: int) -> dict:
    """Send messages to OpenRouter using existing key."""
    if not OPENROUTER_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_KEY}",
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://mednutri.local",
        "X-Title":       "MedNutri MedGemma",
    }
    payload = {
        "model":       MEDGEMMA_MODEL,
        "messages":    messages,
        "temperature": temperature,
        "max_tokens":  max_tokens,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.post(f"{OPENROUTER_BASE}/chat/completions",
                                 json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    return {
        "text":   data["choices"][0]["message"]["content"],
        "model":  data.get("model", MEDGEMMA_MODEL),
        "tokens": data.get("usage", {}).get("total_tokens"),
    }


async def _query_vertex(prompt: str, temperature: float, max_tokens: int) -> dict:
    """Send request to Google Vertex AI endpoint."""
    if not VERTEX_ENDPOINT:
        raise HTTPException(status_code=500, detail="VERTEX_ENDPOINT not configured")

    try:
        from google.cloud import aiplatform
        from google.cloud.aiplatform.gapic.schema import predict
    except ImportError:
        raise HTTPException(status_code=500,
                            detail="google-cloud-aiplatform not installed. "
                                   "Set MEDGEMMA_BACKEND=openrouter instead.")

    # Vertex AI prediction (async wrapper via httpx to avoid blocking)
    headers = {"Content-Type": "application/json"}
    payload = {
        "instances":  [{"prompt": prompt}],
        "parameters": {"temperature": temperature, "maxOutputTokens": max_tokens},
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        resp = await client.post(VERTEX_ENDPOINT, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    text = data["predictions"][0].get("content", "")
    return {"text": text, "model": "medgemma-vertex", "tokens": None}


def _query_local(messages: list[dict], max_tokens: int) -> dict:
    """Run inference on locally loaded MedGemma pipeline (CPU/GPU)."""
    if _local_pipe is None:
        raise HTTPException(status_code=503, detail="Local model not loaded")

    # Convert messages to a single prompt string (instruct format)
    prompt = "\n".join(
        f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
        for m in messages
    )
    result = _local_pipe(prompt, max_new_tokens=max_tokens)
    text   = result[0]["generated_text"][len(prompt):].strip()
    return {"text": text, "model": LOCAL_MODEL_NAME, "tokens": None}


async def dispatch(messages: list[dict], temperature: float, max_tokens: int) -> dict:
    """Route to the configured backend with retry on transient errors."""
    for attempt in range(1, 3):
        try:
            if BACKEND == "vertex":
                prompt = messages[-1]["content"] if messages else ""
                return await _query_vertex(prompt, temperature, max_tokens)
            elif BACKEND == "local":
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(
                    None, _query_local, messages, max_tokens)
            else:   # openrouter (default)
                return await _query_openrouter(messages, temperature, max_tokens)
        except httpx.TimeoutException:
            if attempt == 2:
                raise HTTPException(status_code=504,
                                    detail=f"MedGemma service timed out after {REQUEST_TIMEOUT}s")
            log.warning(f"Timeout on attempt {attempt}, retrying...")
            await asyncio.sleep(1)
        except httpx.HTTPStatusError as e:
            code = e.response.status_code
            if code == 429:
                if attempt == 2:
                    raise HTTPException(status_code=429, detail="Rate limited by model provider")
                await asyncio.sleep(2)
            else:
                raise HTTPException(status_code=502,
                                    detail=f"Model provider returned {code}: {e.response.text[:200]}")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status":  "ok",
        "backend": BACKEND,
        "model":   MEDGEMMA_MODEL if BACKEND == "openrouter" else LOCAL_MODEL_NAME,
    }


@app.get("/model")
async def model_info():
    return {
        "backend":      BACKEND,
        "model":        MEDGEMMA_MODEL,
        "local_model":  LOCAL_MODEL_NAME,
        "timeout_sec":  REQUEST_TIMEOUT,
        "max_tokens":   MAX_NEW_TOKENS,
    }


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    """General-purpose clinical NLP query."""
    messages = [
        {"role": "system",  "content": MEDGEMMA_SYSTEM_PROMPT},
        {"role": "user",
         "content": f"{req.query}\n\nContext: {req.context}" if req.context else req.query},
    ]

    t0  = time.monotonic()
    out = await dispatch(messages, req.temperature, req.max_tokens)
    ms  = int((time.monotonic() - t0) * 1000)

    log.info(f"/query  backend={BACKEND}  latency={ms}ms  tokens={out.get('tokens')}")
    return QueryResponse(
        response=out["text"], model=out["model"],
        backend=BACKEND, latency_ms=ms, tokens_used=out.get("tokens"),
    )


@app.post("/analyze", response_model=QueryResponse)
async def analyze(req: AnalyzeRequest):
    """Analyze a patient note — returns structured clinical insights."""

    ANALYSIS_PROMPTS = {
        "soap": (
            "Convert the following patient note into a structured SOAP format "
            "(Subjective, Objective, Assessment, Plan). Be concise and precise.\n\n"
            f"Patient Note:\n{req.patient_note}"
        ),
        "flags": (
            "Review this patient note and identify RED FLAG symptoms, abnormal values, "
            "drug interactions, or urgent items requiring immediate attention. "
            "Format as a bulleted list.\n\n"
            f"Patient Note:\n{req.patient_note}"
        ),
        "nutrition": (
            "Based on this patient note, provide specific evidence-based nutritional "
            "recommendations. Include key nutrients to prioritise, foods to avoid, "
            "and portion guidance. Tailor for maternal health if pregnancy is mentioned.\n\n"
            f"Patient Note:\n{req.patient_note}"
        ),
        "summary": (
            "Provide a concise clinical summary of this patient note in 3–5 sentences. "
            "Include key diagnoses, current medications, and immediate care priorities.\n\n"
            f"Patient Note:\n{req.patient_note}"
        ),
    }

    prompt = ANALYSIS_PROMPTS.get(
        req.analysis_type,
        ANALYSIS_PROMPTS["summary"]
    )

    messages = [
        {"role": "system",  "content": MEDGEMMA_SYSTEM_PROMPT},
        {"role": "user",    "content": prompt},
    ]

    t0  = time.monotonic()
    out = await dispatch(messages, temperature=0.2, max_tokens=MAX_NEW_TOKENS)
    ms  = int((time.monotonic() - t0) * 1000)

    log.info(f"/analyze type={req.analysis_type}  latency={ms}ms")
    return QueryResponse(
        response=out["text"], model=out["model"],
        backend=BACKEND, latency_ms=ms, tokens_used=out.get("tokens"),
    )


# ── Error handlers ────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_error(request: Request, exc: Exception):
    log.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500,
                        content={"error": "Internal server error", "detail": str(exc)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8100, reload=True, log_level="info")
