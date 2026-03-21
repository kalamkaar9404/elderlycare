// Medical Status Colors and Utilities
export const MEDICAL_COLORS = {
  SAFE: {
    bg: 'bg-[#20B2AA]/10',
    text: 'text-[#20B2AA]',
    border: 'border-[#20B2AA]/30',
    badge: 'badge-safe',
    hex: '#20B2AA',
    name: 'Teal',
  },
  ATTENTION: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/30',
    badge: 'badge-attention',
    hex: '#F59E0B',
    name: 'Amber',
  },
  URGENT: {
    bg: 'bg-[#DC2626]/10',
    text: 'text-[#DC2626]',
    border: 'border-[#DC2626]/30',
    badge: 'badge-urgent',
    hex: '#DC2626',
    name: 'Crimson',
  },
  PRIMARY: {
    bg: 'bg-[#6B8E6F]/10',
    text: 'text-[#6B8E6F]',
    border: 'border-[#6B8E6F]/30',
    hex: '#6B8E6F',
    name: 'Sage Green',
  },
};

export type MedicalStatus = 'safe' | 'attention' | 'urgent';

export const getStatusColor = (status: MedicalStatus) => {
  switch (status) {
    case 'safe':
      return MEDICAL_COLORS.SAFE;
    case 'attention':
      return MEDICAL_COLORS.ATTENTION;
    case 'urgent':
      return MEDICAL_COLORS.URGENT;
    default:
      return MEDICAL_COLORS.SAFE;
  }
};

export const getStatusBadgeClass = (status: MedicalStatus) => {
  return `${getStatusColor(status).bg} ${getStatusColor(status).text} ${getStatusColor(status).border} border rounded-full px-3 py-1 text-sm font-medium`;
};
