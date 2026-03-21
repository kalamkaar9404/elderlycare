import { Badge } from '@/components/ui/badge';
import { MEDICAL_COLORS, MedicalStatus } from '@/lib/medical-colors';
import { cn } from '@/lib/utils';

interface MedicalBadgeProps {
  status: MedicalStatus;
  label: string;
  className?: string;
  variant?: 'solid' | 'outlined';
}

export function MedicalBadge({ status, label, className, variant = 'outlined' }: MedicalBadgeProps) {
  const colors = MEDICAL_COLORS[status.toUpperCase() as keyof typeof MEDICAL_COLORS];
  
  const variantClasses = {
    solid: cn(
      'rounded-full font-semibold text-white border-0',
      status === 'safe' && 'bg-gradient-to-r from-[#00A896] to-[#1ABBA8] shadow-md shadow-[#00A896]/30',
      status === 'attention' && 'bg-gradient-to-r from-[#F7B733] to-[#F9C855] shadow-md shadow-[#F7B733]/30 text-slate-900',
      status === 'urgent' && 'bg-gradient-to-r from-[#D1345B] to-[#E85276] shadow-md shadow-[#D1345B]/40'
    ),
    outlined: cn(
      'border rounded-full font-medium',
      colors.bg,
      colors.text,
      colors.border
    )
  };

  return (
    <Badge
      className={cn(variantClasses[variant], className)}
      variant={variant === 'solid' ? 'default' : 'outline'}
    >
      {label}
    </Badge>
  );
}
