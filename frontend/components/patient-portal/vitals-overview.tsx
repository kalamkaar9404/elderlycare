'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Vitals } from '@/lib/mock-data';
import { Droplet, Zap, Scale, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ElderlyHealthIllustration } from '@/components/elderly/elderly-illustrations';

// ─── 24-hour mock data ────────────────────────────────────────────────────────

const GLUCOSE_24H: { hour: number; value: number }[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: parseFloat((7.2 + (Math.sin(i * 0.9) * 0.5) + (Math.random() * 0.6 - 0.3)).toFixed(2)),
}));

const BP_24H: { hour: number; value: number }[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: Math.round(130 + Math.sin(i * 0.7) * 5 + (Math.random() * 6 - 3)),
}));

const WEIGHT_24H: { hour: number; value: number }[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: parseFloat((68.5 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

interface VitalCardConfig {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: 'safe' | 'attention';
  trend: 'up' | 'down' | 'stable';
  chartData: { hour: number; value: number }[];
  chartColor: string;
  chartFill: string;
}

// ─── Utility: Trend Icon ──────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-teal-500" />;
  return <Activity className="w-3.5 h-3.5 text-slate-400" />;
}

// ─── Individual Vital Card ────────────────────────────────────────────────────

function VitalCard({ config }: { config: VitalCardConfig }) {
  const [isHovered, setIsHovered] = useState(false);

  const borderColor =
    config.status === 'safe'
      ? 'border-[#20B2AA]/40'
      : 'border-[#F59E0B]/40';

  const statusBadgeColor =
    config.status === 'safe'
      ? 'bg-[#20B2AA]/10 text-[#20B2AA]'
      : 'bg-amber-50 text-amber-600';

  return (
    <motion.div
      className={`relative backdrop-blur-xl bg-white/80 border ${borderColor} rounded-2xl shadow-lg overflow-hidden cursor-pointer`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={{ height: isHovered ? 'auto' : undefined }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      layout
    >
      {/* Subtle top-edge accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{
          background:
            config.status === 'safe'
              ? 'linear-gradient(90deg, #6B8E6F, #20B2AA)'
              : 'linear-gradient(90deg, #F59E0B, #E8B4A0)',
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background:
                  config.status === 'safe'
                    ? 'linear-gradient(135deg, rgba(107,142,111,0.15), rgba(32,178,170,0.15))'
                    : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(232,180,160,0.12))',
              }}
            >
              {config.icon}
            </div>
            <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
              {config.label}
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeColor}`}
          >
            {config.status === 'safe' ? 'Normal' : 'Watch'}
          </span>
        </div>

        {/* Value row */}
        <div className="flex items-end gap-1.5 mt-1">
          <span className="text-2xl font-bold text-slate-800 leading-none">
            {config.value}
          </span>
          <span className="text-xs text-slate-400 mb-0.5">{config.unit}</span>
          <span className="ml-auto flex items-center gap-1">
            <TrendIcon trend={config.trend} />
          </span>
        </div>

        {/* Expanded chart — appears on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 96 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="text-[10px] text-slate-400 mt-3 mb-1 font-medium tracking-wide">
                24-Hour Trend
              </p>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart
                  data={config.chartData}
                  margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`fill-${config.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={config.chartColor}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={config.chartColor}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: `1px solid ${config.chartColor}30`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '4px 8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ color: config.chartColor, fontWeight: 600 }}
                    formatter={(val: number) => [val, config.unit]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.chartColor}
                    strokeWidth={1.8}
                    fill={`url(#fill-${config.id})`}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface VitalsOverviewProps {
  vitals: Vitals;
  pregnancyWeek?: number; // Made optional for elderly health context
}

function VitalsOverview({ vitals }: VitalsOverviewProps) {

  // ── Vital card configurations ──────────────────────────────────────────────
  const vitalCards: VitalCardConfig[] = [
    {
      id: 'glucose',
      label: 'Blood Glucose',
      value: String(vitals.bloodGlucose ?? '7.2'),
      unit: 'mmol/L',
      icon: <Droplet className="w-4 h-4 text-[#20B2AA]" />,
      status: (vitals.bloodGlucose ?? 7.2) > 8.5 ? 'attention' : 'safe',
      trend: 'stable',
      chartData: GLUCOSE_24H,
      chartColor: '#20B2AA',
      chartFill: 'rgba(32,178,170,0.2)',
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      value: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
      unit: 'mmHg',
      icon: <Zap className="w-4 h-4 text-[#F59E0B]" />,
      status: 'attention',
      trend: 'up',
      chartData: BP_24H,
      chartColor: '#F59E0B',
      chartFill: 'rgba(245,158,11,0.2)',
    },
    {
      id: 'weight',
      label: 'Weight',
      value: String(vitals.weight ?? '68.5'),
      unit: 'kg',
      icon: <Scale className="w-4 h-4 text-[#6B8E6F]" />,
      status: 'safe',
      trend: 'stable',
      chartData: WEIGHT_24H,
      chartColor: '#6B8E6F',
      chartFill: 'rgba(107,142,111,0.2)',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* ── Section header with elderly illustration ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12"
              animate={{ 
                y: [0, -6, 0],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <ElderlyHealthIllustration />
            </motion.div>
            <h2 className="text-lg font-semibold text-slate-700 tracking-tight">
              Your Health Vitals
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Last updated · just now
          </span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VITAL CARDS GRID                                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {vitalCards.map((config) => (
            <VitalCard key={config.id} config={config} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="text-[11px] text-slate-300 text-center">
          Hover each card to reveal 24-hour trend · Values auto-refresh every 5 min
        </p>
      </div>
    </>
  );
}

export default VitalsOverview;
export { VitalsOverview };
