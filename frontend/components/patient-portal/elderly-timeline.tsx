'use client';
/**
 * ElderlyHealthcareTimeline
 * ──────────────────────────
 * Visual elderly health timeline showing health checkpoints,
 * preventive care milestones, and blockchain-anchored document events.
 */

import { motion } from 'framer-motion';
import {
  Heart, Activity, FileText, ShieldCheck, Pill,
  Stethoscope, FlaskConical, Calendar, Eye, Bone,
} from 'lucide-react';
import { BlockchainBadge } from './blockchain-badge';
import type { VaultDocument } from './document-vault';

interface ElderlyTimelineProps {
  age: number;
  documents: VaultDocument[];
}

interface TimelineEvent {
  month: number;
  type: 'checkup' | 'screening' | 'vaccination' | 'document';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  done: boolean;
  doc?: VaultDocument;
}

function buildElderlyTimeline(currentMonth: number, docs: VaultDocument[]): TimelineEvent[] {
  const base: Omit<TimelineEvent, 'done'>[] = [
    { month: 1, type: 'checkup', title: 'Annual Physical', description: 'Comprehensive health assessment', icon: Stethoscope, color: '#6B8E6F' },
    { month: 2, type: 'screening', title: 'Blood Work Panel', description: 'CBC, lipids, glucose, kidney function', icon: FlaskConical, color: '#20B2AA' },
    { month: 3, type: 'checkup', title: 'Vision Screening', description: 'Eye exam for glaucoma & cataracts', icon: Eye, color: '#EC4899' },
    { month: 4, type: 'vaccination', title: 'Flu Vaccine', description: 'Annual influenza immunization', icon: Pill, color: '#F59E0B' },
    { month: 6, type: 'checkup', title: 'Cardiology Check', description: 'Heart health & blood pressure monitoring', icon: Heart, color: '#EF4444' },
    { month: 7, type: 'screening', title: 'Bone Density Scan', description: 'Osteoporosis screening (DEXA)', icon: Bone, color: '#8B5CF6' },
    { month: 9, type: 'checkup', title: 'Diabetes Screening', description: 'HbA1c & glucose tolerance test', icon: Activity, color: '#20B2AA' },
    { month: 10, type: 'vaccination', title: 'Pneumonia Vaccine', description: 'Pneumococcal immunization', icon: Pill, color: '#F59E0B' },
    { month: 12, type: 'checkup', title: 'Year-End Review', description: 'Medication review & care planning', icon: Stethoscope, color: '#6B8E6F' },
  ];

  const events: TimelineEvent[] = base.map(e => ({ ...e, done: currentMonth >= e.month }));

  // Inject verified documents as timeline entries
  docs.forEach(doc => {
    events.push({
      month: currentMonth,
      type: 'document',
      title: doc.fileName,
      description: `Anchored on Polygon Amoy · TX: ${doc.txHash.slice(0, 12)}…`,
      icon: FileText,
      color: doc.status === 'verified' ? '#10B981' : '#EF4444',
      done: true,
      doc,
    });
  });

  return events.sort((a, b) => a.month - b.month);
}

export function ElderlyHealthcareTimeline({ age, documents }: ElderlyTimelineProps) {
  // Use current month (1-12) for progress
  const currentMonth = new Date().getMonth() + 1;
  const events = buildElderlyTimeline(currentMonth, documents);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#6B8E6F]" />
          <h3 className="text-sm font-bold text-foreground">Elderly Healthcare Timeline</h3>
        </div>
        <span className="text-xs font-semibold text-[#20B2AA] bg-[#20B2AA]/10 px-2.5 py-1 rounded-full">
          Age {age}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentMonth / 12) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#20B2AA] shadow-sm"
          initial={{ left: 0 }}
          animate={{ left: `calc(${(currentMonth / 12) * 100}% - 7px)` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
      </div>

      {/* Timeline entries */}
      <div className="relative mt-4 space-y-0">
        {/* Vertical line */}
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#6B8E6F]/30 to-[#20B2AA]/30" />

        {events.map((event, i) => {
          const Icon = event.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex items-start gap-4 pb-4 ${!event.done ? 'opacity-40' : ''}`}>

              {/* Circle marker */}
              <div className="relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2"
                style={{
                  background: event.done ? `${event.color}20` : '#f1f5f9',
                  borderColor: event.done ? event.color : '#e2e8f0',
                }}>
                <Icon className="h-4 w-4" style={{ color: event.done ? event.color : '#94a3b8' }} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-foreground">{event.title}</p>
                  <span className="text-xs text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {event.type === 'document' ? `Month ${event.month}` : new Date(2024, event.month - 1).toLocaleString('default', { month: 'short' })}
                  </span>
                  {event.type === 'document' && event.doc && (
                    <BlockchainBadge
                      status={event.doc.status}
                      txHash={event.doc.txHash}
                      anchoredAt={event.doc.anchoredAt}
                      compact
                    />
                  )}
                  {event.done && event.type !== 'document' && (
                    <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
