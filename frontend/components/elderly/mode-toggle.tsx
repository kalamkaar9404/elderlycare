'use client';

/**
 * Elderly Mode Toggle Component
 * 
 * Allows users to switch between standard and elderly-friendly UI modes.
 * Stores preference in localStorage for persistence.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export function ElderlyModeToggle() {
  const [isElderlyMode, setIsElderlyMode] = useState(true); // Default to elderly mode

  useEffect(() => {
    // Load preference from localStorage
    const savedMode = localStorage.getItem('elderlyMode');
    if (savedMode !== null) {
      setIsElderlyMode(savedMode === 'true');
    }
    
    // Apply mode to document
    if (isElderlyMode) {
      document.documentElement.classList.add('elderly-mode');
    } else {
      document.documentElement.classList.remove('elderly-mode');
    }
  }, [isElderlyMode]);

  const toggleMode = () => {
    const newMode = !isElderlyMode;
    setIsElderlyMode(newMode);
    localStorage.setItem('elderlyMode', String(newMode));
    
    // Apply mode to document
    if (newMode) {
      document.documentElement.classList.add('elderly-mode');
    } else {
      document.documentElement.classList.remove('elderly-mode');
    }
  };

  return (
    <motion.button
      onClick={toggleMode}
      className="
        flex items-center gap-3
        px-4 py-3
        bg-white/90
        border-2 border-[#6B8E6F]/30
        rounded-xl
        shadow-md
        hover:shadow-lg
        hover:border-[#6B8E6F]/50
        transition-all duration-200
        focus-visible:outline-4
        focus-visible:outline-[#20B2AA]
        focus-visible:outline-offset-3
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={isElderlyMode ? 'Switch to Standard Mode' : 'Switch to Elderly-Friendly Mode'}
    >
      {isElderlyMode ? (
        <>
          <Eye className="h-6 w-6 text-[#6B8E6F]" strokeWidth={2.5} />
          <span className="text-base font-semibold text-[#6B8E6F]">
            Elderly-Friendly Mode
          </span>
        </>
      ) : (
        <>
          <EyeOff className="h-5 w-5 text-gray-600" strokeWidth={2} />
          <span className="text-sm font-medium text-gray-600">
            Standard Mode
          </span>
        </>
      )}
    </motion.button>
  );
}

/**
 * Compact version for topbar/header
 */
export function ElderlyModeToggleCompact() {
  const [isElderlyMode, setIsElderlyMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('elderlyMode');
    if (savedMode !== null) {
      setIsElderlyMode(savedMode === 'true');
    }
  }, []);

  const toggleMode = () => {
    const newMode = !isElderlyMode;
    setIsElderlyMode(newMode);
    localStorage.setItem('elderlyMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('elderly-mode');
    } else {
      document.documentElement.classList.remove('elderly-mode');
    }
  };

  return (
    <button
      onClick={toggleMode}
      className="
        flex items-center justify-center
        h-10 w-10
        bg-white/80
        border border-[#6B8E6F]/20
        rounded-lg
        hover:bg-white
        hover:border-[#6B8E6F]/40
        transition-all duration-200
        focus-visible:outline-2
        focus-visible:outline-[#20B2AA]
        focus-visible:outline-offset-2
      "
      title={isElderlyMode ? 'Switch to Standard Mode' : 'Switch to Elderly-Friendly Mode'}
    >
      {isElderlyMode ? (
        <Eye className="h-5 w-5 text-[#6B8E6F]" strokeWidth={2.5} />
      ) : (
        <EyeOff className="h-4 w-4 text-gray-600" strokeWidth={2} />
      )}
    </button>
  );
}

/**
 * Hook to check if elderly mode is active
 */
export function useElderlyMode() {
  const [isElderlyMode, setIsElderlyMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('elderlyMode');
    if (savedMode !== null) {
      setIsElderlyMode(savedMode === 'true');
    }

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'elderlyMode') {
        setIsElderlyMode(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return isElderlyMode;
}
