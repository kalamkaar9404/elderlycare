'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  /** Whether the sidebar is open (used for mobile fallback). */
  isOpen: boolean;
  /** Toggle open ↔ closed. */
  toggleSidebar: () => void;
  /** Imperatively close the sidebar (e.g. on route change on mobile). */
  closeSidebar: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * SidebarProvider
 *
 * Wraps the dashboard layout and exposes sidebar open/close state.
 *
 * On desktop the sidebar is a floating dock driven purely by CSS hover —
 * this context is intentionally kept lightweight and is primarily used as
 * a mobile fallback (e.g. a hamburger button can call `toggleSidebar`).
 *
 * Default: collapsed (isOpen = false).
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  // Sidebar starts collapsed. The hover mechanism in <Sidebar /> handles
  // desktop expansion independently of this state.
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useSidebar
 *
 * Consume sidebar context anywhere inside <SidebarProvider>.
 *
 * @example
 * const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
 */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);

  if (!ctx) {
    throw new Error(
      '[useSidebar] must be used inside a <SidebarProvider>. ' +
        'Make sure your dashboard layout wraps children with <SidebarProvider>.',
    );
  }

  return ctx;
}
