/**
 * POST /api/blockchain/anchor-file
 * ──────────────────────────────────
 * Anchors a document's SHA-256 hash on the MedicalIntegrity contract.
 *
 * Body: FormData  { file: File, patientId: string, docType?: string }
 *  OR   JSON      { recordId: string, fileHash: string, fileName: string }
 *
 * Returns: { recordId, fileHash, txHash, explorerUrl, fileName, anchoredAt }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash }               from 'crypto';
import { writeFile, mkdir }         from 'fs/promises';
import { join, extname }            from 'path';
import { randomBytes }              from 'crypto';
import { anchorRecordById }         from '@/lib/blockchain';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let recordId: string;
    let fileHash: string;
    let fileName: string;
    let fileUrl:  string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // ── File upload path ────────────────────────────────────────────
      const formData  = await request.formData();
      const file      = formData.get('file') as File | null;
      const patientId = (formData.get('patientId') as string) ?? 'unknown';
      const docType   = (formData.get('docType')   as string) ?? 'document';

      if (!file) {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File exceeds 10 MB.' }, { status: 413 });
      }

      const buffer  = Buffer.from(await file.arrayBuffer());
      fileHash      = createHash('sha256').update(buffer).digest('hex');
      fileName      = file.name;
      recordId      = `${patientId}-${docType}-${Date.now()}`;

      // Save file to disk
      await mkdir(UPLOAD_DIR, { recursive: true });
      const ext      = extname(file.name) || '.bin';
      const safeName = `${randomBytes(12).toString('hex')}${ext}`;
      await writeFile(join(UPLOAD_DIR, safeName), buffer);
      fileUrl = `/uploads/${safeName}`;

    } else {
      // ── Pre-hashed path (JSON) ──────────────────────────────────────
      const body = await request.json();
      recordId   = body.recordId;
      fileHash   = body.fileHash;
      fileName   = body.fileName ?? 'document';

      if (!recordId || !fileHash) {
        return NextResponse.json({ error: '"recordId" and "fileHash" required.' }, { status: 400 });
      }
      if (!/^[0-9a-f]{64}$/i.test(fileHash)) {
        return NextResponse.json({ error: 'Invalid fileHash — must be 64-char hex.' }, { status: 400 });
      }
    }

    // ── Anchor on-chain ─────────────────────────────────────────────
    const result = await anchorRecordById(recordId, fileHash);

    if (!result) {
      return NextResponse.json(
        { error: 'Blockchain anchoring failed. Check INTEGRITY_CONTRACT_ADDRESS and ADMIN_PRIVATE_KEY in .env.local.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success:     true,
      recordId:    result.recordId,
      fileHash:    result.fileHash,
      txHash:      result.txHash,
      explorerUrl: result.explorerUrl,
      isUpdate:    result.isUpdate,
      fileName,
      fileUrl,
      anchoredAt:  new Date().toISOString(),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/anchor-file]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
