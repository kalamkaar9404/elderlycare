/**
 * POST /api/blockchain/record
 * ────────────────────────────
 * Receives arbitrary JSON data, hashes it, and silently anchors it
 * to the MedicalRegistry smart contract on Polygon Amoy via the Admin Wallet.
 *
 * Body: { data: any }
 * Response: { fileHash, txHash, explorerUrl } | { error: string }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { silentlyRecordHash } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.data) {
      return NextResponse.json({ error: 'Request body must contain a "data" field.' }, { status: 400 });
    }

    const result = await silentlyRecordHash(body.data);

    if (!result) {
      // blockchain.ts already logged the real error; return a clean message to the UI
      return NextResponse.json(
        { error: 'Blockchain anchoring failed. Check server logs for details.' },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/record]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
