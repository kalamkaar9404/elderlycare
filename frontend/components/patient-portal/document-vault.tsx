'use client';
/**
 * DocumentVault
 * ──────────────
 * Full-featured document upload component with blockchain anchoring.
 * 1. User selects a PDF/Image file
 * 2. Client computes SHA-256 hash via Web Crypto API
 * 3. File + hash POST to /api/blockchain/anchor-file
 * 4. Contract anchors the hash on Polygon Amoy
 * 5. Document appears in the vault list with a BlockchainBadge
 * 6. "Verify Authenticity" re-uploads file → compares hash → toast
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence }        from 'framer-motion';
import { useToast }                       from '@/hooks/use-toast';
import { BlockchainBadge }               from './blockchain-badge';
import {
  FileText, ImageIcon, FileUp, Loader2, ShieldCheck,
  RefreshCw, ExternalLink, X, Trash2, Eye,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface VaultDocument {
  id:          string;
  fileName:    string;
  fileType:    string;
  fileSize:    number;
  fileHash:    string;
  fileUrl?:    string;
  recordId:    string;
  txHash:      string;
  explorerUrl: string;
  anchoredAt:  string;
  status:      'verified' | 'tampered' | 'pending';
  file?:       File;   // kept in memory for re-verification
}

interface DocumentVaultProps {
  patientId:   string;
  onDocAdded?: (doc: VaultDocument) => void;
  documents:   VaultDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<VaultDocument[]>>;
}

type UploadPhase = 'idle' | 'selected' | 'hashing' | 'anchoring' | 'done' | 'error';

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp,.doc,.docx';

function formatBytes(b: number) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ type }: { type: string }) {
  return type.startsWith('image/')
    ? <ImageIcon className="h-5 w-5 text-[#20B2AA]" />
    : <FileText  className="h-5 w-5 text-[#6B8E6F]" />;
}

/** Compute SHA-256 of a File using the Web Crypto API (browser-native, no library needed) */
async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function DocumentVault({ patientId, onDocAdded, documents, setDocuments }: DocumentVaultProps) {
  const [phase, setPhase]     = useState<UploadPhase>('idle');
  const [file, setFile]       = useState<File | null>(null);
  const [docType, setDocType] = useState('lab_report');
  const [error, setError]     = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const { toast }             = useToast();

  const reset = () => {
    setPhase('idle'); setFile(null); setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = useCallback((f: File) => {
    if (f.size > 10 * 1024 * 1024) { setError('File too large (max 10 MB)'); setPhase('error'); return; }
    setFile(f); setError(null); setPhase('selected');
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    try {
      // Step 1 — hash
      setPhase('hashing');
      const fileHash = await sha256File(file);

      // Step 2 — anchor
      setPhase('anchoring');
      const formData = new FormData();
      formData.append('file',       file);
      formData.append('patientId',  patientId);
      formData.append('docType',    docType);

      const res  = await fetch('/api/blockchain/anchor-file', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Anchor failed');

      const newDoc: VaultDocument = {
        id:          data.recordId,
        fileName:    file.name,
        fileType:    file.type,
        fileSize:    file.size,
        fileHash:    data.fileHash,
        fileUrl:     data.fileUrl,
        recordId:    data.recordId,
        txHash:      data.txHash,
        explorerUrl: data.explorerUrl,
        anchoredAt:  data.anchoredAt,
        status:      'verified',
        file,
      };

      setDocuments(prev => [newDoc, ...prev]);
      onDocAdded?.(newDoc);
      setPhase('done');

      toast({
        title: '🔐 Document Anchored on Blockchain!',
        description: `${file.name} — TX: ${data.txHash.slice(0, 18)}…`,
      });

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setPhase('error');
    }
  };

  /** Re-hash the file and compare against on-chain hash */
  const handleVerify = async (doc: VaultDocument) => {
    if (!doc.file) {
      toast({ title: 'File not in memory', description: 'Re-upload to verify.', variant: 'destructive' });
      return;
    }

    setVerifying(doc.id);
    try {
      const localHash = await sha256File(doc.file);
      const res  = await fetch('/api/blockchain/verify-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: doc.recordId, fileHash: localHash, fileName: doc.fileName }),
      });
      const result = await res.json();

      if (result.integrityMatch) {
        toast({ title: '✅ Integrity Verified!', description: `${doc.fileName} — Hash matches on-chain record.` });
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'verified' } : d));
      } else if (result.exists) {
        toast({
          title: '🚨 Data Tampering Detected!',
          description: `${doc.fileName} — Hash mismatch! File may have been modified.`,
          variant: 'destructive',
        });
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'tampered' } : d));
      } else {
        toast({ title: 'Record Not Found', description: 'This document was not found on the blockchain.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Verification Failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setVerifying(null);
    }
  };

  const handleRemove = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  return (
    <div className="space-y-4">

      {/* ── Upload zone ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              className="border-2 border-dashed border-[#6B8E6F]/40 rounded-2xl p-6 text-center
                         hover:border-[#6B8E6F]/70 hover:bg-[#6B8E6F]/5 transition-all cursor-pointer group"
              onClick={() => inputRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onDragOver={e => e.preventDefault()}
              role="button"
              aria-label="Upload a medical document to anchor on the blockchain"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && inputRef.current?.click()}
            >
              <motion.div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg,#6B8E6F22,#20B2AA22)' }}
                whileHover={{ scale: 1.08 }}>
                <FileUp className="h-6 w-6 text-[#6B8E6F]" />
              </motion.div>
              <p className="text-sm font-semibold text-foreground mb-1">Secure Document Upload</p>
              <p className="text-xs text-muted-foreground mb-2">PDF, Image · Max 10 MB</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#10B981] font-medium">SHA-256 hashed & anchored to Polygon Amoy</span>
              </div>
              <p className="text-xs text-[#6B8E6F] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to browse or drag & drop
              </p>
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED} className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </motion.div>
        )}

        {phase === 'selected' && file && (
          <motion.div key="selected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-silk rounded-2xl border-white/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#6B8E6F15,#20B2AA15)' }}>
                <FileTypeIcon type={file.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button onClick={reset} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {/* Doc type selector */}
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E6F]/40">
              <option value="lab_report">Lab Report</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="prescription">Prescription</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="other">Other</option>
            </select>
            <motion.button
              className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6B8E6F,#20B2AA)' }}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={handleUpload}>
              <ShieldCheck className="h-4 w-4" />
              Anchor to Blockchain
            </motion.button>
          </motion.div>
        )}

        {(phase === 'hashing' || phase === 'anchoring') && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-silk rounded-2xl border-white/30 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-[#6B8E6F] animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  {phase === 'hashing' ? 'Computing SHA-256 hash…' : 'Anchoring on Polygon Amoy…'}
                </p>
                <p className="text-xs text-muted-foreground">{file?.name}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA]"
                animate={{ width: phase === 'hashing' ? '40%' : '90%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }} />
            </div>
            {phase === 'anchoring' && (
              <p className="text-xs text-center text-[#6B8E6F] font-medium">
                Waiting for blockchain confirmation (~5s)…
              </p>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="glass-silk rounded-2xl border-[#10B981]/30 p-4 text-center space-y-2">
            <ShieldCheck className="h-8 w-8 text-[#10B981] mx-auto" />
            <p className="text-sm font-bold text-[#10B981]">Document Anchored!</p>
            <p className="text-xs text-muted-foreground">Permanently recorded on Polygon Amoy</p>
            <button onClick={reset} className="text-xs text-[#6B8E6F] hover:underline font-medium">
              Upload another document
            </button>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-silk rounded-2xl border-red-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-red-600">Upload failed</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <button onClick={reset} className="text-xs text-[#6B8E6F] hover:underline font-medium">Try again</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Document list ────────────────────────────────────────────── */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Secured Documents ({documents.length})
          </p>
          {documents.map(doc => (
            <motion.div key={doc.id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="glass-silk rounded-xl border-white/30 p-3 space-y-2">
              {/* Header row */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6B8E6F15,#20B2AA15)' }}>
                  <FileTypeIcon type={doc.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</p>
                </div>
                <BlockchainBadge
                  status={doc.status}
                  txHash={doc.txHash}
                  anchoredAt={doc.anchoredAt}
                  compact
                />
                <button onClick={() => handleRemove(doc.id)}
                  className="p-1 rounded-lg hover:bg-red-50 transition-colors group">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-500" />
                </button>
              </div>

              {/* TX info */}
              <div className="text-xs text-muted-foreground font-mono bg-slate-50/80 rounded-lg px-2 py-1.5 flex items-center justify-between gap-2">
                <span className="truncate">TX: {doc.txHash.slice(0, 20)}…</span>
                <a href={doc.explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-purple-500 hover:text-purple-700 shrink-0 flex items-center gap-1 font-sans font-medium">
                  <ExternalLink className="h-3 w-3" />
                  PolygonScan
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleVerify(doc)}
                  disabled={verifying === doc.id || !doc.file}
                  className="flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5
                             bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25
                             hover:bg-[#10B981]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.97 }}>
                  {verifying === doc.id
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</>
                    : <><RefreshCw className="h-3.5 w-3.5" /> Verify Authenticity</>}
                </motion.button>

                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1
                               bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
