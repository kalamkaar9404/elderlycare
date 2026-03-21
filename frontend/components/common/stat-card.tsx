'use client';

import { Card } from '@/components/ui/card';
import { MedicalStatus } from '@/lib/medical-colors';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: MedicalStatus;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
  isUrgent?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  status,
  icon,
  trend,
  className,
  isUrgent = false,
}: StatCardProps) {
  const statusColor = {
    safe: 'text-[#20B2AA]',
    attention: 'text-[#F59E0B]',
    urgent: 'text-[#DC2626]',
  };

  const statusBg = {
    safe: 'border-[#20B2AA]/30',
    attention: 'border-[#F59E0B]/30',
    urgent: 'border-[#DC2626]/50 animate-vital-urgent',
  };

  return (
    <Card
      className={cn(
        'p-4 bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-200',
        status && statusBg[status],
        isUrgent && 'animate-vital-urgent',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground font-semibold tracking-wider">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-2xl font-bold tracking-tight',
              status && statusColor[status]
            )}
          >
            {value}
          </span>
          {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
        </div>
        {trend && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-lg">{trend.direction === 'up' ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)} this week</span>
          </div>
        )}
      </div>
    </Card>
  );
}
