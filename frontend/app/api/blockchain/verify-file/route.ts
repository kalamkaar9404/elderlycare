/**
 * POST /api/blockchain/verify-file
 * ──────────────────────────────────
 * Re-hashes a file and compares to the on-chain hash.
 *
 * Body: FormData { file: File, recordId: string }
 *  OR   JSON     { recordId: string, fileHash: string }
 *
 * Returns: VerifyByIdResult + { fileName, localHash, status }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash }               from 'crypto';
import { verifyRecordById }         from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let recordId:  string;
    let localHash: string;
    let fileName = 'document';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file     = formData.get('file') as File | null;
      recordId       = (formData.get('recordId') as string) ?? '';

      if (!file || !recordId) {
        return NextResponse.json({ error: '"file" and "recordId" are required.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      localHash    = createHash('sha256').update(buffer).digest('hex');
      fileName     = file.name;

    } else {
      const body = await request.json();
      recordId   = body.recordId;
      localHash  = body.fileHash ?? body.localHash;
      fileName   = body.fileName ?? 'document';

      if (!recordId || !localHash) {
        return NextResponse.json({ error: '"recordId" and "fileHash" required.' }, { status: 400 });
      }
    }

    const result = await verifyRecordById(recordId, localHash);

    return NextResponse.json({
      ...result,
      fileName,
      status: result.integrityMatch ? 'verified' : (result.exists ? 'tampered' : 'not_found'),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/verify-file]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
