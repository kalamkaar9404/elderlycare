'use client';
/**
 * BlockchainBadge
 * ────────────────
 * Green shield badge shown next to a verified document.
 * Shows a tooltip on hover: timestamp + truncated TX hash + PolygonScan link.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Shield, ExternalLink } from 'lucide-react';

type BadgeStatus = 'verified' | 'tampered' | 'pending' | 'not_anchored';

interface BlockchainBadgeProps {
  status:      BadgeStatus;
  txHash?:     string;
  anchoredAt?: string;
  recordId?:   string;
  compact?:    boolean;
}

function truncateHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

const STATUS_CONFIG = {
  verified: {
    icon:  ShieldCheck,
    color: '#10B981',
    bg:    '#10B98115',
    border:'#10B98140',
    label: 'Blockchain Verified',
  },
  tampered: {
    icon:  ShieldAlert,
    color: '#EF4444',
    bg:    '#EF444415',
    border:'#EF444440',
    label: 'Integrity Failed',
  },
  pending: {
    icon:  Shield,
    color: '#F59E0B',
    bg:    '#F59E0B15',
    border:'#F59E0B40',
    label: 'Anchoring…',
  },
  not_anchored: {
    icon:  Shield,
    color: '#94A3B8',
    bg:    '#94A3B815',
    border:'#94A3B840',
    label: 'Not Anchored',
  },
};

export function BlockchainBadge({
  status, txHash, anchoredAt, compact = false,
}: BlockchainBadgeProps) {
  const [showTip, setShowTip] = useState(false);
  const cfg   = STATUS_CONFIG[status];
  const Icon  = cfg.icon;

  const dateStr = anchoredAt
    ? new Date(anchoredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="relative inline-flex items-center">
      <motion.div
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 cursor-pointer select-none"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        role="status"
        aria-label={`${cfg.label}${txHash ? ` — Transaction: ${txHash.slice(0, 18)}` : ''}`}
        tabIndex={0}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
      >
        <motion.div
          animate={status === 'pending' ? { rotate: 360 } : {}}
          transition={status === 'pending' ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
        </motion.div>
        {!compact && (
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        )}
      </motion.div>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {showTip && (txHash || dateStr) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                       bg-slate-900 text-white rounded-xl shadow-2xl p-3 min-w-[240px]"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>

              {dateStr && (
                <div className="text-xs text-slate-300">
                  <span className="text-slate-500">Anchored: </span>
                  {dateStr}
                </div>
              )}

              {txHash && (
                <div className="text-xs text-slate-300 flex items-center gap-1">
                  <span className="text-slate-500">TX: </span>
                  <span className="font-mono">{truncateHash(txHash)}</span>
                </div>
              )}

              {txHash && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  View on PolygonScan
                </a>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4
                            border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
