/**
 * POST /api/blockchain/verify-by-id
 * ─────────────────────────────────
 * Fetches the on-chain record for a given recordId from the MedicalIntegrity
 * contract and compares it against a locally-computed SHA-256 hash.
 *
 * This is the "Verify Record Authenticity" endpoint consumed by the
 * IntegrityShield component. It returns:
 *   - The on-chain hash (what was anchored)
 *   - The local hash (what the current data produces)
 *   - integrityMatch: true/false
 *   - Timestamp, recorder address, explorer URL
 *
 * Body: { recordId: string, localHash: string }
 * Response: VerifyByIdResult
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse }  from 'next/server';
import { verifyRecordById }           from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, localHash } = body as {
      recordId?:  string;
      localHash?: string;
    };

    if (!recordId) {
      return NextResponse.json({ error: '"recordId" is required' }, { status: 400 });
    }

    if (!localHash) {
      return NextResponse.json({ error: '"localHash" is required' }, { status: 400 });
    }

    if (!/^[0-9a-f]{64}$/i.test(localHash)) {
      return NextResponse.json(
        { error: 'Invalid localHash — must be 64-char SHA-256 hex' },
        { status: 400 }
      );
    }

    const result = await verifyRecordById(recordId, localHash);
    return NextResponse.json(result);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/verify-by-id]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
