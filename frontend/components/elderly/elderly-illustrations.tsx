'use client';

/**
 * Elderly-Friendly Illustrations Component
 * 
 * Warm, friendly illustrations of elderly people to make the interface
 * more relatable and welcoming for older adults.
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Gentle floating animation
const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Gentle pulse animation
const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Wave animation
const waveAnimation = {
  rotate: [0, 15, -15, 15, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
    repeatDelay: 3
  }
};

interface IllustrationWrapperProps {
  children: ReactNode;
  animation?: 'float' | 'pulse' | 'wave' | 'none';
  className?: string;
}

function IllustrationWrapper({ children, animation = 'float', className = '' }: IllustrationWrapperProps) {
  const animations = {
    float: floatAnimation,
    pulse: pulseAnimation,
    wave: waveAnimation,
    none: {}
  };

  return (
    <motion.div
      animate={animations[animation]}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Elderly Couple Illustration
export function ElderlyCoupleIllustration({ className = '' }: { className?: string }) {
  return (
    <IllustrationWrapper animation="float" className={className}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Elderly Man with Cane */}
        <g transform="translate(80, 100)">
          {/* Body */}
          <ellipse cx="40" cy="120" rx="45" ry="60" fill="#6B8E6F" />
          {/* Head */}
          <circle cx="40" cy="50" r="35" fill="#F5D7B1" />
          {/* Gray Hair */}
          <path d="M 10 40 Q 5 25 15 20 Q 25 15 40 15 Q 55 15 65 20 Q 75 25 70 40" fill="#B0B0B0" />
          {/* Eyes (closed, smiling) */}
          <path d="M 25 45 Q 30 48 35 45" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 45 45 Q 50 48 55 45" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Smile */}
          <path d="M 25 60 Q 40 70 55 60" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Wrinkles */}
          <path d="M 20 55 Q 18 58 20 60" stroke="#D4A574" strokeWidth="1.5" fill="none" />
          <path d="M 60 55 Q 62 58 60 60" stroke="#D4A574" strokeWidth="1.5" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="20" cy="55" r="8" fill="#FFB6C1" opacity="0.5" />
          <circle cx="60" cy="55" r="8" fill="#FFB6C1" opacity="0.5" />
          {/* Arms */}
          <rect x="5" y="90" width="20" height="50" rx="10" fill="#6B8E6F" />
          <rect x="55" y="90" width="20" height="50" rx="10" fill="#6B8E6F" />
          {/* Legs */}
          <rect x="20" y="170" width="18" height="60" rx="9" fill="#708090" />
          <rect x="42" y="170" width="18" height="60" rx="9" fill="#708090" />
          {/* Shoes */}
          <ellipse cx="29" cy="235" rx="12" ry="8" fill="#654321" />
          <ellipse cx="51" cy="235" rx="12" ry="8" fill="#654321" />
          {/* Cane */}
          <motion.g animate={waveAnimation}>
            <line x1="15" y1="140" x2="15" y2="220" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
            <path d="M 15 140 Q 10 135 15 130" stroke="#8B4513" strokeWidth="4" fill="none" strokeLinecap="round" />
          </motion.g>
        </g>

        {/* Elderly Woman */}
        <g transform="translate(240, 100)">
          {/* Body */}
          <ellipse cx="40" cy="120" rx="50" ry="65" fill="#E8B4A0" />
          {/* Head */}
          <circle cx="40" cy="50" r="35" fill="#F5D7B1" />
          {/* Gray Hair */}
          <path d="M 10 35 Q 5 20 15 15 Q 25 10 40 10 Q 55 10 65 15 Q 75 20 70 35 L 70 50 Q 65 55 60 50 L 60 40 Q 55 35 40 35 Q 25 35 20 40 L 20 50 Q 15 55 10 50 Z" fill="#A9A9A9" />
          {/* Eyes (closed, smiling) */}
          <path d="M 25 45 Q 30 48 35 45" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 45 45 Q 50 48 55 45" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Smile */}
          <path d="M 25 60 Q 40 70 55 60" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Wrinkles */}
          <path d="M 20 55 Q 18 58 20 60" stroke="#D4A574" strokeWidth="1.5" fill="none" />
          <path d="M 60 55 Q 62 58 60 60" stroke="#D4A574" strokeWidth="1.5" fill="none" />
          {/* Rosy cheeks */}
          <circle cx="20" cy="55" r="8" fill="#FFB6C1" opacity="0.5" />
          <circle cx="60" cy="55" r="8" fill="#FFB6C1" opacity="0.5" />
          {/* Necklace */}
          <ellipse cx="40" cy="85" rx="25" ry="5" fill="#FFD700" />
          {/* Arms */}
          <rect x="5" y="95" width="20" height="50" rx="10" fill="#E8B4A0" />
          <rect x="55" y="95" width="20" height="50" rx="10" fill="#E8B4A0" />
          {/* Legs */}
          <rect x="20" y="175" width="18" height="55" rx="9" fill="#708090" />
          <rect x="42" y="175" width="18" height="55" rx="9" fill="#708090" />
          {/* Shoes */}
          <ellipse cx="29" cy="235" rx="12" ry="8" fill="#8B4513" />
          <ellipse cx="51" cy="235" rx="12" ry="8" fill="#8B4513" />
        </g>

        {/* Decorative hearts */}
        <motion.g animate={pulseAnimation}>
          <path d="M 200 80 Q 195 70 185 70 Q 175 70 175 80 Q 175 90 185 95 L 200 105 L 215 95 Q 225 90 225 80 Q 225 70 215 70 Q 205 70 200 80" fill="#FFB6C1" opacity="0.6" />
        </motion.g>
      </svg>
    </IllustrationWrapper>
  );
}

