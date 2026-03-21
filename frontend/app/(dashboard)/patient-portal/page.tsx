'use client';

import { useState }          from 'react';
import { motion }            from 'framer-motion';
import { Leaf, Activity, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import dynamic               from 'next/dynamic';
import type { ComponentProps } from 'react';

import { VitalsOverview }    from '@/components/patient-portal/vitals-overview';
import { AIMealPlan }        from '@/components/patient-portal/ai-meal-plan';
import { MedicalNER }        from '@/components/patient-portal/medical-ner';
import { NutritionDonut }    from '@/components/patient-portal/nutrition-donut';
import { DocumentVault }     from '@/components/patient-portal/document-vault';
import { ElderlyHealthcareTimeline } from '@/components/patient-portal/elderly-timeline';
import { MaternalChatbot as ElderlyChatbot }    from '@/components/patient-portal/maternal-chatbot';
import { SevenDayVitals }    from '@/components/patient-portal/seven-day-vitals';
import { BlockchainBadge }   from '@/components/patient-portal/blockchain-badge';
import type { VaultDocument } from '@/components/patient-portal/document-vault';
import type { NutritionistChat as NCType } from '@/components/patient-portal/nutritionist-chat';
import { FloatingHearts, ElderlyHealthIllustration, ElderlyCoupleIllustration } from '@/components/elderly/elderly-illustrations';
import { CornerDecoration, HeartDivider, ElderlyCornerAccent } from '@/components/elderly/decorative-elements';

import {
  MOCK_PATIENTS,
  MOCK_VITALS,
  MOCK_AI_MEAL_PLAN,
  MOCK_NUTRITIONIST_MESSAGES,
} from '@/lib/mock-data';
import { staggerContainerVariants, slideUpVariants } from '@/lib/luxury-animations';

const NutritionistChat = dynamic<ComponentProps<typeof NCType>>(
  () => import('@/components/patient-portal/nutritionist-chat').then(m => ({ default: m.NutritionistChat })),
  { ssr: false }
);

export default function PatientPortalPage() {
  const patient = MOCK_PATIENTS[0];

  // Shared document state — passed down to DocumentVault & up to Timeline + Chatbot
  const [documents, setDocuments] = useState<VaultDocument[]>([]);

  // Build patient context for the AI chatbot (elderly-focused)
  const patientContext = {
    name:          patient.name,
    age:           72, // Elderly patient age
    vitals: {
      bloodPressure: `${MOCK_VITALS.bloodPressureSys}/${MOCK_VITALS.bloodPressureDia} mmHg`,
      bloodGlucose:  `${MOCK_VITALS.bloodGlucose} mmol/L`,
      weight:        `${MOCK_VITALS.weight} kg`,
      spo2:          '98%',
    },
    verifiedDocuments: documents
      .filter(d => d.status === 'verified')
      .map(d => ({ fileName: d.fileName, anchoredAt: d.anchoredAt, txHash: d.txHash })),
    anchored: documents.some(d => d.status === 'verified'),
  };

  return (
    <motion.div
      className="space-y-6 relative"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Subtle floating hearts background */}
      <FloatingHearts className="fixed inset-0 opacity-10 pointer-events-none" />
      
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div variants={slideUpVariants} className="space-y-4 pb-4 border-b border-white/20">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {/* Small elderly health illustration */}
            <motion.div 
              className="hidden md:block w-16 h-16"
              animate={{ 
                y: [0, -8, 0],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <ElderlyHealthIllustration />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold gradient-text-nurture">Patient Portal</h1>
              <p className="text-muted-foreground mt-1">
                Welcome, <span className="font-semibold text-[#6B8E6F]">{patient.name}</span>
                {' '}· Age 72 · Comprehensive Health Monitoring
              </p>
            </div>
          </div>
          {/* Blockchain status in header */}
          <div className="flex items-center gap-2 flex-wrap">
            {documents.length > 0 ? (
              <BlockchainBadge
                status={documents.every(d => d.status === 'verified') ? 'verified' : 'tampered'}
                txHash={documents[0]?.txHash}
                anchoredAt={documents[0]?.anchoredAt}
              />
            ) : (
              <span className="text-xs text-muted-foreground bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                No documents anchored yet
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#6B8E6F]/10 text-[#6B8E6F] border border-[#6B8E6F]/25">
            Health Status: Excellent
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#20B2AA]/10 text-[#20B2AA] border border-[#20B2AA]/25 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#20B2AA] animate-pulse" />
            Real-time Monitoring Active
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-600 border border-purple-200 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Polygon Amoy · Contract: 0xA3D7B8…
          </span>
        </div>
      </motion.div>

      {/* ── Hero Banner with Elderly Illustrations ──────────────────── */}
      <motion.div variants={slideUpVariants}>
        <div className="relative w-full h-40 md:h-52 rounded-3xl overflow-hidden glass-silk">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6B8E6F]/30 via-[#9CAF88]/20 to-[#E8B4A0]/25" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(107,142,111,0.35) 0%, transparent 50%),
                radial-gradient(circle at 80% 30%, rgba(32,178,170,0.25) 0%, transparent 45%),
                radial-gradient(circle at 60% 80%, rgba(232,180,160,0.30) 0%, transparent 40%)`,
            }}
          />
          
          {/* Elderly couple illustration on the right */}
          <motion.div 
            className="absolute right-4 bottom-0 w-32 h-32 md:w-40 md:h-40 hidden sm:block"
            animate={{ 
              y: [0, -8, 0],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <ElderlyCoupleIllustration />
          </motion.div>
          
          <div className="absolute inset-0 flex items-end p-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-[#6B8E6F]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E6F] bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  Immutable Health Shield · Polygon Amoy
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Your Blockchain-Protected Health Journey</h2>
              <p className="text-sm text-slate-600/90 max-w-lg mt-1">
                Every document you upload is SHA-256 hashed and anchored permanently on Polygon Amoy — tamper-proof and verifiable.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main 3-column grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">

        {/* ── Column 1: Vitals + 7-Day Snapshot + Document Vault ───────────────────── */}
        <motion.div variants={slideUpVariants} className="lg:col-span-1 space-y-4">
          <VitalsOverview vitals={MOCK_VITALS} pregnancyWeek={patient.pregnancyWeek} />

          {/* 7-Day Vitals Snapshot */}
          <SevenDayVitals />

          {/* Document Vault */}
          <div className="glass-silk rounded-2xl border-white/30 p-4 relative">
            <CornerDecoration position="top-right" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#10B98120,#6B8E6F20)' }}>
                <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Secure Document Vault</h3>
                <p className="text-xs text-muted-foreground">SHA-256 anchored to Polygon Amoy</p>
              </div>
            </div>
            <DocumentVault
              patientId={patient.id ?? 'p1'}
              documents={documents}
              setDocuments={setDocuments}
            />
          </div>
        </motion.div>

        {/* ── Column 2: Elderly Timeline + Meal Plan ──────────────────────── */}
        <motion.div variants={slideUpVariants} className="lg:col-span-1 space-y-4">

          {/* Elderly Healthcare Timeline */}
          <div className="glass-silk rounded-2xl border-white/30 p-4 relative">
            <CornerDecoration position="top-left" />
            <ElderlyHealthcareTimeline
              age={72}
              documents={documents}
            />
          </div>

          <HeartDivider className="my-4" />

          <AIMealPlan
            meals={MOCK_AI_MEAL_PLAN.meals}
            totalCalories={MOCK_AI_MEAL_PLAN.totalCalories}
            status={MOCK_AI_MEAL_PLAN.status as 'approved' | 'pending'}
          />
          <NutritionDonut carbs={280} protein={85} fats={65} fiber={35} />
        </motion.div>

        {/* ── Column 3: Elderly AI Chatbot + NER ───────────────────────────── */}
        <motion.div variants={slideUpVariants} className="lg:col-span-1 space-y-4 relative">
          {/* Decorative corner accent */}
          <ElderlyCornerAccent className="absolute -top-4 -right-4 hidden xl:block" />

          {/* Elderly AI Chatbot */}
          <ElderlyChatbot patientContext={patientContext} />

          <MedicalNER />
        </motion.div>

      </div>
    </motion.div>
  );
}
