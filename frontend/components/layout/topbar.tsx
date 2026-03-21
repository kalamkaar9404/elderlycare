'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/lib/sidebar-context';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  LogOut,
  User,
  PanelLeftOpen,
  X,
  ShieldAlert,
  CheckCircle,
  Info,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'critical',
    title: 'Blood Glucose Spike',
    message: 'Jane Doe: 9.1 mmol/L detected',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Pending Approval',
    message: 'Priya Sharma meal plan awaiting review',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Missing Weight Entry',
    message: 'Amara Okonkwo: no entry today',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'Meal Plan Generated',
    message: 'Sarah Johnson AI plan ready',
    time: '2 hr ago',
    read: true,
  },
];

const PATIENT_NAMES = [
  'Jane Doe',
  'Priya Sharma',
  'Amara Okonkwo',
  'Sarah Johnson',
  'Maria Garcia',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNotificationColor(type: string): string {
  if (type === 'critical') return '#DC2626';
  if (type === 'warning') return '#F59E0B';
  return '#20B2AA';
}

function NotificationIcon({ type }: { type: string }) {
  const color = getNotificationColor(type);
  if (type === 'critical' || type === 'warning') {
    return <ShieldAlert size={18} style={{ color }} className="shrink-0 mt-0.5" />;
  }
  return <Info size={18} style={{ color }} className="shrink-0 mt-0.5" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Topbar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Search state
  const [query, setQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredPatients =
    query.length > 0
      ? PATIENT_NAMES.filter((name) =>
          name.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  // Close notification panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setShowSearchResults(true);
  }

  function handlePatientClick(name: string) {
    setQuery(name);
    setShowSearchResults(false);
    router.push('/patient-portal');
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass background */}
      <div
        className="w-full border-b border-white/20 backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          {/* ── Sidebar Toggle ── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0 rounded-xl text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-all"
            aria-label="Toggle sidebar"
          >
            <PanelLeftOpen size={20} />
          </Button>

          {/* ── Search ── */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              value={query}
              onChange={handleSearchChange}
              onFocus={() => query.length > 0 && setShowSearchResults(true)}
              placeholder="Search patients…"
              className="pl-9 pr-4 h-9 rounded-xl border-white/30 bg-white/30 backdrop-blur-sm placeholder:text-slate-400 focus-visible:bg-white/50 focus-visible:ring-teal-400/50 transition-all text-sm"
            />

            {/* Search results dropdown */}
            <AnimatePresence>
              {showSearchResults && filteredPatients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl"
                >
                  {filteredPatients.map((name) => (
                    <button
                      key={name}
                      onMouseDown={() => handlePatientClick(name)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-teal-50/60 transition-colors"
                    >
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span>{name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Notifications ── */}
          <div className="relative">
            <button
              ref={bellButtonRef}
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-all"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  ref={notificationPanelRef}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-white/30 shadow-2xl overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.70) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/30">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-white/50 hover:text-slate-600 transition-all"
                      aria-label="Close notifications"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/20">
                    {notifications.map((notification) => {
                      const color = getNotificationColor(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/30"
                          style={
                            !notification.read
                              ? {
                                  borderLeft: `3px solid ${color}`,
                                  paddingLeft: '13px',
                                }
                              : undefined
                          }
                        >
                          <NotificationIcon type={notification.type} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                              {notification.message}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <span
                              className="mt-1 h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-white/30">
                    <button
                      onClick={handleMarkAllRead}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50/60 transition-colors"
                    >
                      <CheckCircle size={13} />
                      Mark all read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── User Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/40 transition-all"
                aria-label="User menu"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-sm font-bold shadow-sm shrink-0">
                  S
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    Dr. Sharma
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Dietitian
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-48 rounded-xl border-white/30 bg-white/80 backdrop-blur-xl shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => router.push('/patient-portal')}
                className="rounded-lg cursor-pointer gap-2 text-sm text-slate-700 focus:bg-teal-50/60"
              >
                <User size={14} className="text-slate-400" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.alert('Settings panel coming soon')}
                className="rounded-lg cursor-pointer gap-2 text-sm text-slate-700 focus:bg-teal-50/60"
              >
                <CheckCircle size={14} className="text-slate-400" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/30" />

              <DropdownMenuItem
                onClick={() => (window.location.href = '/')}
                className="rounded-lg cursor-pointer gap-2 text-sm text-red-600 focus:bg-red-50/60 focus:text-red-700"
              >
                <LogOut size={14} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
