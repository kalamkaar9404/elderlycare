'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  CheckCircle2,
  Link2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type VerifyState =
  | 'idle'
  | 'hashing'
  | 'fetching'
  | 'matched'
  | 'tampered'
  | 'not_found'
  | 'anchoring'
  | 'error';

interface IntegrityShieldProps {
  patientId:   string;
  patientName: string;
  recordData:  Record<string, unknown>;
}

// ─── Deterministic SHA-256 using Web Crypto API ───────────────────────────────
// Uses same deepSortKeys logic as hash-engine.ts and anchorMockPatient.mjs
// so hashes always match between browser and server.
function deepSortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepSortKeys);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>)
      .sort()
      .forEach(k => { sorted[k] = deepSortKeys((value as Record<string, unknown>)[k]); });
    return sorted;
  }
  return value;
}

async function generateRecordHash(data: unknown): Promise<string> {
  const canonical = JSON.stringify(deepSortKeys(data));
  const buffer    = new TextEncoder().encode(canonical);
  const digest    = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncateHash(hash: string): string {
  if (hash.length <= 24) return hash;
  return `${hash.slice(0, 16)}…${hash.slice(-8)}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function FloatingParticle({ index }: { index: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 6, height: 6,
        backgroundColor: '#20B2AA',
        left: `${15 + index * 22}%`,
        bottom: 8,
        opacity: 0.6,
      }}
      animate={{ y: [0, -40, 0], opacity: [0.6, 0.15, 0.6] }}
      transition={{ duration: 2.4 + index * 0.4, repeat: Infinity, delay: index * 0.5, ease: 'easeInOut' }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function IntegrityShield({ patientId, patientName, recordData }: IntegrityShieldProps) {
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [localHash,   setLocalHash]   = useState<string | null>(null);
  const [timestamp,   setTimestamp]   = useState<number | null>(null);
  const [anchoredAt,  setAnchoredAt]  = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [isTampered,  setIsTampered]  = useState(false);
  const [tamperedData, setTamperedData] = useState<Record<string, unknown> | null>(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [anchorTx,    setAnchorTx]    = useState<string | null>(null);

  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (verifyState === 'tampered') {
      document.body.classList.add('critical-alert-active');
    } else {
      document.body.classList.remove('critical-alert-active');
    }
    return () => { document.body.classList.remove('critical-alert-active'); };
  }, [verifyState]);

  // ── Tamper Toggle ──────────────────────────────────────────────────────────
  function handleTamperToggle() {
    if (isTampered) {
      setIsTampered(false);
      setTamperedData(null);
    } else {
      const mutated: Record<string, unknown> = JSON.parse(JSON.stringify(recordData));
      mutated.__tampered        = true;
      mutated.bloodGlucose      = 9.9;
      mutated.TAMPER_INJECTED_AT = new Date().toISOString();
      setIsTampered(true);
      setTamperedData(mutated);
    }
    // Reset verify state so tamper is visible when re-verifying
    handleReset();
  }

  // ── Verify Flow ────────────────────────────────────────────────────────────
  async function handleVerify() {
    setErrorMsg('');
    setVerifyState('hashing');

    const dataToHash = isTampered && tamperedData ? tamperedData : recordData;
    let hash: string;
    try {
      hash = await generateRecordHash(dataToHash);
    } catch {
      setErrorMsg('Failed to compute SHA-256 hash in browser.');
      setVerifyState('error');
      return;
    }
    setLocalHash(hash);

    await new Promise(r => setTimeout(r, 600));
    setVerifyState('fetching');

    try {
      const res = await fetch('/api/blockchain/verify-by-id', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ recordId: patientId, localHash: hash }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      // API returns VerifyByIdResult from blockchain.ts
      const {
        exists,
        onChainHash: chainHash,
        integrityMatch,
        timestamp:   ts,
        anchoredAt:  anchAt,
        explorerUrl: expUrl,
      } = data;

      setOnChainHash(chainHash ?? null);
      setTimestamp(ts ?? null);
      setAnchoredAt(anchAt ?? null);
      setExplorerUrl(expUrl ?? null);

      if (!exists || !chainHash) {
        setVerifyState('not_found');
      } else if (integrityMatch) {
        setVerifyState('matched');
      } else {
        setVerifyState('tampered');
      }

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setVerifyState('error');
    }
  }

  // ── Anchor Flow ────────────────────────────────────────────────────────────
  async function handleAnchor() {
    setVerifyState('anchoring');
    setErrorMsg('');
    try {
      // Compute hash before sending — anchor/route.ts requires recordId + hash OR data
      const hash = await generateRecordHash(recordData);

      const res  = await fetch('/api/blockchain/anchor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ recordId: patientId, hash }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? data.detail ?? `Server error ${res.status}`);
      }

      // Store the TX hash so we can show it after verification
      if (data.txHash) setAnchorTx(data.txHash);

      // Now auto-verify so the shield shows green immediately
      await handleVerify();

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Anchor failed. Check .env.local');
      setVerifyState('error');
    }
  }

  function handleReset() {
    setVerifyState('idle');
    setOnChainHash(null);
    setLocalHash(null);
    setTimestamp(null);
    setAnchoredAt(null);
    setExplorerUrl(null);
    setErrorMsg('');
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* ── Dev Tamper Controls ─────────────────────────────────────────── */}
      {isDev && (
        <div className="mb-3 flex flex-col gap-2">
          <button
            onClick={handleTamperToggle}
            className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isTampered ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.35)',
              color: '#DC2626',
            }}
          >
            {isTampered ? '🟢 Reset Tamper Simulation' : '🔴 Simulate Data Tamper'}
          </button>

          <AnimatePresence>
            {isTampered && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.45)', color: '#92400e' }}
              >
                ⚠️ DEMO: Data has been tampered. Click Verify to detect it.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────────── */}
      <div className="glass-silk rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,rgba(32,178,170,0.08),rgba(107,142,111,0.08))', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#20B2AA' }}>
              Integrity Shield
            </p>
            <p className="text-base font-bold text-gray-800">{patientName}</p>
            <code className="text-xs font-mono rounded px-1.5 py-0.5 mt-1 inline-block"
              style={{ background: 'rgba(32,178,170,0.10)', color: '#20B2AA', border: '1px solid rgba(32,178,170,0.25)' }}>
              {patientId}
            </code>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.28)', color: '#7c3aed' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
            Polygon Amoy
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 min-h-[280px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── IDLE ──────────────────────────────────────────────────── */}
            {verifyState === 'idle' && (
              <motion.div key="idle"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center gap-5">
                <motion.div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#20B2AA,#6B8E6F)' }}
                  animate={{ boxShadow: ['0 0 0 0px rgba(32,178,170,0.4)', '0 0 0 14px rgba(32,178,170,0.0)', '0 0 0 0px rgba(32,178,170,0.4)'], scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                  <ShieldCheck size={38} color="#fff" strokeWidth={1.8} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Blockchain Integrity Shield</h2>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#20B2AA' }}>Powered by Polygon Amoy Testnet</p>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    This patient record is cryptographically protected. Click Verify to confirm data has not been modified since it was anchored on-chain.
                  </p>
                </div>
                <motion.button onClick={handleVerify}
                  className="px-7 py-3 rounded-xl text-white font-semibold text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#20B2AA,#6B8E6F)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(32,178,170,0.45)' }}
                  whileTap={{ scale: 0.97 }}>
                  Verify Record Authenticity
                </motion.button>
              </motion.div>
            )}

            {/* ── HASHING ───────────────────────────────────────────────── */}
            {verifyState === 'hashing' && (
              <motion.div key="hashing"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-5 flex-1">
                <motion.div className="rounded-full border-4"
                  style={{ width: 64, height: 64, borderColor: 'rgba(32,178,170,0.2)', borderTopColor: '#20B2AA' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
                <p className="text-base font-semibold text-gray-700">Generating SHA-256 fingerprint…</p>
                <p className="font-mono text-xs text-gray-400 max-w-xs text-center break-all animate-pulse">
                  Computing hash via Web Crypto API…
                </p>
              </motion.div>
            )}

            {/* ── FETCHING ──────────────────────────────────────────────── */}
            {verifyState === 'fetching' && (
              <motion.div key="fetching"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-5 flex-1">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                    <Link2 size={30} style={{ color: '#20B2AA' }} strokeWidth={2} />
                  </motion.div>
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                    <Link2 size={30} style={{ color: '#6B8E6F' }} strokeWidth={2} />
                  </motion.div>
                </div>
                <p className="text-base font-semibold text-gray-700">Querying Polygon Amoy blockchain…</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-2 h-2 rounded-full"
                      style={{ background: '#20B2AA' }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── ANCHORING ─────────────────────────────────────────────── */}
            {verifyState === 'anchoring' && (
              <motion.div key="anchoring"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-5 flex-1">
                <Loader2 size={48} className="animate-spin" style={{ color: '#20B2AA' }} />
                <p className="text-base font-semibold text-gray-700">Anchoring on Polygon Amoy…</p>
                <p className="text-sm text-gray-400">Waiting for blockchain confirmation (~5–10s)</p>
              </motion.div>
            )}

            {/* ── MATCHED ───────────────────────────────────────────────── */}
            {verifyState === 'matched' && (
              <motion.div key="matched"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="relative rounded-xl overflow-hidden flex flex-col gap-4 p-5"
                style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(32,178,170,0.06))', border: '1px solid rgba(16,185,129,0.30)' }}>
                {[0, 1, 2, 3].map(i => <FloatingParticle key={i} index={i} />)}

                <div className="flex items-center gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                    <CheckCircle2 size={44} strokeWidth={1.8} style={{ color: '#059669' }} />
                  </motion.div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#065f46' }}>✅ Integrity Verified</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Anchored: {anchoredAt ?? (timestamp ? formatTimestamp(timestamp) : '—')}
                    </p>
                  </div>
                  <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#065f46' }}>
                    Hashes Match
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 w-28 shrink-0">Local Hash</span>
                    <code className="text-xs font-mono rounded px-2 py-0.5"
                      style={{ background: 'rgba(32,178,170,0.10)', color: '#20B2AA', border: '1px solid rgba(32,178,170,0.25)' }}>
                      {localHash ? truncateHash(localHash) : '—'}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 w-28 shrink-0">On-Chain Hash</span>
                    <code className="text-xs font-mono rounded px-2 py-0.5"
                      style={{ background: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>
                      {onChainHash ? truncateHash(onChainHash) : '—'}
                    </code>
                  </div>
                </div>

                {explorerUrl && (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.30)', color: '#065f46' }}>
                    View on PolygonScan <ExternalLink size={13} />
                  </a>
                )}
                <ResetLink onReset={handleReset} />
              </motion.div>
            )}

            {/* ── TAMPERED ──────────────────────────────────────────────── */}
            {verifyState === 'tampered' && (
              <motion.div key="tampered"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="rounded-xl overflow-hidden flex flex-col gap-4 p-5"
                style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(239,68,68,0.05))', border: '1px solid rgba(220,38,38,0.35)' }}>

                <div className="flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.55))' }}>
                    <ShieldX size={44} strokeWidth={1.8} color="#DC2626" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-black leading-tight" style={{ color: '#DC2626' }}>
                      ⚠️ WARNING: Data Tampering Detected!
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      On-chain record does not match current data
                    </p>
                  </div>
                  <motion.span className="ml-auto px-3 py-1 rounded-full text-xs font-black"
                    style={{ background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(220,38,38,0.40)', color: '#DC2626' }}
                    animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
                    TAMPERED
                  </motion.span>
                </div>

                <div className="grid grid-cols-1 gap-2 rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 w-28 shrink-0 pt-0.5">
                      Local Hash<br /><span style={{ color: '#DC2626' }}>(MODIFIED)</span>
                    </span>
                    <code className="text-xs font-mono rounded px-2 py-1 flex-1 break-all"
                      style={{ background: 'rgba(220,38,38,0.10)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.30)' }}>
                      {localHash ?? '—'}
                    </code>
                  </div>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 w-28 shrink-0 pt-0.5">
                      On-Chain Hash<br /><span style={{ color: '#059669' }}>(ORIGINAL)</span>
                    </span>
                    <code className="text-xs font-mono rounded px-2 py-1 flex-1 break-all"
                      style={{ background: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>
                      {onChainHash ?? '—'}
                    </code>
                  </div>
                </div>

                <ResetLink onReset={handleReset} />
              </motion.div>
            )}

            {/* ── NOT FOUND ─────────────────────────────────────────────── */}
            {verifyState === 'not_found' && (
              <motion.div key="not_found"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl flex flex-col gap-4 p-5"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.35)' }}>
                <div className="flex items-center gap-3">
                  <ShieldAlert size={40} strokeWidth={1.8} color="#F59E0B" />
                  <div>
                    <p className="text-base font-bold" style={{ color: '#92400e' }}>
                      Record Not Yet Anchored
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      This record has not been committed to the blockchain yet.
                    </p>
                  </div>
                </div>
                <motion.button onClick={handleAnchor}
                  className="self-start px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-80 flex items-center gap-2"
                  style={{ background: '#F59E0B' }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <ShieldCheck size={16} />
                  Anchor Now
                </motion.button>
                <ResetLink onReset={handleReset} />
              </motion.div>
            )}

            {/* ── ERROR ─────────────────────────────────────────────────── */}
            {verifyState === 'error' && (
              <motion.div key="error"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl flex flex-col gap-3 p-5"
                style={{ background: 'rgba(107,114,128,0.07)', border: '1px solid rgba(107,114,128,0.25)' }}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={36} strokeWidth={1.8} color="#6b7280" />
                  <div>
                    <p className="text-base font-semibold text-gray-600">Verification Error</p>
                    <p className="text-sm text-gray-400 mt-0.5 break-all">
                      {errorMsg || 'An unexpected error occurred. Please try again.'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gray-500">Troubleshooting checklist:</p>
                  <p>• Is <code className="bg-gray-100 px-1 rounded">INTEGRITY_CONTRACT_ADDRESS</code> set in <code className="bg-gray-100 px-1 rounded">frontend/.env.local</code>?</p>
                  <p>• Is <code className="bg-gray-100 px-1 rounded">ADMIN_PRIVATE_KEY</code> set correctly?</p>
                  <p>• Is the Next.js dev server running with the latest .env?</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleVerify}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#20B2AA,#6B8E6F)' }}>
                    Retry
                  </button>
                  <ResetLink onReset={handleReset} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Anchor TX success toast */}
      <AnimatePresence>
        {anchorTx && verifyState === 'matched' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
            <span className="text-gray-600">Anchor TX:</span>
            <code className="font-mono text-xs text-green-700 flex-1 truncate">{anchorTx}</code>
            <a href={`https://amoy.polygonscan.com/tx/${anchorTx}`} target="_blank" rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-700 shrink-0">
              <ExternalLink size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResetLink({ onReset }: { onReset: () => void }) {
  return (
    <button onClick={onReset}
      className="mt-1 text-xs font-medium transition-all hover:underline self-start"
      style={{ color: '#9ca3af' }}>
      ← Reset
    </button>
  );
}
