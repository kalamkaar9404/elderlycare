'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Patient } from '@/lib/mock-data';
import { BlockchainBadge, BlockchainStatus } from '@/components/common/blockchain-badge';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient?: (patient: Patient) => void;
}

// ── Per-patient verify hook ───────────────────────────────────────────────────
function usePatientChainStatus(patient: Patient): BlockchainStatus {
  const [status, setStatus] = useState<BlockchainStatus>({ state: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setStatus({ state: 'securing' });

    const verify = async () => {
      const recordData = {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        pregnancyWeek: patient.pregnancyWeek,
        riskLevel: patient.riskLevel,
      };
      try {
        const res = await fetch('/api/blockchain/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: recordData }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (json?.verified) {
          setStatus({
            state: 'verified',
            timestamp: json.timestamp,
            blockNumber: json.blockNumber,
            anchoredAt: json.anchoredAt,
            explorerUrl: json.explorerUrl,
          });
        } else {
          setStatus({ state: 'failed', reason: 'Record not found on-chain' });
        }
      } catch {
        if (!cancelled) setStatus({ state: 'failed', reason: 'Verification request failed' });
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [patient.id]);

  return status;
}

// ── Single patient row ────────────────────────────────────────────────────────
function PatientRow({
  patient,
  isSelected,
  onSelect,
}: {
  patient: Patient;
  isSelected: boolean;
  onSelect: (p: Patient) => void;
}) {
  const chainStatus = usePatientChainStatus(patient);

  const riskIcon = {
    high:   <AlertCircle  className="h-5 w-5 text-[#DC2626]" />,
    medium: <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />,
    low:    <CheckCircle  className="h-5 w-5 text-[#20B2AA]" />,
  }[patient.riskLevel] ?? null;

  const riskHoverBg = {
    high:   'hover:bg-[#DC2626]/5 border-[#DC2626]/30',
    medium: 'hover:bg-[#F59E0B]/5 border-[#F59E0B]/30',
    low:    'hover:bg-[#20B2AA]/5 border-[#20B2AA]/30',
  }[patient.riskLevel] ?? '';

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Button
        variant="ghost"
        onClick={() => onSelect(patient)}
        className={`w-full justify-start p-3 h-auto transition-all border ${
          isSelected
            ? 'border-[#6B8E6F] bg-[#6B8E6F]/10'
            : `border-border ${riskHoverBg}`
        }`}
      >
        <div className="flex items-start gap-3 w-full text-left">
          <div className="pt-0.5 flex-shrink-0">{riskIcon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{patient.name}</p>
            <p className="text-xs text-muted-foreground">
              Week {patient.pregnancyWeek} · Age {patient.age}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {patient.riskLevel} Risk · {patient.status}
            </p>
          </div>
        </div>
      </Button>

      {/* Blockchain Proof badge — indented below the patient row */}
      <div className="pl-10 pb-0.5">
        <BlockchainBadge status={chainStatus} />
      </div>
    </motion.div>
  );
}

// ── Patient list ──────────────────────────────────────────────────────────────
export function PatientList({ patients, selectedPatientId, onSelectPatient }: PatientListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Patients</h3>
      <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
        {patients.map((p) => (
          <PatientRow
            key={p.id}
            patient={p}
            isSelected={p.id === selectedPatientId}
            onSelect={(pt) => onSelectPatient?.(pt)}
          />
        ))}
      </div>
    </div>
  );
}
