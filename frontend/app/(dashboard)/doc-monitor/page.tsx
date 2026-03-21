'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';

// Typed dynamic imports — preserves prop inference without SSR
const PatientList   = dynamic(() => import('@/components/doc-monitor/patient-list').then(m   => ({ default: m.PatientList })),   { ssr: false });
const MedicalGraphs = dynamic(() => import('@/components/doc-monitor/medical-graphs').then(m => ({ default: m.MedicalGraphs })), { ssr: false });
const AlertPanel    = dynamic(() => import('@/components/doc-monitor/alert-panel').then(m    => ({ default: m.AlertPanel })),    { ssr: false });

import { ApprovalQueue } from '@/components/doc-monitor/approval-queue';
import { IntegrityShield } from '@/components/doc-monitor/integrity-shield';
import { Card } from '@/components/ui/card';
import {
  MOCK_PATIENTS,
  MOCK_VITALS_HISTORY,
  MOCK_ALERTS,
  MOCK_PENDING_PLANS,
  Patient,
} from '@/lib/mock-data';
import { staggerContainerVariants, slideUpVariants } from '@/lib/luxury-animations';

export default function DocMonitorPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient>(MOCK_PATIENTS[0]);

  const patientAlerts = MOCK_ALERTS.filter(
    (a) => a.patientId === selectedPatient.id
  );
  const hasCritical = patientAlerts.some((a) => a.type === 'critical' && !a.resolved);

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div variants={slideUpVariants} className="space-y-4 pb-4 border-b border-white/20">
        <h1 className="text-4xl font-bold"
          style={{ background:'linear-gradient(135deg,#DC2626,#20B2AA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Doctor Monitor
        </h1>
        <p className="text-muted-foreground">
          Review patient status, approve meal plans, and manage alerts
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
            hasCritical
              ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/25 animate-breathing-pulse'
              : 'bg-[#20B2AA]/10 text-[#20B2AA] border-[#20B2AA]/25'
          }`}>
            {patientAlerts.filter(a => !a.resolved).length} Active Alerts
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#6B8E6F]/10 text-[#6B8E6F] border border-[#6B8E6F]/25">
            {MOCK_PATIENTS.length} Patients Under Care
          </span>
        </div>
      </motion.div>

      {/* ── Themed Hero: Clinical Monitoring ─────────────────────────── */}
      <motion.div variants={slideUpVariants}>
        <div className="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden glass-silk">
          <div className="absolute inset-0 bg-gradient-to-br from-[#20B2AA]/20 via-[#6B8E6F]/15 to-[#E8B4A0]/20" />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 70% 30%, rgba(32,178,170,0.28) 0%, transparent 55%),
                radial-gradient(circle at 20% 70%, rgba(107,142,111,0.22) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(232,180,160,0.15) 0%, transparent 60%)
              `,
            }}
          />
          {/* Pulse rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[#20B2AA]/20"
              style={{ width: `${60 + i * 40}px`, height: `${60 + i * 40}px`, right: `${5}%`, top: '50%', marginTop: `-${30 + i * 20}px` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
            />
          ))}
          <div className="absolute inset-0 flex items-end p-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-[#20B2AA]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#20B2AA] bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  Clinical Oversight
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                Real-time Clinical Monitoring
              </h2>
              <p className="text-sm text-slate-600/90 max-w-lg">
                Advanced vital tracking and blockchain-verified audit trails for optimal patient outcomes.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Master-Detail Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-max">
        <motion.div variants={slideUpVariants}>
          <Card className="p-6 lg:col-span-1 glass-silk rounded-2xl border-white/30">
            <PatientList
              patients={MOCK_PATIENTS}
              selectedPatientId={selectedPatient.id}
              onSelectPatient={setSelectedPatient}
            />
          </Card>
        </motion.div>

        <motion.div variants={slideUpVariants} className="lg:col-span-3 space-y-6">
          {/* Patient summary */}
          <Card className="p-5 glass-silk rounded-2xl border-[#6B8E6F]/20">
            <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
              {[
                { label: 'Week', value: `${selectedPatient.pregnancyWeek} / 40` },
                { label: 'Age', value: `${selectedPatient.age} years` },
                {
                  label: 'Risk Level',
                  value: selectedPatient.riskLevel,
                  className: selectedPatient.riskLevel === 'high' ? 'text-[#DC2626] font-bold capitalize'
                    : selectedPatient.riskLevel === 'medium' ? 'text-[#F59E0B] font-bold capitalize'
                    : 'text-[#20B2AA] font-bold capitalize',
                },
              ].map(({ label, value, className }) => (
                <div key={label}>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
                  <p className={`font-semibold mt-0.5 ${className ?? ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <MedicalGraphs data={MOCK_VITALS_HISTORY} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AlertPanel alerts={patientAlerts} />
            <ApprovalQueue plans={MOCK_PENDING_PLANS} />
          </div>

          {/* ── Blockchain Integrity Shield ───────────────────────── */}
          <IntegrityShield
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            recordData={{
              patientId:     selectedPatient.id,
              name:          selectedPatient.name,
              age:           selectedPatient.age,
              pregnancyWeek: selectedPatient.pregnancyWeek,
              riskLevel:     selectedPatient.riskLevel,
              status:        selectedPatient.status,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
