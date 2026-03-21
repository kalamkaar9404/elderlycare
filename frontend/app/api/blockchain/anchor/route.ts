/**
 * POST /api/blockchain/anchor
 * ────────────────────────────
 * Anchors a patient record on-chain using the MedicalIntegrity contract.
 *
 * Unlike /api/blockchain/record (which hashes arbitrary data with keccak256),
 * this route uses the SHA-256 hash-engine and stores it in the string-keyed
 * mapping of the MedicalIntegrity contract — directly associating a recordId
 * with a deterministic SHA-256 fingerprint.
 *
 * Body: { recordId: string, data: Record<string, unknown> }
 *   OR: { recordId: string, hash: string }   (if you pre-computed the hash)
 *
 * Response: { recordId, fileHash, txHash, explorerUrl, isUpdate }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { anchorRecordById }          from '@/lib/blockchain';
import { generateRecordHash }        from '@/lib/hash-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, data, hash } = body as {
      recordId?: string;
      data?:     Record<string, unknown>;
      hash?:     string;
    };

    if (!recordId) {
      return NextResponse.json(
        { error: '"recordId" is required' },
        { status: 400 }
      );
    }

    if (!data && !hash) {
      return NextResponse.json(
        { error: 'Either "data" (object to hash) or "hash" (pre-computed) is required' },
        { status: 400 }
      );
    }

    // Compute or use the provided SHA-256 hash
    const fileHash = hash ?? generateRecordHash(data);

    // Validate it's a 64-char hex string (SHA-256 requirement from the contract)
    if (!/^[0-9a-f]{64}$/i.test(fileHash)) {
      return NextResponse.json(
        { error: 'Invalid hash format — must be a 64-character SHA-256 hex string' },
        { status: 400 }
      );
    }

    const result = await anchorRecordById(recordId, fileHash);

    if (!result) {
      return NextResponse.json(
        {
          error:  'Blockchain anchoring failed. The service may be misconfigured.',
          detail: 'Check INTEGRITY_CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY, and POLYGON_RPC_URL in .env.local',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, ...result });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/anchor]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
