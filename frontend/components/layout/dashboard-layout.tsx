'use client';

import { Topbar } from './topbar';
import Sidebar from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-full bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-0 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
