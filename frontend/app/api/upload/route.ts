/**
 * POST /api/upload
 * ─────────────────
 * Accepts a medical document upload as multipart/form-data.
 * In this demo it stores files in /public/uploads/ locally.
 * In production, swap writeFile for S3/GCS upload.
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed.` },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds the 10 MB limit.' },
        { status: 413 }
      );
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate a safe filename
    const ext       = extname(file.name) || '.bin';
    const safeName  = `${randomBytes(12).toString('hex')}${ext}`;
    const filePath  = join(UPLOAD_DIR, safeName);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const url = `/uploads/${safeName}`;
    console.log(`[/api/upload] Saved: ${safeName} (${file.size} bytes, type: ${file.type})`);

    return NextResponse.json({
      success:  true,
      filename: safeName,
      original: file.name,
      size:     file.size,
      type:     file.type,
      url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
