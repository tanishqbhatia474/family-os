import FluidBackground from "@/components/visual/FluidBackground";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* global animated background */}
      <FluidBackground />

      {/* fixed navigation */}
      <Sidebar />
      <Topbar />

      {/* scrollable content */}
      <main
        className="relative z-10 ml-56 pt-14 px-6 pb-10"
        style={{ minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
