"""
BioBERT NER Microservice
════════════════════════
Runs Named Entity Recognition on patient notes using:
  Primary:  d4data/biomedical-ner-all   (BioBERT fine-tuned, 18 entity types)
  Fallback: allenai/scibert_scivocab_cased (if primary unavailable)

Entity types returned (BIONLP13CG / MedMention schema):
  DISEASE, CHEMICAL, GENE_OR_GENE_PRODUCT, ORGANISM, CELL_LINE,
  CELL_TYPE, TISSUE, ORGAN, MULTI_TISSUE_STRUCTURE,
  DEVELOPING_ANATOMICAL_STRUCTURE, PATHOLOGICAL_FORMATION,
  IMMATERIAL_ANATOMICAL_ENTITY, CANCER, AMINO_ACID, GENE, PROTEIN,
  DRUG, DOSAGE_FORM

Endpoints:
  POST /ner          — Run NER on text, returns entities + positions
  POST /ner/batch    — Run NER on multiple texts
  GET  /health       — Health + model loaded status
  GET  /entities     — List of supported entity types
"""

import os, time, logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BioBERT] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("biobert")

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_NAME    = os.getenv("BIOBERT_MODEL", "d4data/biomedical-ner-all")
FALLBACK_MODEL= "allenai/scibert_scivocab_cased"
MAX_LENGTH    = int(os.getenv("MAX_TOKEN_LENGTH", "512"))
BATCH_SIZE    = int(os.getenv("BATCH_SIZE", "8"))
DEVICE        = os.getenv("DEVICE", "cpu")          # "cuda" if GPU available

# ── Entity colour map (used by frontend to highlight) ────────────────────────
ENTITY_COLORS = {
    "DISEASE":                        "#DC2626",   # crimson
    "CHEMICAL":                       "#7C3AED",   # purple
    "DRUG":                           "#7C3AED",
    "GENE_OR_GENE_PRODUCT":           "#2563EB",   # blue
    "GENE":                           "#2563EB",
    "PROTEIN":                        "#1D4ED8",
    "ORGANISM":                       "#059669",   # green
    "CELL_LINE":                      "#0891B2",   # cyan
    "CELL_TYPE":                      "#0891B2",
    "TISSUE":                         "#D97706",   # amber
    "ORGAN":                          "#B45309",
    "MULTI_TISSUE_STRUCTURE":         "#92400E",
    "CANCER":                         "#991B1B",   # dark red
    "AMINO_ACID":                     "#6366F1",   # indigo
    "DOSAGE_FORM":                    "#9333EA",
    "PATHOLOGICAL_FORMATION":         "#BE185D",   # pink
    "DEVELOPING_ANATOMICAL_STRUCTURE":"#047857",
    "IMMATERIAL_ANATOMICAL_ENTITY":   "#6B7280",   # gray
}

# Global model handle
_ner_pipeline = None
_model_loaded = False


# ── Lifespan: load model on startup ──────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ner_pipeline, _model_loaded
    log.info(f"Loading BioBERT NER model: {MODEL_NAME}")
    try:
        from transformers import pipeline
        _ner_pipeline = pipeline(
            "ner",
            model=MODEL_NAME,
            tokenizer=MODEL_NAME,
            aggregation_strategy="simple",   # merges B-/I- tokens automatically
            device=-1 if DEVICE == "cpu" else 0,
        )
        _model_loaded = True
        log.info(f"Model loaded: {MODEL_NAME}")
    except Exception as e:
        log.error(f"Failed to load {MODEL_NAME}: {e}")
        log.info(f"Attempting fallback model: {FALLBACK_MODEL}")
        try:
            from transformers import pipeline
            _ner_pipeline = pipeline(
                "ner",
                model=FALLBACK_MODEL,
                aggregation_strategy="simple",
                device=-1,
            )
            _model_loaded = True
            log.info(f"Fallback model loaded: {FALLBACK_MODEL}")
        except Exception as e2:
            log.error(f"Fallback also failed: {e2}. NER will return empty results.")
    yield
    _ner_pipeline = None
    _model_loaded = False


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="BioBERT NER Microservice",
    description="Medical Named Entity Recognition for MedNutri dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

