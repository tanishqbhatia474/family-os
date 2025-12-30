import { Link } from "react-router-dom";
import FluidBackground from "@/components/visual/FluidBackground";

export default function Onboarding() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <FluidBackground />

      <div
        className="
          relative z-10 w-full max-w-sm
          bg-white/70 backdrop-blur-md
          rounded-xl px-8 py-10
          shadow-lg shadow-black/5
          space-y-8
        "
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">
            Welcome to Rituals World
          </h1>
          <p className="text-sm text-neutral-600">
            Create a new family or join an existing one
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/onboarding/create"
            className="
              block w-full text-center rounded-md py-2 text-sm font-medium
              bg-[#1F3D34] text-white
              hover:bg-[#183128]
              transition-colors
            "
          >
            Create Family
          </Link>

          <Link
            to="/onboarding/join"
            className="
              block w-full text-center rounded-md py-2 text-sm font-medium
              border border-[#1F3D34]/40
              text-[#1F3D34]
              hover:bg-[#1F3D34]/5
              transition-colors
            "
          >
            Join Family
          </Link>
        </div>
      </div>
    </div>
  );
}
