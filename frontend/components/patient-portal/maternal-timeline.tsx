'use client';
/**
 * MaternalTimeline
 * ─────────────────
 * Visual pregnancy health timeline showing week-by-week milestones,
 * lab checkpoints, and blockchain-anchored document events.
 */

import { motion } from 'framer-motion';
import {
  Heart, Activity, FileText, ShieldCheck, Baby,
  Stethoscope, FlaskConical, Calendar,
} from 'lucide-react';
import { BlockchainBadge } from './blockchain-badge';
import type { VaultDocument } from './document-vault';

interface MaternalTimelineProps {
  pregnancyWeek: number;
  documents:     VaultDocument[];
}

interface TimelineEvent {
  week:        number;
  type:        'milestone' | 'lab' | 'appointment' | 'document';
  title:       string;
  description: string;
  icon:        React.ElementType;
  color:       string;
  done:        boolean;
  doc?:        VaultDocument;
}

function buildTimeline(week: number, docs: VaultDocument[]): TimelineEvent[] {
  const base: Omit<TimelineEvent, 'done'>[] = [
    { week: 8,  type: 'appointment', title: '1st Prenatal Visit',   description: 'Blood tests, urine, BP baseline', icon: Stethoscope, color: '#6B8E6F' },
    { week: 12, type: 'lab',         title: 'First Trimester Screen', description: 'NT scan + blood markers',        icon: FlaskConical, color: '#20B2AA' },
    { week: 16, type: 'lab',         title: 'Quadruple Screen',       description: 'AFP, hCG, estriol, inhibin',     icon: FlaskConical, color: '#20B2AA' },
    { week: 20, type: 'milestone',   title: 'Anatomy Scan',           description: 'Detailed fetal ultrasound',      icon: Baby,         color: '#EC4899' },
    { week: 24, type: 'lab',         title: 'Glucose Challenge',      description: '1-hour GCT screening',           icon: Activity,     color: '#F59E0B' },
    { week: 28, type: 'milestone',   title: '3rd Trimester Begins',   description: 'Weekly monitoring starts',       icon: Heart,        color: '#EF4444' },
    { week: 32, type: 'lab',         title: 'Growth Ultrasound',      description: 'Fetal weight & position',        icon: Baby,         color: '#EC4899' },
    { week: 36, type: 'appointment', title: 'Group B Strep Test',     description: 'GBS culture swab',              icon: Stethoscope,  color: '#6B8E6F' },
    { week: 40, type: 'milestone',   title: 'Due Date',               description: 'Expected delivery week',        icon: Baby,         color: '#10B981' },
  ];

  const events: TimelineEvent[] = base.map(e => ({ ...e, done: week >= e.week }));

  // Inject verified documents as timeline entries
  docs.forEach(doc => {
    events.push({
      week:        week,
      type:        'document',
      title:       doc.fileName,
      description: `Anchored on Polygon Amoy · TX: ${doc.txHash.slice(0, 12)}…`,
      icon:        FileText,
      color:       doc.status === 'verified' ? '#10B981' : '#EF4444',
      done:        true,
      doc,
    });
  });

  return events.sort((a, b) => a.week - b.week);
}

export function MaternalTimeline({ pregnancyWeek, documents }: MaternalTimelineProps) {
  const events = buildTimeline(pregnancyWeek, documents);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#6B8E6F]" />
          <h3 className="text-sm font-bold text-foreground">Maternal Health Timeline</h3>
        </div>
        <span className="text-xs font-semibold text-[#20B2AA] bg-[#20B2AA]/10 px-2.5 py-1 rounded-full">
          Week {pregnancyWeek}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6B8E6F] to-[#20B2AA]"
          initial={{ width: 0 }}
          animate={{ width: `${(pregnancyWeek / 40) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#20B2AA] shadow-sm"
          initial={{ left: 0 }}
          animate={{ left: `calc(${(pregnancyWeek / 40) * 100}% - 7px)` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Week 1</span><span>Week 13 (T1)</span><span>Week 27 (T2)</span><span>Week 40</span>
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
                    Wk {event.week}
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