_RAW_ORIGINS = os.getenv("ALLOWED_ORIGINS", "")
_EXTRA_ORIGINS = [o.strip() for o in _RAW_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        *_EXTRA_ORIGINS,   # add VERCEL_URL and custom domain at runtime
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",   # all Vercel preview + prod URLs
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)


# ── Pydantic models ───────────────────────────────────────────────────────────
class NERRequest(BaseModel):
    text:           str   = Field(..., min_length=3, max_length=10_000,
                                  description="Patient note or clinical text to analyse")
    min_confidence: float = Field(0.70, ge=0.0, le=1.0,
                                  description="Minimum confidence threshold for entities")

class BatchNERRequest(BaseModel):
    texts:          list[str] = Field(..., min_length=1, max_length=20)
    min_confidence: float     = Field(0.70, ge=0.0, le=1.0)

class Entity(BaseModel):
    text:         str
    label:        str
    score:        float
    start:        int
    end:          int
    color:        str           # hex color for frontend highlighting

class NERResponse(BaseModel):
    entities:     list[Entity]
    entity_count: int
    unique_types: list[str]
    latency_ms:   int
    model:        str

class BatchNERResponse(BaseModel):
    results:      list[NERResponse]
    total_entities: int


# ── NER helper ────────────────────────────────────────────────────────────────
def run_ner(text: str, min_confidence: float) -> list[Entity]:
    """Run BioBERT NER pipeline and return filtered, colored entities."""
    if not _ner_pipeline:
        return []

    raw = _ner_pipeline(text[:MAX_LENGTH * 4])   # rough char limit
    entities = []
    seen = set()   # deduplicate overlapping spans

    for item in raw:
        score = float(item.get("score", 0))
        if score < min_confidence:
            continue

        span_key = (item["start"], item["end"])
        if span_key in seen:
            continue
        seen.add(span_key)

        label = item.get("entity_group", item.get("entity", "UNKNOWN")).upper()
        # Normalise label variants
        label = label.replace("B-", "").replace("I-", "")

        entities.append(Entity(
            text=item["word"].replace("##", "").strip(),
            label=label,
            score=round(score, 4),
            start=item["start"],
            end=item["end"],
            color=ENTITY_COLORS.get(label, "#6B7280"),
        ))

    # Sort by position
    entities.sort(key=lambda e: e.start)
    return entities


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status":       "ok" if _model_loaded else "degraded",
        "model_loaded": _model_loaded,
        "model":        MODEL_NAME,
        "device":       DEVICE,
    }


@app.get("/entities")
async def entity_types():
    return {
        "types":  list(ENTITY_COLORS.keys()),
        "colors": ENTITY_COLORS,
    }


@app.post("/ner", response_model=NERResponse)
async def named_entity_recognition(req: NERRequest):
    if not _model_loaded:
        raise HTTPException(
            status_code=503,
            detail="BioBERT model is still loading. Retry in a moment."
        )

    t0       = time.monotonic()
    entities = run_ner(req.text, req.min_confidence)
    ms       = int((time.monotonic() - t0) * 1000)

    log.info(f"/ner  chars={len(req.text)}  entities={len(entities)}  latency={ms}ms")

    return NERResponse(
        entities=entities,
        entity_count=len(entities),
        unique_types=list(dict.fromkeys(e.label for e in entities)),
        latency_ms=ms,
        model=MODEL_NAME,
    )


@app.post("/ner/batch", response_model=BatchNERResponse)
async def batch_ner(req: BatchNERRequest):
    if not _model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    t0      = time.monotonic()
    results = []
    total   = 0

    for text in req.texts:
        entities = run_ner(text, req.min_confidence)
        ms       = int((time.monotonic() - t0) * 1000)
        results.append(NERResponse(
            entities=entities,
            entity_count=len(entities),
            unique_types=list(dict.fromkeys(e.label for e in entities)),
            latency_ms=ms,
            model=MODEL_NAME,
        ))
        total += len(entities)

    log.info(f"/ner/batch  texts={len(req.texts)}  total_entities={total}")
    return BatchNERResponse(results=results, total_entities=total)


# ── Error handler ─────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_error(request: Request, exc: Exception):
    log.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500,
                        content={"error": "Internal server error", "detail": str(exc)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8200, reload=False, log_level="info")
