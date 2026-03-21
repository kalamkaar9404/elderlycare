'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface TreatmentPlan {
  id: string;
  patientName: string;
  diagnosis: string;
  treatment: string;
  requestedBy: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const MOCK_PLANS: TreatmentPlan[] = [
  {
    id: 'plan-001',
    patientName: 'Evelyn Hart',
    diagnosis: 'Hypertensive Crisis',
    treatment: 'IV Labetalol 20mg + Continuous BP monitoring',
    requestedBy: 'Dr. Anaya Patel',
    date: 'Mar 6, 2026',
    priority: 'high',
  },
  {
    id: 'plan-002',
    patientName: 'Marcus Chen',
    diagnosis: 'Type 2 Diabetes — HbA1c 9.4%',
    treatment: 'Metformin 1000mg BID + Lifestyle counselling',
    requestedBy: 'Dr. Liam Torres',
    date: 'Mar 6, 2026',
    priority: 'medium',
  },
  {
    id: 'plan-003',
    patientName: 'Sophia Okafor',
    diagnosis: 'Community-Acquired Pneumonia',
    treatment: 'Amoxicillin-Clavulanate 875mg + Chest physio',
    requestedBy: 'Dr. Priya Nair',
    date: 'Mar 6, 2026',
    priority: 'medium',
  },
  {
    id: 'plan-004',
    patientName: 'James Whitfield',
    diagnosis: 'Acute Lumbar Radiculopathy',
    treatment: 'Naproxen 500mg + PT referral + MRI scheduling',
    requestedBy: 'Dr. Anaya Patel',
    date: 'Mar 6, 2026',
    priority: 'low',
  },
];

const CONFETTI_COLORS = ['#6B8E6F', '#20B2AA', '#E8B4A0', '#F59E0B', '#20B2AA', '#6B8E6F'];

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', color: '#DC2626', bg: 'bg-red-50', border: 'border-red-200' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { label: 'Low', color: '#6B8E6F', bg: 'bg-green-50', border: 'border-green-200' },
};

/* ─────────────────────────────────────────────
   CONFETTI BURST
───────────────────────────────────────────── */
function ConfettiBurst() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.cos((i / 12) * 2 * Math.PI) * (60 + Math.random() * 60),
    y: Math.sin((i / 12) * 2 * Math.PI) * (60 + Math.random() * 60),
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.15,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [1, 1.4, 0.6],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.9,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUCCESS RIPPLE
───────────────────────────────────────────── */
function SuccessRipple() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <motion.div
        className="h-full w-full rounded-full bg-[#20B2AA]/30"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────── */
interface PlanCardProps {
  plan: TreatmentPlan;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
}

function PlanCard({ plan, index, onApprove, onReject, isApproving }: PlanCardProps) {
  const priority = PRIORITY_CONFIG[plan.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, height: 0 }}
      transition={{
        layout: { duration: 0.35, ease: 'easeInOut' },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        height: { duration: 0.4 },
        y: { delay: index * 0.07, duration: 0.4, ease: 'easeOut' },
      }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden"
    >
      {/* Glassmorphism card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 p-5 shadow-md backdrop-blur-xl transition-shadow hover:shadow-lg">
        {/* Priority accent stripe */}
        <div
          className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: priority.color }}
        />

        <div className="pl-3">
          {/* Header row */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-base font-semibold text-slate-800">
                {plan.patientName}
              </p>
              <p className="mt-0.5 truncate text-sm text-slate-500">{plan.diagnosis}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Priority badge */}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priority.bg} ${priority.border} border`}
                style={{ color: priority.color }}
              >
                {priority.label}
              </span>

              {/* Pending badge — gradient amber */}
              <Badge
                className="inline-flex items-center gap-1 rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 1px 6px rgba(245,158,11,0.35)',
                }}
              >
                <span>⏳</span>
                Pending
              </Badge>
            </div>
          </div>

          {/* Treatment info */}
          <p className="mb-3 rounded-xl bg-slate-50/80 px-3 py-2 text-sm text-slate-600 leading-relaxed">
            {plan.treatment}
          </p>

          {/* Meta row */}
          <div className="mb-4 flex items-center gap-4 text-xs text-slate-400">
            <span>
              <span className="font-medium text-slate-500">Requested by</span>{' '}
              {plan.requestedBy}
            </span>
            <span>{plan.date}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* ── APPROVE BUTTON with Teal Glow Pulse ── */}
            <div className="relative flex-1">
              <style>{`
                @keyframes glowPulse {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(32, 178, 170, 0.5); }
                  50%       { box-shadow: 0 0 20px 8px rgba(32, 178, 170, 0.2); }
                }
              `}</style>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(plan.id)}
                disabled={isApproving}
                className="relative w-full overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, #20B2AA 0%, #178F88 100%)',
                  animation: 'glowPulse 2s ease-in-out infinite',
                }}
                aria-label={`Approve treatment plan for ${plan.patientName}`}
              >
                {/* Success ripple overlay */}
                {isApproving && <SuccessRipple />}

                <span className="relative flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </span>
              </motion.button>
            </div>

            {/* Reject button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onReject(plan.id)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label={`Reject treatment plan for ${plan.patientName}`}
            >
              <X className="h-4 w-4" />
              Reject
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   ALL-APPROVED CELEBRATION
───────────────────────────────────────────── */
function AllApprovedCelebration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#20B2AA]/30 bg-gradient-to-br from-[#20B2AA]/10 via-white/80 to-[#6B8E6F]/10 px-8 py-12 text-center backdrop-blur-xl"
    >
      <ConfettiBurst />

      <motion.div
        animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, #20B2AA22, #6B8E6F22)' }}
      >
        <span className="text-3xl" role="img" aria-label="Party popper">
          🎉
        </span>
      </motion.div>

      <div>
        <div className="mb-1 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-[#20B2AA]" />
          <p className="text-xl font-bold text-slate-800">All plans approved!</p>
          <Sparkles className="h-5 w-5 text-[#6B8E6F]" />
        </div>
        <p className="text-sm text-slate-500">
          The approval queue is clear. Great work today.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

interface ApprovalPlanProp {
  id: string;
  patientName: string;
  mealCount: number;
  totalCalories: number;
  generatedAt?: Date;
  status?: string;
}

interface ApprovalQueueProps {
  plans?: ApprovalPlanProp[];
}

function ApprovalQueue({ plans: externalPlans }: ApprovalQueueProps = {}) {
  const [plans, setPlans] = useState<TreatmentPlan[]>(MOCK_PLANS);
  // externalPlans accepted for API compatibility; component uses its own rich mock data
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingPlans = plans;
  const allApproved = pendingPlans.length === 0;

  const handleApprove = useCallback((id: string) => {
    setApprovingId(id);

    // After ripple animation (600ms), remove card
    setTimeout(() => {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setApprovingId(null);
    }, 600);
  }, []);

  const handleReject = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Approval Queue</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Treatment plans awaiting your review
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!allApproved && (
              <motion.div
                key="count-badge"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
              >
                {pendingPlans.length}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan list / empty state */}
        <AnimatePresence mode="popLayout">
          {allApproved ? (
            <motion.div key="all-approved">
              <AllApprovedCelebration />
            </motion.div>
          ) : (
            <motion.div key="plan-list" className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {pendingPlans.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isApproving={approvingId === plan.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer stats */}
        {!allApproved && (
          <motion.p
            layout
            className="mt-4 text-center text-xs text-slate-400"
          >
            {pendingPlans.length} plan{pendingPlans.length !== 1 ? 's' : ''} pending review
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default ApprovalQueue;
export { ApprovalQueue };
