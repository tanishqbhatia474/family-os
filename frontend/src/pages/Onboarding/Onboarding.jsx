import { Link } from "react-router-dom";
import FluidBackground from "@/components/visual/FluidBackground";
import { motion } from "framer-motion";

export default function Onboarding() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <FluidBackground />

      {/* Ambient accent glows - hidden on mobile for cleaner look */}
      <div className="hidden sm:block absolute top-16 right-16 w-32 h-32 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />
      <div className="hidden sm:block absolute bottom-24 left-24 w-40 h-40 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 space-y-2 sm:space-y-3">
          <h1 className="text-[clamp(2.25rem,6vw,2.75rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
            Welcome
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-sm mx-auto px-4 sm:px-0">
            Begin by creating a new family space, or join one you've been invited to.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="
            relative
            backdrop-blur-xl
            rounded-2xl sm:rounded-3xl
            px-6 sm:px-8 py-8 sm:py-10
            border border-[var(--border)]
            shadow-2xl
            space-y-4 sm:space-y-5
          "
          style={{
            backgroundColor: "color-mix(in srgb, var(--panel) 90%, transparent)"
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          <Link
            to="/onboarding/create"
            className="
              relative block w-full text-center
              rounded-xl py-3 sm:py-3.5
              text-sm sm:text-base font-semibold
              bg-[var(--accent)] text-white
              transition-all duration-200
              hover:opacity-90 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
            "
          >
            Create a new family
          </Link>

          <Link
            to="/onboarding/join"
            className="
              relative block w-full text-center
              rounded-xl py-3 sm:py-3.5
              text-sm sm:text-base font-semibold
              border-2 border-[var(--border)]
              text-[var(--text)]
              transition-all duration-200
              hover:border-[var(--accent)]
              hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]
            "
          >
            Join an existing family
          </Link>
        </motion.div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 sm:mt-8 text-xs sm:text-sm text-center text-[var(--muted)] px-4 sm:px-0"
        >
          You can always add or update family details later.
        </motion.p>
      </motion.div>
    </div>
  );
}