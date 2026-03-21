'use client';

/**
 * Elderly-Friendly UI Demo Page
 * 
 * Demonstrates all the elderly-friendly components, illustrations,
 * and animations in action.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, FileText, Calendar, Shield, Phone } from 'lucide-react';
import {
  ElderlyWelcomeBanner,
  ElderlyQuickActions,
  ElderlyHealthTipCard,
  ElderlyEmptyState,
  ElderlySuccessMessage,
  ElderlyLoadingState,
  ElderlyInfoBanner
} from '@/components/elderly/elderly-welcome';
import {
  ElderlyCoupleIllustration,
  HappyElderlyIllustration,
  ElderlyHealthIllustration,
  FloatingHearts,
  FloatingStars
} from '@/components/elderly/elderly-illustrations';
import {
  ElderlyCard,
  ElderlyButton,
  ElderlyBadge,
  ElderlySection
} from '@/components/elderly/elderly-wrapper';

export default function ElderlyDemoPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Decorative background */}
      <div className="fixed inset-0 elderly-bg-pattern pointer-events-none opacity-50" />
      <FloatingHearts className="fixed inset-0 opacity-20" />

      {/* Welcome Banner */}
      <ElderlyWelcomeBanner userName="Sarah" greeting="Welcome Back" />

      {/* Success Message */}
      {showSuccess && (
        <ElderlySuccessMessage
          message="Your health information has been saved securely!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Info Banners */}
      <div className="space-y-4">
        <ElderlyInfoBanner
          type="info"
          title="Your Next Appointment"
          message="You have a checkup scheduled for tomorrow at 2:00 PM with Dr. Johnson."
        />
        
        <ElderlyInfoBanner
          type="success"
          title="All Records Verified"
          message="Your medical documents are securely stored and verified on the blockchain."
        />
      </div>

      {/* Quick Actions */}
      <ElderlySection title="Quick Actions" icon={<Heart />}>
        <ElderlyQuickActions />
      </ElderlySection>

      {/* Health Tip */}
      <ElderlyHealthTipCard
        tip="Remember to drink at least 8 glasses of water today! Staying hydrated is important for your health."
        icon="💧"
      />

      {/* Illustrations Showcase */}
      <ElderlySection title="Friendly Illustrations" icon={<Activity />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ElderlyCard title="Couple" className="text-center">
            <div className="w-full h-64">
              <ElderlyCoupleIllustration />
            </div>
            <p className="text-elderly-sm text-gray-600 mt-4">
              Warm and welcoming couple illustration
            </p>
          </ElderlyCard>

          <ElderlyCard title="Happy" className="text-center">
            <div className="w-full h-64">
              <HappyElderlyIllustration />
            </div>
            <p className="text-elderly-sm text-gray-600 mt-4">
              Celebrating success and good health
            </p>
          </ElderlyCard>

          <ElderlyCard title="Health" className="text-center">
            <div className="w-full h-64">
              <ElderlyHealthIllustration />
            </div>
            <p className="text-elderly-sm text-gray-600 mt-4">
              Focus on health and wellness
            </p>
          </ElderlyCard>
        </div>
      </ElderlySection>

      {/* Health Metrics with Animations */}
      <ElderlySection title="Your Health Today" icon={<Activity />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="elderly-card text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <Heart className="w-16 h-16 text-[#DC2626] mx-auto" strokeWidth={2.5} />
            </motion.div>
            <div className="text-elderly-3xl font-bold text-[#6B8E6F] mb-2">
              120/80
            </div>
            <div className="text-elderly-base text-gray-600 mb-3">
              Blood Pressure
            </div>
            <ElderlyBadge status="safe">Normal Range</ElderlyBadge>
          </motion.div>

          <motion.div
            className="elderly-card text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ 
                rotate: [0, 360],
                transition: { duration: 3, repeat: Infinity, ease: "linear" }
              }}
            >
              <Activity className="w-16 h-16 text-[#20B2AA] mx-auto" strokeWidth={2.5} />
            </motion.div>
            <div className="text-elderly-3xl font-bold text-[#6B8E6F] mb-2">
              72
            </div>
            <div className="text-elderly-base text-gray-600 mb-3">
              Heart Rate (bpm)
            </div>
            <ElderlyBadge status="safe">Healthy</ElderlyBadge>
          </motion.div>

          <motion.div
            className="elderly-card text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ 
                y: [0, -10, 0],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <Shield className="w-16 h-16 text-[#6B8E6F] mx-auto" strokeWidth={2.5} />
            </motion.div>
            <div className="text-elderly-3xl font-bold text-[#6B8E6F] mb-2">
              100%
            </div>
            <div className="text-elderly-base text-gray-600 mb-3">
              Records Verified
            </div>
            <ElderlyBadge status="safe">Blockchain Secured</ElderlyBadge>
          </motion.div>
        </div>
      </ElderlySection>

      {/* Interactive Demo */}
      <ElderlySection title="Try It Out" icon={<FileText />}>
        <ElderlyCard>
          <div className="text-center space-y-6">
            <p className="text-elderly-lg text-gray-700">
              Click the button below to see a friendly loading animation and success message!
            </p>
            
            {isLoading ? (
              <ElderlyLoadingState message="Saving your information..." />
            ) : (
              <ElderlyButton
                size="large"
                variant="primary"
                onClick={handleAction}
                icon={<Heart />}
              >
                Save My Health Information
              </ElderlyButton>
            )}
          </div>
        </ElderlyCard>
      </ElderlySection>

      {/* Empty State Example */}
      <ElderlySection title="Empty State Example" icon={<Calendar />}>
        <ElderlyEmptyState
          message="You don't have any appointments scheduled yet. Would you like to book one?"
          actionText="Schedule Appointment"
          onAction={() => alert('Booking appointment...')}
        />
      </ElderlySection>

      {/* Animation Examples */}
      <ElderlySection title="Gentle Animations" icon={<Activity />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="elderly-card text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                y: [0, -15, 0],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              🎈
            </motion.div>
            <p className="text-elderly-sm font-semibold">Float</p>
          </div>

          <div className="elderly-card text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                transition: { duration: 1.5, repeat: Infinity }
              }}
            >
              💓
            </motion.div>
            <p className="text-elderly-sm font-semibold">Pulse</p>
          </div>

          <div className="elderly-card text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                rotate: [0, 15, -15, 0],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              👋
            </motion.div>
            <p className="text-elderly-sm font-semibold">Wave</p>
          </div>

          <div className="elderly-card text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                rotate: 360,
                transition: { duration: 3, repeat: Infinity, ease: "linear" }
              }}
            >
              ⭐
            </motion.div>
            <p className="text-elderly-sm font-semibold">Spin</p>
          </div>
        </div>
      </ElderlySection>

      {/* Contact Section */}
      <ElderlyCard className="bg-gradient-to-br from-[#6B8E6F]/10 to-[#20B2AA]/10">
        <div className="flex items-center gap-6">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
          >
            <Phone className="w-16 h-16 text-[#6B8E6F]" strokeWidth={2.5} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-elderly-xl font-bold text-[#6B8E6F] mb-2">
              Need Help?
            </h3>
            <p className="text-elderly-base text-gray-700 mb-4">
              Our friendly support team is here to assist you anytime.
            </p>
            <ElderlyButton variant="primary" icon={<Phone />}>
              Call Support: 1-800-HEALTH
            </ElderlyButton>
          </div>
        </div>
      </ElderlyCard>
    </div>
  );
}
