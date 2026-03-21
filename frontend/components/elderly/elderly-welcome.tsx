'use client';

/**
 * Elderly-Friendly Welcome Component
 * 
 * Warm, welcoming interface elements with friendly illustrations
 * to make elderly users feel comfortable and at ease.
 */

import { motion } from 'framer-motion';
import { Heart, Shield, FileText, Calendar, Phone, MessageCircle } from 'lucide-react';
import { 
  ElderlyCoupleIllustration, 
  HappyElderlyIllustration,
  ElderlyHealthIllustration,
  FloatingHearts,
  FloatingStars
} from './elderly-illustrations';

interface WelcomeBannerProps {
  userName?: string;
  greeting?: string;
}

export function ElderlyWelcomeBanner({ userName = 'Friend', greeting }: WelcomeBannerProps) {
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative elderly-welcome-banner overflow-hidden mb-8">
      <FloatingHearts className="opacity-30" />
      
      <div className="relative z-10 flex items-center justify-between gap-8">
        <div className="flex-1">
          <motion.h1 
            className="text-elderly-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {getGreeting()}, {userName}! 👋
          </motion.h1>
          <motion.p 
            className="text-elderly-lg opacity-95"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome to your health dashboard. We're here to help you stay healthy and informed.
          </motion.p>
        </div>
        
        <motion.div 
          className="hidden lg:block w-64 h-64"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <HappyElderlyIllustration />
        </motion.div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  color?: 'sage' | 'teal' | 'peach';
}

export function ElderlyQuickActionCard({ 
  icon, 
  title, 
  description, 
  onClick,
  color = 'sage' 
}: QuickActionCardProps) {
  const colorClasses = {
    sage: 'from-[#6B8E6F] to-[#5A7A5E]',
    teal: 'from-[#20B2AA] to-[#1A9B94]',
    peach: 'from-[#E8B4A0] to-[#D9A490]'
  };

  return (
    <motion.button
      onClick={onClick}
      className="elderly-card elderly-hover-lift text-left w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white animate-gentle-pulse`}>
          <div className="w-10 h-10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-elderly-lg font-bold text-[#6B8E6F] mb-2">
            {title}
          </h3>
          <p className="text-elderly-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function ElderlyQuickActions() {
  const actions = [
    {
      icon: <FileText className="w-full h-full" strokeWidth={2.5} />,
      title: 'View Medical Records',
      description: 'Access your health documents securely',
      color: 'sage' as const
    },
    {
      icon: <Calendar className="w-full h-full" strokeWidth={2.5} />,
      title: 'Schedule Appointment',
      description: 'Book a visit with your doctor',
      color: 'teal' as const
    },
    {
      icon: <MessageCircle className="w-full h-full" strokeWidth={2.5} />,
      title: 'Ask Health Questions',
      description: 'Chat with our AI health assistant',
      color: 'peach' as const
    },
    {
      icon: <Phone className="w-full h-full" strokeWidth={2.5} />,
      title: 'Emergency Contact',
      description: 'Quick access to help when you need it',
      color: 'sage' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ElderlyQuickActionCard {...action} />
        </motion.div>
      ))}
    </div>
  );
}

interface HealthTipCardProps {
  tip: string;
  icon?: string;
}

export function ElderlyHealthTipCard({ tip, icon = '💡' }: HealthTipCardProps) {
  return (
    <motion.div
      className="elderly-card bg-gradient-to-br from-[#E0F7F5] to-[#F0F6E8] border-2 border-[#20B2AA]/30"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-start gap-4">
        <motion.div 
          className="text-4xl"
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
          }}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h4 className="text-elderly-base font-bold text-[#6B8E6F] mb-2">
            Health Tip of the Day
          </h4>
          <p className="text-elderly-sm text-gray-700 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ElderlyEmptyState({ 
  message, 
  actionText, 
  onAction 
}: { 
  message: string; 
  actionText?: string; 
  onAction?: () => void;
}) {
  return (
    <div className="elderly-empty-state">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-48 h-48 mx-auto mb-6">
          <HappyElderlyIllustration />
        </div>
        <p className="text-elderly-lg font-semibold text-[#6B8E6F] mb-6">
          {message}
        </p>
        {actionText && onAction && (
          <motion.button
            onClick={onAction}
            className="btn-elderly-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionText}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export function ElderlySuccessMessage({ 
  message, 
  onClose 
}: { 
  message: string; 
  onClose?: () => void;
}) {
  return (
    <motion.div
      className="elderly-card bg-gradient-to-br from-[#E0F7F5] to-white border-2 border-[#20B2AA]"
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <FloatingStars className="opacity-50" />
      
      <div className="relative z-10 flex items-center gap-6">
        <motion.div 
          className="w-24 h-24"
          animate={{ 
            scale: [1, 1.1, 1],
            transition: { duration: 1, repeat: Infinity }
          }}
        >
          <HappyElderlyIllustration />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 }
              }}
            >
              <Shield className="w-8 h-8 text-[#20B2AA]" strokeWidth={2.5} />
            </motion.div>
            <h3 className="text-elderly-xl font-bold text-[#20B2AA]">
              Success!
            </h3>
          </div>
          <p className="text-elderly-base text-gray-700">
            {message}
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-elderly-base font-bold text-gray-500 hover:text-gray-700 px-4 py-2"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ElderlyLoadingState({ message = 'Loading your information...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="w-32 h-32 mb-6"
        animate={{ 
          y: [0, -15, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <ElderlyHealthIllustration />
      </motion.div>
      
      <div className="flex items-center gap-3">
        <motion.div
          className="w-4 h-4 bg-[#6B8E6F] rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
            transition: { duration: 1, repeat: Infinity, delay: 0 }
          }}
        />
        <motion.div
          className="w-4 h-4 bg-[#20B2AA] rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
            transition: { duration: 1, repeat: Infinity, delay: 0.2 }
          }}
        />
        <motion.div
          className="w-4 h-4 bg-[#E8B4A0] rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
            transition: { duration: 1, repeat: Infinity, delay: 0.4 }
          }}
        />
      </div>
      
      <p className="text-elderly-lg font-semibold text-[#6B8E6F] mt-6">
        {message}
      </p>
    </div>
  );
}

export function ElderlyInfoBanner({ 
  title, 
  message, 
  type = 'info' 
}: { 
  title: string; 
  message: string; 
  type?: 'info' | 'success' | 'warning';
}) {
  const styles = {
    info: {
      bg: 'from-[#E0F7F5] to-[#F0F9FF]',
      border: 'border-[#20B2AA]',
      icon: '💙',
      iconColor: 'text-[#20B2AA]'
    },
    success: {
      bg: 'from-[#F0F6E8] to-[#E0F7F5]',
      border: 'border-[#6B8E6F]',
      icon: '✅',
      iconColor: 'text-[#6B8E6F]'
    },
    warning: {
      bg: 'from-[#FEF3C7] to-[#FFF7ED]',
      border: 'border-[#F59E0B]',
      icon: '⚠️',
      iconColor: 'text-[#F59E0B]'
    }
  };

  const style = styles[type];

  return (
    <motion.div
      className={`elderly-card bg-gradient-to-br ${style.bg} border-2 ${style.border}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4">
        <motion.div 
          className="text-4xl"
          animate={{ 
            scale: [1, 1.15, 1],
            transition: { duration: 1.5, repeat: Infinity }
          }}
        >
          {style.icon}
        </motion.div>
        <div className="flex-1">
          <h4 className={`text-elderly-lg font-bold ${style.iconColor} mb-2`}>
            {title}
          </h4>
          <p className="text-elderly-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
