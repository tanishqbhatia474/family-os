import FluidBackground from "@/components/visual/FluidBackground";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const softReveal = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  whileInView: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Dashboard() {
  return (
    <div className="relative min-h-screen">
      {/* Fluid animated background */}
      <FluidBackground />

      {/* Hero */}
      <section className="relative z-10 px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left: Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:col-span-7"
            >
              <h1 className="text-[clamp(2rem,8vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-[var(--text)] mb-6 sm:mb-8">
                A quiet place
                <br />
                for your family's
                <br />
                <span className="text-[var(--accent)]">story</span>
              </h1>

              <p className="text-[clamp(1rem,2vw,1.375rem)] leading-relaxed text-[var(--muted)] max-w-2xl font-normal mb-8 sm:mb-12">
                This space begins gently — with your family members,
                the relationships between them, and the moments that matter.
                <span className="block mt-3 sm:mt-4 opacity-80">
                  It grows over time, at your pace.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/family-tree"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--accent)] text-white rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-all hover:gap-3"
                >
                  Start with your family tree
                  <span className="text-lg sm:text-xl">→</span>
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-[var(--border)] rounded-full font-medium text-sm sm:text-base text-[var(--text)] hover:border-[var(--accent)] transition-all"
                >
                  Learn more
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:col-span-5 mt-8 lg:mt-0"
            >
              <div
                className="
                  rounded-2xl sm:rounded-3xl
                  border border-[var(--border)]
                  bg-[color-mix(in_srgb,var(--panel)_85%,transparent)]
                  p-6 sm:p-8
                  fade-in-on-load
                "
              >
                {/* Light mode illustration */}
                <img
                  src="/illustrations/living-heritage-light.png"
                  alt="Your family's living heritage"
                  className="illustration dark-only w-full"
                />

                {/* Dark mode illustration */}
                <img
                  src="/illustrations/living-heritage-dark.png"
                  alt="Your family's living heritage"
                  className="illustration light-only w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-12 sm:gap-y-16 md:gap-y-20"
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start"
            >
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                1
              </div>

              <div className="space-y-4 sm:space-y-5 max-w-3xl">
                <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[var(--text)] leading-tight">
                  Add your family
                </h2>

                <p className="text-base sm:text-[1.125rem] leading-relaxed text-[var(--muted)] max-w-xl">
                  Start with parents, grandparents, siblings, or children.
                  Your family tree doesn't need to be complete — you can
                  add and expand it over time.
                </p>

                <Link
                  to="/family-tree"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--accent)] hover:gap-3 transition-all mt-3 sm:mt-4 group"
                >
                  Open family tree
                  <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                2
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)] leading-tight">
                  Keep important
                  <br />
                  documents safe
                </h2>

                <p className="text-base sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  Store family certificates, records, and important files —
                  privately, securely, and easy to find when you need them.
                </p>

                <Link
                  to="/documents"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--accent)] hover:gap-3 transition-all mt-2 sm:mt-3 group"
                >
                  Go to documents
                  <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                3
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)] leading-tight">
                  Capture family rituals
                  <br />
                  and traditions
                </h2>

                <p className="text-base sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  Record the moments that repeat — celebrations, habits,
                  and traditions that shape your family over generations.
                </p>

                <Link
                  to="/rituals"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--accent)] hover:gap-3 transition-all mt-2 sm:mt-3 group"
                >
                  Explore rituals
                  <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Large Feature Illustration */}
          <section className="relative px-0 py-8 sm:py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <motion.div
                variants={softReveal}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, margin: "-80px" }}
                className="
                  mt-4
                  w-full max-w-[900px]
                  mx-auto
                  py-6 sm:py-8 md:py-10
                  px-4 sm:px-0
                  rounded-2xl sm:rounded-3xl
                  border border-[var(--border)]
                  bg-[color-mix(in_srgb,var(--panel)_85%,transparent)]
                  flex items-center justify-center
                "
              >
                <img
                  src="/illustrations/family-ecosystem-dark.png"
                  alt="Family connections illustration"
                  className="light-only w-full max-w-[680px] h-auto opacity-90"
                />
                <img
                  src="/illustrations/family-ecosystem-light.png"
                  alt="Family connections illustration"
                  className="dark-only w-full max-w-[680px] h-auto opacity-90"
                />
              </motion.div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}