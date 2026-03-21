'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldX, Link2, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ── Discriminated union — single source of truth used by every consumer ──────
export type BlockchainStatus =
  | { state: 'idle' }
  | { state: 'securing' }
  | { state: 'verified'; timestamp: number; blockNumber: number; anchoredAt: string; explorerUrl: string; txHash?: string }
  | { state: 'failed'; reason?: string };

export interface BlockchainBadgeProps {
  status: BlockchainStatus;
}

// ── Securing: two chain-link icons spinning in opposite directions ────────────
function SecuringBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-semibold select-none
                      bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
      <span className="relative inline-flex items-center gap-0.5">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-flex"
        >
          <Link2 className="h-3 w-3" />
        </motion.span>
        <motion.span
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-flex"
        >
          <Link2 className="h-3 w-3" />
        </motion.span>
      </span>
      Securing on-chain…
    </span>
  );
}

// ── Verified: spring entrance + ShieldCheck with wiggle on hover ──────────────
function VerifiedBadge({
  timestamp, blockNumber, anchoredAt, explorerUrl, txHash,
}: {
  timestamp: number; blockNumber: number; anchoredAt: string; explorerUrl: string; txHash?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     text-xs font-semibold cursor-pointer select-none
                     bg-[#20B2AA]/10 text-[#20B2AA] border border-[#20B2AA]/30
                     hover:bg-[#20B2AA]/20 transition-colors"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <motion.span
            className="inline-flex"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </motion.span>
          Verified Integrity
        </motion.span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="p-3 max-w-[280px] space-y-2 bg-white text-foreground
                   border border-border/60 shadow-xl rounded-xl"
      >
        <div className="flex items-center gap-1.5 text-[#20B2AA] font-semibold text-xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          Blockchain Proof · Polygon Amoy
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span className="font-medium text-foreground">Anchored</span>
            <span>{anchoredAt}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium text-foreground">Block</span>
            <span>#{blockNumber.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium text-foreground">Unix ts</span>
            <span>{timestamp}</span>
          </div>
          {txHash && (
            <div className="flex justify-between gap-4">
              <span className="font-medium text-foreground">Tx</span>
              <span className="truncate max-w-[140px] font-mono text-[10px]">
                {txHash.slice(0, 10)}…{txHash.slice(-6)}
              </span>
            </div>
          )}
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#20B2AA] text-xs hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
          View on PolygonScan
        </a>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Failed ────────────────────────────────────────────────────────────────────
function FailedBadge({ reason }: { reason?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          text-xs font-semibold cursor-default select-none
                          bg-slate-100 text-slate-500 border border-slate-200">
          <ShieldX className="h-3 w-3" />
          Unverified
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs">
        {reason ?? 'This record could not be verified on-chain.'}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export function BlockchainBadge({ status }: BlockchainBadgeProps) {
  return (
    <AnimatePresence mode="wait">
      {status.state === 'idle' ? null : status.state === 'securing' ? (
        <motion.div key="securing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SecuringBadge />
        </motion.div>
      ) : status.state === 'verified' ? (
        <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <VerifiedBadge {...status} />
        </motion.div>
      ) : (
        <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <FailedBadge reason={status.reason} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
