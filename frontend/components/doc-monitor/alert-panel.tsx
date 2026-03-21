'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert } from '@/lib/mock-data';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AlertSeverity = 'critical' | 'warning' | 'info';

// ─── Design tokens per severity ───────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    borderColor: string;
    bgColor: string;
    labelColor: string;
    labelText: string;
    icon: React.ReactNode;
  }
> = {
  critical: {
    borderColor: '#DC2626',
    bgColor: 'rgba(220,38,38,0.08)',
    labelColor: '#DC2626',
    labelText: 'CRITICAL',
    icon: <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />,
  },
  warning: {
    borderColor: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.08)',
    labelColor: '#F59E0B',
    labelText: 'WARNING',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#F59E0B' }} />,
  },
  info: {
    borderColor: '#20B2AA',
    bgColor: 'rgba(32,178,170,0.08)',
    labelColor: '#20B2AA',
    labelText: 'INFO',
    icon: <Info className="w-4 h-4 flex-shrink-0" style={{ color: '#20B2AA' }} />,
  },
};

// ─── Pulsing dot for critical alerts ─────────────────────────────────────────

function CriticalPulse() {
  return (
    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: '#DC2626' }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: '#DC2626' }}
      />
    </span>
  );
}

// ─── Single Alert Card ────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: Alert;
  index: number;
}

function AlertCard({ alert, index }: AlertCardProps) {
  const severity = (alert.type ?? 'info') as AlertSeverity;
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;

  return (
    <motion.div
      layout
      key={alert.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative rounded-xl overflow-hidden cursor-pointer select-none"
      style={{
        borderLeft: `4px solid ${cfg.borderColor}`,
        backgroundColor: cfg.bgColor,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          {/* Icon */}
          {cfg.icon}

          {/* Severity label */}
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: cfg.labelColor }}
          >
            {cfg.labelText}
          </span>

          {/* Pulsing dot for critical */}
          {severity === 'critical' && !alert.resolved && (
            <span className="ml-0.5">
              <CriticalPulse />
            </span>
          )}

          {/* Resolved badge */}
          {alert.resolved && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-500">
              <CheckCircle className="w-3 h-3" />
              Resolved
            </span>
          )}
        </div>

        {/* Message */}
        <p className="text-sm text-slate-700 font-medium leading-snug mt-1 pr-4">
          {alert.message}
        </p>

        {/* Footer: timestamp + patient info */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {alert.timestamp instanceof Date
              ? alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
      </div>
      </div>

      {/* Right-edge glow accent for critical unresolved */}
      {severity === 'critical' && !alert.resolved && (
        <div
          className="absolute inset-y-0 right-0 w-1 rounded-r-xl"
          style={{
            background: 'linear-gradient(180deg, #DC2626, rgba(220,38,38,0.2))',
            opacity: 0.6,
          }}
        />
      )}
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-10 gap-3"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(32,178,170,0.1)' }}
      >
        <CheckCircle className="w-6 h-6" style={{ color: '#20B2AA' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-600">All Clear</p>
        <p className="text-xs text-slate-400 mt-0.5">No active alerts at this time</p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AlertPanelProps {
  alerts: Alert[];
}

function AlertPanel({ alerts }: AlertPanelProps) {
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all');

  // ── Crimson vignette effect when a critical unresolved alert exists ─────────
  const hasCriticalActive = alerts.some(
    (a) => (a.type as AlertSeverity) === 'critical' && !a.resolved
  );

  useEffect(() => {
    if (hasCriticalActive) {
      document.body.classList.add('critical-alert-active');
    } else {
      document.body.classList.remove('critical-alert-active');
    }
    return () => {
      document.body.classList.remove('critical-alert-active');
    };
  }, [hasCriticalActive]);

  // ── Filtered + sorted alerts (critical first) ──────────────────────────────
  const filteredAlerts = alerts
    .filter((a) => filter === 'all' || a.type === filter)
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
      return (order[a.type ?? 'info'] ?? 2) - (order[b.type ?? 'info'] ?? 2);
    });

  // ── Summary counts ──────────────────────────────────────────────────────────
  const counts = {
    critical: alerts.filter((a) => a.type === 'critical' && !a.resolved).length,
    warning: alerts.filter((a) => a.type === 'warning' && !a.resolved).length,
    info: alerts.filter((a) => a.type === 'info' && !a.resolved).length,
  };

  return (
    <>
      {/* ── Global styles: crimson vignette + keyframes ── */}
      <style>{`
        .critical-alert-active::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          background: radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(220, 38, 38, 0.08) 100%
          );
          animation: crimsonBreathe 4s ease-in-out infinite;
        }

        @keyframes crimsonBreathe {
          0%,  100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }
      `}</style>

      <div className="flex flex-col gap-4 h-full">
        {/* ── Panel header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-700 tracking-tight">
              Alert Monitor
            </h2>
            {hasCriticalActive && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(220,38,38,0.1)',
                  color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.25)',
                }}
              >
                LIVE
              </motion.span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {alerts.length} total · {alerts.filter((a) => !a.resolved).length} active
          </span>
        </div>

        {/* ── Summary chips ── */}
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { key: 'all', label: 'All', count: alerts.length, color: '#64748b' },
              { key: 'critical', label: 'Critical', count: counts.critical, color: '#DC2626' },
              { key: 'warning', label: 'Warning', count: counts.warning, color: '#F59E0B' },
              { key: 'info', label: 'Info', count: counts.info, color: '#20B2AA' },
            ] as const
          ).map(({ key, label, count, color }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background:
                  filter === key
                    ? `rgba(${color === '#DC2626' ? '220,38,38' : color === '#F59E0B' ? '245,158,11' : color === '#20B2AA' ? '32,178,170' : '100,116,139'},0.12)`
                    : 'rgba(248,250,252,0.8)',
                color: filter === key ? color : '#94a3b8',
                border: `1px solid ${filter === key ? `${color}40` : 'rgba(226,232,240,0.8)'}`,
              }}
            >
              {label}
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{
                  background: filter === key ? color : '#e2e8f0',
                  color: filter === key ? '#fff' : '#94a3b8',
                }}
              >
                {count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* ── Alert list ── */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 min-h-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredAlerts.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              filteredAlerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-300 text-center">
            Real-time monitoring · Updates every 30 s
          </p>
        </div>
      </div>
    </>
  );
}

export default AlertPanel;
export { AlertPanel };
