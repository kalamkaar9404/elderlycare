'use client';

/**
 * DocumentUpload
 * ───────────────
 * A fully functional medical document upload widget for the Patient Portal.
 * - Accepts PDF, images, DOCX
 * - Shows file preview (name, size, type icon)
 * - POSTs to /api/upload (Next.js route handler) as FormData
 * - Shows upload progress, success, and error states
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ImageIcon, Upload, CheckCircle2, AlertCircle,
  X, FileUp, Loader2,
} from 'lucide-react';

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp,.doc,.docx';
const MAX_MB   = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/'))
    return <ImageIcon className="h-8 w-8 text-[#20B2AA]" />;
  return <FileText className="h-8 w-8 text-[#6B8E6F]" />;
}

export function DocumentUpload() {
  const [state, setState]       = useState<UploadState>('idle');
  const [file, setFile]         = useState<File | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [docUrl, setDocUrl]     = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState('idle');
    setFile(null);
    setError(null);
    setProgress(0);
    setDocUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = useCallback((picked: File) => {
    if (picked.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_MB} MB.`);
      setState('error');
      return;
    }
    setFile(picked);
    setError(null);
    setState('selected');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setState('uploading');
    setProgress(0);

    // Simulate progress (real upload would use XHR with onprogress)
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(timer); return 85; }
        return p + Math.random() * 15;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', 'p1');
      formData.append('documentType', 'medical_record');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      clearInterval(timer);

      if (res.ok) {
        const data = await res.json();
        setProgress(100);
        setDocUrl(data.url ?? null);
        setState('success');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Upload failed (HTTP ${res.status})`);
      }
    } catch (err: unknown) {
      clearInterval(timer);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">

        {/* ── IDLE / DROP ZONE ─────────────────────────────────────── */}
        {state === 'idle' && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative"
          >
            <div
              className="border-2 border-dashed border-[#6B8E6F]/40 rounded-2xl p-6 text-center
                         hover:border-[#6B8E6F]/70 hover:bg-[#6B8E6F]/4 transition-all duration-200
                         cursor-pointer group"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <motion.div
                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg,#6B8E6F22,#20B2AA22)' }}
                whileHover={{ scale: 1.08 }}
              >
                <FileUp className="h-6 w-6 text-[#6B8E6F]" />
              </motion.div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Upload Medical Document
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, or image · Max {MAX_MB} MB
              </p>
              <p className="text-xs text-[#6B8E6F] mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to browse or drag & drop
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="sr-only"
              onChange={handleInputChange}
            />
          </motion.div>
        )}

        {/* ── FILE SELECTED ─────────────────────────────────────────── */}
        {state === 'selected' && file && (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-silk rounded-2xl border-white/30 p-4 space-y-4"
          >
            {/* File info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#6B8E6F15,#20B2AA15)' }}>
                <FileIcon type={file.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button onClick={reset} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Upload button */}
            <motion.button
              className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6B8E6F,#20B2AA)' }}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4" />
              Upload to Patient Record
            </motion.button>
          </motion.div>
        )}

        {/* ── UPLOADING ─────────────────────────────────────────────── */}
        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-silk rounded-2xl border-white/30 p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-[#6B8E6F] animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Uploading…</p>
                <p className="text-xs text-muted-foreground truncate">{file?.name}</p>
              </div>
              <span className="text-sm font-bold text-[#6B8E6F]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full progress-wave"
                style={{ '--wave-duration': '1.2s' } as React.CSSProperties}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ───────────────────────────────────────────────── */}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-silk rounded-2xl border-[#20B2AA]/30 p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#20B2AA20' }}>
                <CheckCircle2 className="h-5 w-5 text-[#20B2AA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#20B2AA]">Document uploaded!</p>
                <p className="text-xs text-muted-foreground truncate">{file?.name}</p>
              </div>
            </div>
            {docUrl && (
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#20B2AA] hover:underline font-medium truncate"
              >
                View uploaded document →
              </a>
            )}
            <button
              onClick={reset}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Upload another document
            </button>
          </motion.div>
        )}

        {/* ── ERROR ─────────────────────────────────────────────────── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-silk rounded-2xl border-[#DC2626]/25 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#DC2626]">Upload failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full text-xs font-semibold text-[#6B8E6F] hover:text-[#6B8E6F]/80 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
