'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Leaf, Zap, FileText, AlertTriangle, Activity,
  Users, UtensilsCrossed, ShieldCheck, TrendingUp,
  Heart, Clock, ChefHat, Droplet, Wind,
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_MEAL_ORDERS, MOCK_ALERTS, MOCK_PENDING_PLANS } from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { staggerContainerVariants, slideUpVariants } from '@/lib/luxury-animations';
import { VideoCard } from '@/components/common/video-card';
import { FloatingHearts, HappyElderlyIllustration, ElderlyCoupleIllustration, ElderlyHealthIllustration } from '@/components/elderly/elderly-illustrations';
import { CornerDecoration, HeartDivider, Sparkle, WellnessIcon } from '@/components/elderly/decorative-elements';

// ── Healthy eating videos — defined as search queries (always works) ──────────
const HEALTH_VIDEOS = [
  {
    title: 'Nutrition During Pregnancy — Foods to Eat & Avoid',
    description: 'What to eat in each trimester for a healthy baby and mother.',
    duration: '~8 min',
    channel: 'Health Education',
    tag: 'Pregnancy',
    tagColor: '#E8B4A0',
    searchQuery: 'pregnancy nutrition foods to eat avoid trimester',
    youtubeId: 'da1vvigy5tQ',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640&q=80',
    emoji: '🤰',
    gradientFrom: '#E8B4A0',
    gradientTo: '#6B8E6F',
  },
  {
    title: 'Healthy Eating Habits for Chronic Disease Prevention',
    description: 'Diet strategies for managing diabetes, hypertension, and CKD.',
    duration: '~10 min',
    channel: 'Clinical Nutrition',
    tag: 'Chronic Care',
    tagColor: '#20B2AA',
    searchQuery: 'healthy eating habits chronic illness diabetes hypertension diet',
    youtubeId: 'dBnniua6-oM',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80',
    emoji: '🥗',
    gradientFrom: '#20B2AA',
    gradientTo: '#6B8E6F',
  },
];

