'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShieldCheck,
  Leaf,
  Heart,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Patient Portal',
    href: '/patient-portal',
    icon: Users,
  },
  {
    label: 'Kitchen Command',
    href: '/kitchen-command',
    icon: UtensilsCrossed,
  },
  {
    label: 'Doc Monitor',
    href: '/doc-monitor',
    icon: ShieldCheck,
  },
] as const;

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isHovered ? 280 : 80 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="
        fixed left-3 top-1/2 -translate-y-1/2
        h-[calc(100vh-48px)]
        z-50
        rounded-2xl
        backdrop-blur-xl
        bg-white/90
        border-2 border-[#6B8E6F]/20
        shadow-2xl
        flex flex-col
        overflow-hidden
      "
      style={{ willChange: 'width' }}
    >
      {/* ── Logo Area (Elderly-Friendly) ── */}
      <div className="flex items-center gap-3 px-5 py-6 flex-shrink-0">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #6B8E6F 0%, #20B2AA 100%)',
          }}
        >
          <Heart className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col leading-none overflow-hidden whitespace-nowrap"
            >
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: '#20B2AA' }}
              >
                MedNutri
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Health Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Divider ── */}
      <div className="mx-3 h-px bg-white/40 flex-shrink-0" />

      {/* ── Nav Items (Elderly-Friendly) ── */}
      <nav className="flex flex-col gap-2 px-3 pt-4 flex-1 overflow-hidden">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            pathname?.startsWith(href as string);

          return (
            <Link key={href} href={href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`
                  relative flex items-center gap-4
                  min-h-[56px] px-4
                  rounded-xl
                  cursor-pointer
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-700 hover:bg-[#6B8E6F]/10 hover:text-[#6B8E6F]'
                  }
                `}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, #6B8E6F 0%, #20B2AA 100%)',
                      }
                    : {}
                }
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-xl opacity-30 blur-sm"
                    style={{
                      background:
                        'linear-gradient(135deg, #6B8E6F 0%, #20B2AA 100%)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className="h-7 w-7 flex-shrink-0 relative z-10"
                  strokeWidth={isActive ? 2.5 : 2.0}
                />

                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-elderly-sm font-semibold whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Footer ── */}
      <div className="flex-shrink-0 px-2 pb-4 pt-2">
        <div className="mx-1 h-px bg-white/40 mb-3" />

        <div className="flex items-center gap-3 px-3 h-10">
          {/* Heart pulse icon always visible */}
          <div className="flex-shrink-0 relative">
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Heart
                className="h-5 w-5 flex-shrink-0"
                style={{ color: '#E8B4A0' }}
                strokeWidth={2}
                fill="#E8B4A0"
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
              >
                <span className="text-xs text-slate-400 font-medium">
                  MedNutri v2.0
                </span>
                <div
                  className="flex items-center justify-center h-4 w-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#6B8E6F' }}
                >
                  <Leaf className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
