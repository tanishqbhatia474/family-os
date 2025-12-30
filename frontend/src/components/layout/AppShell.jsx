import FluidBackground from "@/components/visual/FluidBackground";
import Sidebar from "@/components/layout/Sidebar";
import FloatingActions from "@/components/layout/FloatingActions";

export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND — isolated */}
      <div className="fixed inset-0 z-0">
        <FluidBackground />
      </div>

      {/* APP UI — clean stacking context */}
      <div className="relative z-10">
        <Sidebar />
        <FloatingActions />

        <main className="ml-56 px-6 pt-6 pb-10 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