// Happy Elderly Person (Success/Celebration)
export function HappyElderlyIllustration({ className = '' }: { className?: string }) {
  return (
    <IllustrationWrapper animation="pulse" className={className}>
      <svg viewBox="0 0 300 350" className="w-full h-full">
        <g transform="translate(150, 50)">
          {/* Body */}
          <ellipse cx="0" cy="120" rx="55" ry="70" fill="#8B7355" />
          {/* Head */}
          <circle cx="0" cy="40" r="40" fill="#F5D7B1" />
          {/* Gray Hair */}
          <path d="M -30 30 Q -35 15 -25 10 Q -15 5 0 5 Q 15 5 25 10 Q 35 15 30 30" fill="#B0B0B0" />
          {/* Eyes (wide open, happy) */}
          <circle cx="-12" cy="35" r="4" fill="#000" />
          <circle cx="12" cy="35" r="4" fill="#000" />
          {/* Big Smile */}
          <path d="M -20 50 Q 0 65 20 50" stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <circle cx="-20" cy="45" r="10" fill="#FFB6C1" opacity="0.6" />
          <circle cx="20" cy="45" r="10" fill="#FFB6C1" opacity="0.6" />
          {/* Arms raised (celebrating) */}
          <motion.g animate={{ rotate: [0, -15, 0], transition: { duration: 1, repeat: Infinity } }}>
            <rect x="-75" y="80" width="22" height="60" rx="11" fill="#8B7355" transform="rotate(-45 -64 80)" />
          </motion.g>
          <motion.g animate={{ rotate: [0, 15, 0], transition: { duration: 1, repeat: Infinity } }}>
            <rect x="53" y="80" width="22" height="60" rx="11" fill="#8B7355" transform="rotate(45 64 80)" />
          </motion.g>
          {/* Hands */}
          <motion.circle cx="-70" cy="60" r="12" fill="#F5D7B1" animate={{ y: [-5, 5, -5], transition: { duration: 1, repeat: Infinity } }} />
          <motion.circle cx="70" cy="60" r="12" fill="#F5D7B1" animate={{ y: [-5, 5, -5], transition: { duration: 1, repeat: Infinity } }} />
          {/* Legs */}
          <rect x="-25" y="180" width="20" height="65" rx="10" fill="#4A5568" />
          <rect x="5" y="180" width="20" height="65" rx="10" fill="#4A5568" />
          {/* Shoes */}
          <ellipse cx="-15" cy="250" rx="14" ry="9" fill="#2D3748" />
          <ellipse cx="15" cy="250" rx="14" ry="9" fill="#2D3748" />
        </g>

        {/* Sparkles */}
        <motion.g animate={{ rotate: 360, transition: { duration: 4, repeat: Infinity, ease: "linear" } }}>
          <path d="M 50 80 L 55 85 L 50 90 L 45 85 Z" fill="#FFD700" />
          <path d="M 250 100 L 255 105 L 250 110 L 245 105 Z" fill="#FFD700" />
          <path d="M 80 200 L 85 205 L 80 210 L 75 205 Z" fill="#FFD700" />
          <path d="M 220 180 L 225 185 L 220 190 L 215 185 Z" fill="#FFD700" />
        </motion.g>
      </svg>
    </IllustrationWrapper>
  );
}

