import { Topbar } from '@/components/layout/topbar';
import Sidebar from '@/components/layout/sidebar';
import { SidebarProvider } from '@/lib/sidebar-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/*
       * Outermost wrapper — full viewport, themed gradient background.
       * Sage Green tint → Sky tint → Warm Peach tint (left → center → right).
       */}
      <div
        className="
          relative min-h-screen w-full
          bg-gradient-to-br
          from-[#f0fdf4]
          via-[#f0f9ff]
          to-[#fff7f3]
        "
      >
        {/* Fixed floating sidebar — sits outside flow, z-50 */}
        <Sidebar />

        {/*
         * Inner column: stacks Topbar + main content.
         * ml-20 clears the collapsed sidebar (64px) plus the left-3 offset
         * and a small breathing gap. transition-all lets it respond if
         * the sidebar context ever drives a programmatic width change.
         */}
        <div className="flex flex-col min-h-screen ml-24 transition-all duration-300">
          {/* Sticky top bar */}
          <Topbar />

          {/*
           * Page content area (Elderly-Friendly).
           * overflow-auto so long pages scroll inside this region.
           * Extra generous padding for better readability.
           */}
          <main className="flex-1 overflow-auto p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
