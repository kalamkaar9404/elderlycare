/**
 * POST /api/blockchain/verify
 * ────────────────────────────
 * Receives data, re-hashes it, and calls verifyRecord() on the contract
 * (read-only — no gas, no wallet needed).
 *
 * Body: { data: any }
 * Response: { verified, timestamp, blockNumber, anchoredAt, explorerUrl }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verifyRecordHash } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.data) {
      return NextResponse.json({ error: 'Request body must contain a "data" field.' }, { status: 400 });
    }

    const result = await verifyRecordHash(body.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/verify]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