// ── Nutrition impact statistics ───────────────────────────────────────────────
const NUTRITION_STATS = [
  {
    stat: '52%',
    label: 'of pregnant women in India are anaemic due to poor nutrition',
    source: 'NFHS-5, 2021',
    color: '#E8B4A0',
    icon: '🤰',
  },
  {
    stat: '3×',
    label: 'higher risk of low birth weight with iron/folate deficiency',
    source: 'WHO, 2023',
    color: '#DC2626',
    icon: '⚠️',
  },
  {
    stat: '80%',
    label: 'of Type-2 diabetes cases can be delayed with proper diet',
    source: 'Lancet, 2022',
    color: '#6B8E6F',
    icon: '🩺',
  },
  {
    stat: '2.4×',
    label: 'higher hypertension risk with poor dietary habits',
    source: 'AHA, 2023',
    color: '#F59E0B',
    icon: '💊',
  },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, color }: { value: number; color: string }) {
  return (
    <motion.span
      className="text-4xl font-black tabular-nums"
      style={{ color }}
      initial={{ opacity: 0, y: 12, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
    >
      {value}
    </motion.span>
  );
}

// VideoCard component imported from @/components/common/video-card

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const activePatient  = MOCK_PATIENTS[0];
  const criticalAlerts = MOCK_ALERTS.filter((a) => a.type === 'critical');
  const preparingOrder = MOCK_MEAL_ORDERS.find((o) => o.status === 'preparing');
  const router = useRouter();
  const [approveClicked, setApproveClicked] = useState(false);

  const KPI_DATA = [
    { label: 'Patients',          value: MOCK_PATIENTS.length,        color: '#6B8E6F', bg: 'from-[#6B8E6F]/15 to-[#6B8E6F]/5',    icon: <Users className="h-5 w-5" />,        border: 'border-[#6B8E6F]/25' },
    { label: 'Active Orders',     value: MOCK_MEAL_ORDERS.length,     color: '#F59E0B', bg: 'from-[#F59E0B]/15 to-[#F59E0B]/5',    icon: <UtensilsCrossed className="h-5 w-5" />, border: 'border-[#F59E0B]/25' },
    { label: 'Awaiting Approval', value: MOCK_PENDING_PLANS.length,   color: '#E8B4A0', bg: 'from-[#E8B4A0]/30 to-[#E8B4A0]/10',   icon: <ShieldCheck className="h-5 w-5" />,  border: 'border-[#E8B4A0]/40' },
    { label: 'Critical Alerts',   value: criticalAlerts.length,       color: '#DC2626', bg: 'from-[#DC2626]/10 to-[#DC2626]/5',    icon: <AlertTriangle className="h-5 w-5" />, border: 'border-[#DC2626]/25' },
  ];

  return (
    <motion.div
      className="space-y-8 relative"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Subtle floating hearts background */}
      <FloatingHearts className="fixed inset-0 opacity-8 pointer-events-none" />
      
      {/* ── Hero banner with elderly illustrations ──────────────────── */}
      <motion.div variants={slideUpVariants} className="relative overflow-hidden rounded-3xl p-8 md:p-10"
        style={{ background: 'linear-gradient(135deg, rgba(107,142,111,0.18) 0%, rgba(32,178,170,0.14) 50%, rgba(232,180,160,0.18) 100%)' }}>

        {/* Animated orbs */}
        {[
          { size: 280, x: '-10%', y: '-40%', color: 'rgba(107,142,111,0.12)' },
          { size: 220, x: '80%',  y: '-20%', color: 'rgba(32,178,170,0.10)'  },
          { size: 180, x: '40%',  y: '60%',  color: 'rgba(232,180,160,0.14)' },
        ].map((orb, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color }}
            animate={{ scale: [1, 1.12, 1], x: [0, 8, 0], y: [0, -6, 0] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Elderly couple illustration on the right side */}
        <motion.div 
          className="absolute right-4 bottom-0 w-48 h-48 md:w-56 md:h-56 hidden lg:block opacity-80"
          animate={{ 
            y: [0, -12, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <ElderlyCoupleIllustration />
        </motion.div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Happy elderly illustration on the left */}
            <motion.div 
              className="hidden md:block w-24 h-24 flex-shrink-0"
              animate={{ 
                y: [0, -10, 0],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <HappyElderlyIllustration />
            </motion.div>
            <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6B8E6F,#20B2AA)' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Leaf className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B8E6F]">
                MedNutri Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gradient-text-nurture leading-tight mb-2">
              Nurturing Health,<br />One Meal at a Time
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Integrated maternal care, community nutrition, and clinical oversight — powered by AI and secured on-chain.
            </p>
            </div>
          </div>

          {/* Live status pills */}
          <div className="flex flex-col gap-2 shrink-0">
            {[
              { icon: <Activity className="h-4 w-4" />, label: 'All Systems Nominal', color: '#20B2AA' },
              { icon: <Heart className="h-4 w-4" />,    label: `${activePatient.name} monitored`, color: '#E8B4A0' },
              { icon: <ShieldCheck className="h-4 w-4" />, label: 'Blockchain Active', color: '#6B8E6F' },
            ].map(({ icon, label, color }) => (
              <motion.span key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold glass-silk border-white/40"
                style={{ color }}
                whileHover={{ x: 3 }}
              >
                {icon} {label}
                <span className="ml-auto h-2 w-2 rounded-full animate-pulse" style={{ background: color }} />
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── KPI tiles ─────────────────────────────────────────────────── */}
      <motion.div variants={slideUpVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map(({ label, value, color, bg, icon, border }) => (
          <motion.div
            key={label}
            className={`glass-silk rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border}`}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}22` }}>
                <span style={{ color }}>{icon}</span>
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <AnimatedNumber value={value} color={color} />
            <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Three-column layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Col 1: The Patient ──────────────────────────────────────── */}
        <motion.div variants={slideUpVariants} className="space-y-4">

          {/* Patient card */}
          <Card className="p-6 glass-silk rounded-2xl border-white/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12"
              style={{ background: 'radial-gradient(circle, rgba(107,142,111,0.12), transparent)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Active Patient</h3>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6B8E6F] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
                </span>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6B8E6F,#20B2AA)' }}>
                  {activePatient.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{activePatient.name}</p>
                  <p className="text-sm text-muted-foreground">Age {activePatient.age} · {activePatient.status}</p>
                </div>
              </div>

              {/* Pregnancy progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-[#6B8E6F]">Pregnancy Progress</span>
                  <span className="font-bold text-foreground">Week {activePatient.pregnancyWeek} / 40</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full progress-wave"
                    style={{ '--wave-duration': '2s' } as React.CSSProperties}
                    initial={{ width: 0 }}
                    animate={{ width: `${(activePatient.pregnancyWeek / 40) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>

              {/* Vitals row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Glucose', value: '7.2', unit: 'mmol', icon: <Droplet className="h-3.5 w-3.5" />, color: '#20B2AA' },
                  { label: 'BP',      value: '130/85', unit: 'mmHg', icon: <Activity className="h-3.5 w-3.5" />, color: '#6B8E6F' },
                  { label: 'SpO₂',   value: '98%',  unit: '',     icon: <Wind className="h-3.5 w-3.5" />, color: '#E8B4A0' },
                ].map(({ label, value, unit, icon, color }) => (
                  <div key={label} className="p-2.5 rounded-xl text-center"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                    <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
                <Activity className="h-4 w-4 text-[#20B2AA]" />
                <span className="text-xs text-muted-foreground">Smartwatch Sync Active</span>
                <span className="ml-auto h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
              </div>
            </div>
          </Card>

          {/* Scan button → navigates to patient portal */}
          <motion.button
            className="w-full h-12 rounded-2xl font-semibold text-white glow-pulse-sage flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6B8E6F, #20B2AA)' }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/patient-portal')}
          >
            <Activity className="h-5 w-5" />
            View Patient Portal
          </motion.button>

          {/* Meal plan card */}
          <Card className="p-5 glass-silk rounded-2xl border-white/30">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-4 w-4 text-[#6B8E6F]" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Today's Meal Plan</h3>
            </div>
            <div className="space-y-2">
              {[
                { time: '8:00 AM',  meal: 'Ragi Porridge',    cal: 280, color: '#6B8E6F' },
                { time: '1:00 PM',  meal: 'Spinach Dal Bowl', cal: 350, color: '#20B2AA' },
                { time: '7:00 PM',  meal: 'Millet Upma',      cal: 320, color: '#E8B4A0' },
              ].map(({ time, meal, cal, color }, i) => (
                <motion.div key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                  whileHover={{ x: 3 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground w-14">{time}</span>
                    <span className="text-sm font-medium text-foreground">{meal}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color }}>{cal} cal</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Daily</span>
              <span className="text-sm font-black text-[#6B8E6F]">2,400 kcal</span>
            </div>
          </Card>
        </motion.div>

        {/* ── Col 2: Healthy Eating Videos + Nutrition Stats ────────────── */}
        <motion.div variants={slideUpVariants} className="space-y-4">

          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#E8B4A0,#20B2AA)' }}>
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Healthy Eating Habits</h2>
              <p className="text-xs text-muted-foreground">Evidence-based guidance for patients & caregivers</p>
            </div>
            <Badge className="ml-auto bg-[#E8B4A0]/20 text-[#c4806a] border border-[#E8B4A0]/40 text-xs">
              {HEALTH_VIDEOS.length} Videos
            </Badge>
          </div>

          {/* Video tiles */}
          {HEALTH_VIDEOS.map((video, i) => (
            <VideoCard
              key={video.title}
              {...video}
              index={i}
            />
          ))}

          {/* ── Nutrition Impact Stats + Charts ───────────────────────── */}
          <div className="pt-1 space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#DC2626]" />
              <p className="text-sm font-bold text-foreground">Why Nutrition Matters</p>
              <span className="text-xs text-muted-foreground">— impact of poor diet</span>
            </div>

            {/* Big stat cards — 2 rows */}
            <div className="grid grid-cols-2 gap-2">
              {NUTRITION_STATS.map(({ stat, label, source, color, icon }, idx) => (
                <motion.div
                  key={stat}
                  className="glass-silk rounded-2xl p-4 border-white/30 flex flex-col gap-1.5"
                  style={{ borderTop: `3px solid ${color}` }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.4 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-2xl font-black" style={{ color }}>{stat}</span>
                  </div>
                  <p className="text-[11px] text-foreground/85 leading-snug font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground">— {source}</p>
                </motion.div>
              ))}
            </div>

            {/* Bar chart: malnutrition impact by condition */}
            <div className="glass-silk rounded-2xl p-4 border-white/30">
              <p className="text-xs font-bold text-foreground mb-1">Risk Increase with Poor Nutrition (%)</p>
              <p className="text-[10px] text-muted-foreground mb-3">vs. well-nourished baseline</p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={[
                    { name: 'Anaemia', value: 52, fill: '#E8B4A0' },
                    { name: 'Low Birth Wt', value: 68, fill: '#DC2626' },
                    { name: 'Diabetes Risk', value: 80, fill: '#6B8E6F' },
                    { name: 'Hypertension', value: 44, fill: '#F59E0B' },
                    { name: 'Preeclampsia', value: 35, fill: '#20B2AA' },
                  ]}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                  barSize={18}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#888' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    formatter={(v: number) => [`${v}% higher risk`, '']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.95)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: '#E8B4A0' },
                      { fill: '#DC2626' },
                      { fill: '#6B8E6F' },
                      { fill: '#F59E0B' },
                      { fill: '#20B2AA' },
                    ].map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radial chart: global malnutrition prevalence */}
            <div className="glass-silk rounded-2xl p-4 border-white/30">
              <p className="text-xs font-bold text-foreground mb-0.5">Global Malnutrition — Affected Populations</p>
              <p className="text-[10px] text-muted-foreground mb-2">Source: WHO Global Nutrition Report 2023</p>
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart
                  innerRadius="25%"
                  outerRadius="90%"
                  data={[
                    { name: 'Stunting (children)', value: 22, fill: '#6B8E6F' },
                    { name: 'Anaemia (women)', value: 30, fill: '#E8B4A0' },
                    { name: 'Overweight adults', value: 39, fill: '#F59E0B' },
                    { name: 'Wasting (children)', value: 7, fill: '#DC2626' },
                  ]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 9, color: '#666' }}>{v}</span>}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}% globally`, '']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.95)' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* ── Col 3: The Guardian ──────────────────────────────────────── */}
        <motion.div variants={slideUpVariants} className="space-y-4">

          {/* Alert panel */}
          <Card className="p-5 glass-silk rounded-2xl border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#20B2AA]" />
                <h3 className="font-bold">Guardian Panel</h3>
              </div>
              {criticalAlerts.length > 0 && (
                <motion.span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DC2626] text-white"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {criticalAlerts.length} Critical
                </motion.span>
              )}
            </div>

            <AnimatePresence>
              {criticalAlerts.length > 0 ? criticalAlerts.slice(0, 3).map((a, i) => (
                <motion.div key={a.id}
                  className="mb-2 p-3 rounded-xl border-l-4"
                  style={{ background: '#DC262608', borderLeftColor: '#DC2626', borderTopColor: '#DC262615', borderRightColor: '#DC262615', borderBottomColor: '#DC262615' }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] animate-medical-pulse" />
                    <p className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">Critical Alert</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {a.timestamp instanceof Date ? a.timestamp.toLocaleTimeString() : ''}
                  </p>
                </motion.div>
              )) : (
                <motion.div key="clear"
                  className="p-4 text-center rounded-xl bg-[#20B2AA]/8 border border-[#20B2AA]/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <ShieldCheck className="h-6 w-6 mx-auto text-[#20B2AA] mb-1.5" />
                  <p className="text-sm font-semibold text-[#20B2AA]">All Clear</p>
                  <p className="text-xs text-muted-foreground">No critical alerts</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Approve button with glow + ripple */}
          <div className="relative overflow-hidden rounded-2xl">
            <motion.button
              className="relative w-full h-14 rounded-2xl font-bold text-white glow-pulse-teal flex items-center justify-center gap-2 text-base overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #20B2AA, #6B8E6F)' }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setApproveClicked(true); setTimeout(() => router.push('/doc-monitor'), 900); }}
            >
              {approveClicked ? (
                <motion.span
                  className="flex items-center gap-2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <ShieldCheck className="h-5 w-5" /> Plan Approved!
                </motion.span>
              ) : (
                <><Zap className="h-5 w-5" /> Approve Meal Plan</>
              )}
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 shimmer-sweep pointer-events-none"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['-200% center', '200% center'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </motion.button>
          </div>

          {/* 7-day vitals sparkbars */}
          <Card className="p-5 glass-silk rounded-2xl border-white/30">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-[#6B8E6F]" />
              <h3 className="font-bold text-sm uppercase tracking-wide">7-Day Vitals Snapshot</h3>
            </div>
            {[
              { label: 'Blood Glucose (mmol/L)', data: [4.2,5.1,4.8,5.3,4.9,5.2,5.0], color: '#6B8E6F', days: ['M','T','W','T','F','S','S'] },
              { label: 'SpO₂ (%)',               data: [98,97.5,98.2,97.8,98.1,97.9,98.0], color: '#20B2AA', days: ['M','T','W','T','F','S','S'] },
            ].map(({ label, data, color, days }) => (
              <div key={label} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <span className="text-xs font-bold" style={{ color }}>
                    {data[data.length - 1]}
                  </span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {data.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className="w-full rounded-t-md"
                        style={{ background: `linear-gradient(to top, ${color}, ${color}99)` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(v / Math.max(...data)) * 100}%` }}
                        transition={{ delay: i * 0.07, duration: 0.55, ease: 'easeOut' }}
                      />
                      <span className="text-[9px] text-muted-foreground">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Blockchain status */}
          <motion.div
            className="p-4 glass-silk rounded-2xl border-[#20B2AA]/25 flex items-center gap-3"
            whileHover={{ y: -2 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#20B2AA20,#6B8E6F20)' }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck className="h-5 w-5 text-[#20B2AA]" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#20B2AA]">Blockchain Integrity</p>
              <p className="text-[10px] text-muted-foreground">All meal plans hashed to Polygon Amoy</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