// Elderly Person with Heart (Health/Care theme)
export function ElderlyHealthIllustration({ className = '' }: { className?: string }) {
  return (
    <IllustrationWrapper animation="float" className={className}>
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <g transform="translate(150, 80)">
          {/* Body */}
          <ellipse cx="0" cy="90" rx="50" ry="60" fill="#20B2AA" />
          {/* Head */}
          <circle cx="0" cy="30" r="35" fill="#F5D7B1" />
          {/* Gray Hair */}
          <path d="M -28 20 Q -32 8 -22 5 Q -12 2 0 2 Q 12 2 22 5 Q 32 8 28 20" fill="#C0C0C0" />
          {/* Glasses */}
          <circle cx="-12" cy="28" r="10" fill="none" stroke="#333" strokeWidth="2" />
          <circle cx="12" cy="28" r="10" fill="none" stroke="#333" strokeWidth="2" />
          <line x1="-2" y1="28" x2="2" y2="28" stroke="#333" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="-12" cy="28" r="3" fill="#000" />
          <circle cx="12" cy="28" r="3" fill="#000" />
          {/* Gentle smile */}
          <path d="M -15 40 Q 0 48 15 40" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Rosy cheeks */}
          <circle cx="-18" cy="38" r="7" fill="#FFB6C1" opacity="0.5" />
          <circle cx="18" cy="38" r="7" fill="#FFB6C1" opacity="0.5" />
          {/* Arms */}
          <rect x="-65" y="70" width="18" height="50" rx="9" fill="#20B2AA" />
          <rect x="47" y="70" width="18" height="50" rx="9" fill="#20B2AA" />
          {/* Legs */}
          <rect x="-22" y="145" width="18" height="55" rx="9" fill="#5A6C7D" />
          <rect x="4" y="145" width="18" height="55" rx="9" fill="#5A6C7D" />
          {/* Shoes */}
          <ellipse cx="-13" cy="205" rx="12" ry="8" fill="#4A5568" />
          <ellipse cx="13" cy="205" rx="12" ry="8" fill="#4A5568" />
        </g>

        {/* Animated Heart */}
        <motion.g 
          animate={{ 
            scale: [1, 1.2, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <path 
            d="M 150 120 Q 145 110 135 110 Q 125 110 125 120 Q 125 130 135 135 L 150 145 L 165 135 Q 175 130 175 120 Q 175 110 165 110 Q 155 110 150 120" 
            fill="#DC2626" 
            opacity="0.8"
          />
        </motion.g>

        {/* Pulse lines */}
        <motion.g
          animate={{
            opacity: [0.3, 1, 0.3],
            transition: { duration: 2, repeat: Infinity }
          }}
        >
          <path d="M 80 150 L 100 150 L 110 140 L 120 160 L 130 150 L 220 150" stroke="#20B2AA" strokeWidth="3" fill="none" strokeLinecap="round" />
        </motion.g>
      </svg>
    </IllustrationWrapper>
  );
}

// Decorative animated elements
export function FloatingHearts({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: '100%',
            opacity: 0 
          }}
          animate={{
            y: '-20%',
            opacity: [0, 0.6, 0],
            transition: {
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30">
            <path 
              d="M 15 25 Q 10 20 5 15 Q 0 10 0 7 Q 0 3 3 3 Q 6 3 8 5 Q 10 7 15 12 Q 20 7 22 5 Q 24 3 27 3 Q 30 3 30 7 Q 30 10 25 15 Q 20 20 15 25" 
              fill="#FFB6C1"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingStars({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 90 + 5}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 1, 0.3],
            transition: {
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path 
              d="M 12 2 L 14 10 L 22 12 L 14 14 L 12 22 L 10 14 L 2 12 L 10 10 Z" 
              fill="#FFD700"
              opacity="0.7"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Empty state illustration
export function EmptyStateElderly({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <HappyElderlyIllustration className="w-48 h-48 mb-6" />
      <p className="text-elderly-lg font-semibold text-[#6B8E6F] text-center max-w-md">
        {message}
      </p>
    </div>
  );
}
