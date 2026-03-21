/**
 * /api/ai/biobert
 * ────────────────
 * Secure Next.js proxy to the BioBERT NER FastAPI microservice.
 * Returns named medical entities with position offsets and highlight colors
 * so the frontend can render annotated patient notes.
 *
 * Supported actions:
 *   action: "ner"        → POST /ner        single text
 *   action: "batch"      → POST /ner/batch  multiple texts
 *   action: "entities"   → GET  /entities   list supported entity types
 *   action: "health"     → GET  /health
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const BIOBERT_URL =
  process.env.BIOBERT_SERVICE_URL ?? 'http://localhost:8200';

const PROXY_TIMEOUT_MS = 30_000;   // 30 s — NER is faster than generation

interface NERBody {
  action?:         'ner' | 'batch' | 'entities' | 'health';
  text?:           string;
  texts?:          string[];
  min_confidence?: number;
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: NERBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action = 'ner', ...payload } = body;

  let upstreamPath:   string;
  let upstreamMethod: 'GET' | 'POST';
  let upstreamBody:   unknown;

  switch (action) {
    case 'health':
      upstreamPath   = '/health';
      upstreamMethod = 'GET';
      upstreamBody   = undefined;
      break;

    case 'entities':
      upstreamPath   = '/entities';
      upstreamMethod = 'GET';
      upstreamBody   = undefined;
      break;

    case 'batch':
      if (!payload.texts?.length) {
        return NextResponse.json(
          { error: 'texts array is required for action=batch' },
          { status: 400 }
        );
      }
      upstreamPath   = '/ner/batch';
      upstreamMethod = 'POST';
      upstreamBody   = {
        texts:          payload.texts,
        min_confidence: payload.min_confidence ?? 0.70,
      };
      break;

    case 'ner':
    default:
      if (!payload.text) {
        return NextResponse.json(
          { error: 'text is required for action=ner' },
          { status: 400 }
        );
      }
      upstreamPath   = '/ner';
      upstreamMethod = 'POST';
      upstreamBody   = {
        text:           payload.text,
        min_confidence: payload.min_confidence ?? 0.70,
      };
      break;
  }

  // ── Forward with timeout ───────────────────────────────────────────────────
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BIOBERT_URL}${upstreamPath}`, {
      method:  upstreamMethod,
      headers: { 'Content-Type': 'application/json' },
      body:    upstreamBody ? JSON.stringify(upstreamBody) : undefined,
      signal:  controller.signal,
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'BioBERT service error', upstream_status: upstream.status },
        { status: upstream.status === 503 ? 503 : 502 }
      );
    }

    return NextResponse.json({ ...data, service: 'biobert' });

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: `BioBERT timed out after ${PROXY_TIMEOUT_MS / 1000}s` },
        { status: 504 }
      );
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return NextResponse.json(
        {
          error:   'BioBERT service is not running',
          detail:  'Start it with: cd services/biobert && uvicorn main:app --port 8200',
          service: 'biobert',
          // Return empty entities so UI degrades gracefully
          entities:     [],
          entity_count: 0,
          unique_types: [],
          latency_ms:   0,
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
    const res  = await fetch(`${BIOBERT_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return NextResponse.json({ ...data, proxy: 'ok' });
  } catch {
    return NextResponse.json({ status: 'offline', service: 'biobert' }, { status: 503 });
  }
}
