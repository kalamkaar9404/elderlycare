'use client';

/**
 * Decorative Elderly-Friendly Elements
 * 
 * Small illustrations and decorative elements to fill empty spaces
 * and add warmth to the interface
 */

import { motion } from 'framer-motion';

// Small corner decoration with elderly theme
export function CornerDecoration({ position = 'top-right' }: { position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }) {
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} w-8 h-8 opacity-20 pointer-events-none`}
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <path 
          d="M 20 10 Q 15 8 12 12 Q 10 15 12 18 L 20 25 L 28 18 Q 30 15 28 12 Q 25 8 20 10" 
          fill="#FFB6C1"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  );
}

// Small health icon decoration
export function HealthIconDecoration({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-6 h-6 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path 
          d="M 12 21 Q 8 18 5 15 Q 2 12 2 9 Q 2 6 4 6 Q 6 6 8 8 Q 10 10 12 13 Q 14 10 16 8 Q 18 6 20 6 Q 22 6 22 9 Q 22 12 19 15 Q 16 18 12 21" 
          fill="#DC2626"
          opacity="0.7"
        />
      </svg>
    </motion.div>
  );
}

// Tiny elderly face icon for empty states
export function TinyElderlyFace({ mood = 'happy' }: { mood?: 'happy' | 'neutral' | 'caring' }) {
  const mouthPaths = {
    happy: 'M 15 22 Q 20 26 25 22',
    neutral: 'M 15 23 L 25 23',
    caring: 'M 15 22 Q 20 25 25 22'
  };

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      {/* Head */}
      <circle cx="20" cy="20" r="16" fill="#F5D7B1" />
      {/* Gray hair */}
      <path d="M 8 16 Q 6 10 10 8 Q 14 6 20 6 Q 26 6 30 8 Q 34 10 32 16" fill="#B0B0B0" />
      {/* Eyes */}
      <circle cx="14" cy="18" r="2" fill="#000" />
      <circle cx="26" cy="18" r="2" fill="#000" />
      {/* Smile */}
      <path d={mouthPaths[mood]} stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Rosy cheeks */}
      <circle cx="10" cy="22" r="3" fill="#FFB6C1" opacity="0.5" />
      <circle cx="30" cy="22" r="3" fill="#FFB6C1" opacity="0.5" />
    </svg>
  );
}

// Decorative divider with hearts
export function HeartDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#6B8E6F]/20 to-[#6B8E6F]/20" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path 
            d="M 8 14 Q 6 12 4 10 Q 2 8 2 6 Q 2 4 3 4 Q 4 4 5 5 Q 6 6 8 8 Q 10 6 11 5 Q 12 4 13 4 Q 14 4 14 6 Q 14 8 12 10 Q 10 12 8 14" 
            fill="#FFB6C1"
          />
        </svg>
      </motion.div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#6B8E6F]/20 to-[#6B8E6F]/20" />
    </div>
  );
}

// Small floating heart for accents
export function FloatingHeart({ delay = 0, className = '' }: { delay?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [-20, -40],
        opacity: [0, 0.6, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          delay,
          ease: "easeInOut"
        }
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path 
          d="M 6 10 Q 5 9 4 8 Q 3 7 3 6 Q 3 5 4 5 Q 5 5 6 6 Q 7 5 8 5 Q 9 5 9 6 Q 9 7 8 8 Q 7 9 6 10" 
          fill="#FFB6C1"
        />
      </svg>
    </motion.div>
  );
}

// Decorative corner with elderly theme
export function ElderlyCornerAccent({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{
          rotate: [0, 5, -5, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full opacity-30">
          {/* Decorative arc */}
          <path 
            d="M 10 54 Q 10 10 54 10" 
            stroke="#6B8E6F" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
          {/* Small hearts along the arc */}
          <path d="M 15 48 Q 14 47 14 46 Q 14 45 15 45 Q 16 45 17 46 Q 18 45 19 45 Q 20 45 20 46 Q 20 47 19 48 Q 18 49 17 50 Q 16 49 15 48" fill="#FFB6C1" />
          <path d="M 30 33 Q 29 32 29 31 Q 29 30 30 30 Q 31 30 32 31 Q 33 30 34 30 Q 35 30 35 31 Q 35 32 34 33 Q 33 34 32 35 Q 31 34 30 33" fill="#FFB6C1" />
          <path d="M 48 18 Q 47 17 47 16 Q 47 15 48 15 Q 49 15 50 16 Q 51 15 52 15 Q 53 15 53 16 Q 53 17 52 18 Q 51 19 50 20 Q 49 19 48 18" fill="#FFB6C1" />
        </svg>
      </motion.div>
    </div>
  );
}

// Small wellness icon
export function WellnessIcon({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`w-8 h-8 ${className}`}
      animate={{
        y: [0, -4, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Person silhouette */}
        <circle cx="16" cy="10" r="4" fill="#6B8E6F" opacity="0.7" />
        <path d="M 10 18 Q 10 14 16 14 Q 22 14 22 18 L 22 28 L 10 28 Z" fill="#6B8E6F" opacity="0.7" />
        {/* Heart above */}
        <path d="M 16 8 Q 15 7 14 7 Q 13 7 13 8 Q 13 9 14 10 L 16 11 L 18 10 Q 19 9 19 8 Q 19 7 18 7 Q 17 7 16 8" fill="#DC2626" opacity="0.8" />
      </svg>
    </motion.div>
  );
}

// Decorative sparkle
export function Sparkle({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`w-4 h-4 ${className}`}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
        opacity: [0, 1, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          delay,
          ease: "easeInOut"
        }
      }}
    >
      <svg viewBox="0 0 16 16" className="w-full h-full">
        <path d="M 8 2 L 9 7 L 14 8 L 9 9 L 8 14 L 7 9 L 2 8 L 7 7 Z" fill="#FFD700" />
      </svg>
    </motion.div>
  );
}

// Empty state decoration
export function EmptyStateDecoration() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-4">
      <motion.div
        animate={{
          y: [0, -8, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <TinyElderlyFace mood="caring" />
      </motion.div>
      <FloatingHeart className="top-0 left-0" delay={0} />
      <FloatingHeart className="top-0 right-0" delay={0.5} />
      <FloatingHeart className="bottom-0 left-4" delay={1} />
      <FloatingHeart className="bottom-0 right-4" delay={1.5} />
    </div>
  );
}
