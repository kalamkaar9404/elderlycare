/**
 * /api/ai/medgemma
 * ─────────────────
 * Secure Next.js proxy to the MedGemma FastAPI microservice.
 * The browser never talks to the Python service directly — all traffic
 * flows through this route which can validate, rate-limit, and log.
 *
 * Supported actions (in request body):
 *   action: "query"   → POST /query   on the MedGemma service
 *   action: "analyze" → POST /analyze on the MedGemma service
 *   action: "health"  → GET  /health  on the MedGemma service
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const MEDGEMMA_URL =
  process.env.MEDGEMMA_SERVICE_URL ?? 'http://localhost:8100';

const PROXY_TIMEOUT_MS = 50_000;   // 50 s (MedGemma can be slow on first call)

// ── Types ─────────────────────────────────────────────────────────────────────
interface QueryBody {
  action:        'query' | 'analyze' | 'health';
  query?:        string;
  context?:      string;
  patient_note?: string;
  analysis_type?:'soap' | 'flags' | 'nutrition' | 'summary';
  temperature?:  number;
  max_tokens?:   number;
  min_confidence?: number;
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: QueryBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action = 'query', ...payload } = body;

  // ── Build upstream request ─────────────────────────────────────────────────
  let upstreamPath: string;
  let upstreamMethod: 'GET' | 'POST';
  let upstreamBody: unknown;

  switch (action) {
    case 'health':
      upstreamPath   = '/health';
      upstreamMethod = 'GET';
      upstreamBody   = undefined;
      break;

    case 'analyze':
      if (!payload.patient_note) {
        return NextResponse.json(
          { error: 'patient_note is required for action=analyze' },
          { status: 400 }
        );
      }
      upstreamPath   = '/analyze';
      upstreamMethod = 'POST';
      upstreamBody   = {
        patient_note:  payload.patient_note,
        analysis_type: payload.analysis_type ?? 'summary',
      };
      break;

    case 'query':
    default:
      if (!payload.query) {
        return NextResponse.json(
          { error: 'query is required for action=query' },
          { status: 400 }
        );
      }
      upstreamPath   = '/query';
      upstreamMethod = 'POST';
      upstreamBody   = {
        query:       payload.query,
        context:     payload.context,
        temperature: payload.temperature ?? 0.3,
        max_tokens:  payload.max_tokens  ?? 512,
      };
      break;
  }

  // ── Forward to MedGemma service with timeout ───────────────────────────────
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${MEDGEMMA_URL}${upstreamPath}`, {
      method:  upstreamMethod,
      headers: { 'Content-Type': 'application/json' },
      body:    upstreamBody ? JSON.stringify(upstreamBody) : undefined,
      signal:  controller.signal,
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'MedGemma service error', upstream_status: upstream.status },
        { status: upstream.status === 503 ? 503 : 502 }
      );
    }

    return NextResponse.json({ ...data, service: 'medgemma' });

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: `MedGemma timed out after ${PROXY_TIMEOUT_MS / 1000}s` },
        { status: 504 }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Service not running — return graceful degradation message
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return NextResponse.json(
        {
          error:   'MedGemma service is not running',
          detail:  'Start it with: cd services/medgemma && uvicorn main:app --port 8100',
          service: 'medgemma',
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });

  } finally {
    clearTimeout(timer);
  }
}

// ── GET handler — health passthrough ─────────────────────────────────────────
export async function GET() {
  try {
    const res  = await fetch(`${MEDGEMMA_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return NextResponse.json({ ...data, proxy: 'ok' });
  } catch {
    return NextResponse.json({ status: 'offline', service: 'medgemma' }, { status: 503 });
  }
}
