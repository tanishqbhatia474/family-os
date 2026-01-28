import { useState, useEffect } from "react";
import FluidBackground from "@/components/visual/FluidBackground";
import Sidebar from "@/components/layout/Sidebar";
import FloatingActions from "@/components/layout/FloatingActions";
import { useLocation } from "react-router-dom";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <FluidBackground />
      </div>

      {/* APP UI */}
      <div className="relative z-10">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar (overlay) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-64 h-full bg-[var(--bg)] shadow-xl">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Floating buttons */}
        <FloatingActions onOpenSidebar={() => setSidebarOpen(true)} />

        {/* MAIN CONTENT */}
        <main className="ml-0 md:ml-56 px-6 pt-6 pb-10 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}