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
      staggerChildren: 0.12
    }
  }
};

const sectionReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15
    }
  }
};

const itemReveal = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

const underlineGrow = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function About() {
  return (
    <div className="relative min-h-screen">
      <FluidBackground />

      <section className="relative z-10 px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-15 md:pt-32">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-20 sm:mb-24 md:mb-32 max-w-3xl"
          >
            <h1 className="text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-[var(--text)] mb-6 sm:mb-8">
              A place made
              <br />
              for <span className="text-[var(--accent)]">families</span>
            </h1>

            <p className="text-[clamp(1rem,2vw,1.375rem)] leading-relaxed text-[var(--muted)] max-w-2xl">
              This exists to help families make sense of their
              relationships, preserve what matters, and carry meaning forward —
              <span className="block mt-2 sm:mt-3 opacity-80">
                not quickly, but carefully, over time.
              </span>
            </p>
          </motion.div>

          {/* Main explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-x-20 lg:gap-y-24">

            {/* Left: What this space supports */}
            <motion.div
              className="lg:col-span-7 space-y-8 sm:space-y-10"
              variants={sectionReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Heading */}
              <motion.div variants={itemReveal} className="space-y-2 sm:space-y-3">
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
                  What this space is for
                </h2>

                {/* subtle accent line */}
                <motion.div
                  variants={underlineGrow}
                  className="h-px w-12 sm:w-16 bg-[color-mix(in_srgb,var(--accent)_35%,transparent)] origin-left"
                />
              </motion.div>

              {/* Content items */}
              <div className="space-y-8 sm:space-y-10">
                <motion.div variants={itemReveal} className="space-y-2">
                  <h3 className="text-base sm:text-[1.125rem] font-semibold text-[var(--text)]">
                    Understanding family relationships
                  </h3>
                  <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                    Families grow in many directions — across generations,
                    households, and life changes. This space helps you see
                    those relationships clearly, without reducing them to
                    timelines or profiles.
                  </p>
                </motion.div>

                <motion.div variants={itemReveal} className="space-y-2">
                  <h3 className="text-base sm:text-[1.125rem] font-semibold text-[var(--text)]">
                    Preserving what carries meaning
                  </h3>
                  <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                    Documents, memories, and shared practices often live in
                    fragments. Here, they can exist together — not as archives,
                    but as parts of an ongoing family story.
                  </p>
                </motion.div>

                <motion.div variants={itemReveal} className="space-y-2">
                  <h3 className="text-base sm:text-[1.125rem] font-semibold text-[var(--text)]">
                    Holding continuity across generations
                  </h3>
                  <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                    Families are shaped over long spans of time. This project
                    is designed to support that continuity — allowing values,
                    context, and relationships to remain understandable even
                    as years pass.
                  </p>
                </motion.div>
              </div>

              {/* Closing note */}
              <motion.p
                variants={itemReveal}
                className="text-sm sm:text-base text-[var(--muted)] italic pt-3 sm:pt-4 border-t border-[var(--border)]"
              >
                Nothing here needs to be complete. Families evolve, and this
                space is meant to evolve with them.
              </motion.p>
            </motion.div>

            {/* Right: Visual context */}
            <motion.div {...fadeUp} className="lg:col-span-5 lg:mt-20">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_85%,transparent)] p-6 sm:p-8 fade-in-on-load">
                  <img
                    src="/illustrations/living-heritage-light.png"
                    alt=""
                    className="illustration dark-only w-full"
                  />
                  <img
                    src="/illustrations/living-heritage-dark.png"
                    alt=""
                    className="illustration light-only w-full"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[var(--muted)] max-w-[30ch] leading-relaxed">
                  Families carry both history and responsibility — to remember,
                  to care, and to pass things on with intention.
                </p>
              </div>
            </motion.div>
          </div>

          {/* What this is not */}
          <div className="mt-20 sm:mt-24 md:mt-32 space-y-16 sm:space-y-20 md:space-y-24 max-w-4xl">
            <motion.div {...fadeUp} className="space-y-5 sm:space-y-6">
              <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
                What this is not
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  This is not a social network. There are no public profiles,
                  no feeds, and no expectation to share.
                </p>

                <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  It is not driven by productivity, metrics, or growth curves.
                  Families do not move that way — and neither should the spaces
                  that hold them.
                </p>

                <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)] font-medium">
                  This space is private by design.
                </p>
              </div>
            </motion.div>

            {/* Longevity */}
            <motion.div {...fadeUp} className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_85%,transparent)] p-6 sm:p-8 fade-in-on-load">
                  <img
                    src="/illustrations/cycle-of-time-light.png"
                    alt=""
                    className="illustration dark-only w-full"
                  />
                  <img
                    src="/illustrations/cycle-of-time-dark.png"
                    alt=""
                    className="illustration light-only w-full"
                  />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
                    Built with a
                    <br />
                    long view
                  </h2>

                  <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                    Families rarely think in years alone. Decisions echo across
                    generations, often in subtle ways.
                  </p>

                  <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                    This project is built with that reality in mind. Your data
                    belongs to you. Your family's story remains yours.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-16 my-16 sm:my-20 md:my-24">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            {...fadeUp}
            className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_8%,transparent)] to-transparent border-2 border-[var(--accent)] overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center p-8 sm:p-12 md:p-16">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl md:text-[1.5rem] font-bold text-[var(--text)]">
                  Privacy, by intention
                </h3>

                <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  Everything you create here stays private. There is no tracking,
                  no selling of data, and no hidden incentives.
                </p>

                <p className="text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-[var(--muted)]">
                  This space exists to serve families — not advertisers.
                  It is built on trust, care, and respect for what families
                  choose to preserve.
                </p>
              </div>

              <div className="fade-in-on-load lg:pl-8 flex justify-center lg:justify-end">
                <img
                  src="/illustrations/core-values-dark.png"
                  alt=""
                  className="illustration light-only w-full max-w-[280px] sm:max-w-sm mx-auto"
                />
                <img
                  src="/illustrations/core-values-light.png"
                  alt=""
                  className="illustration dark-only w-full max-w-[280px] sm:max-w-sm mx-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.div 
        {...fadeUp} 
        className="mt-16 sm:mt-20 md:mt-24 pb-12 pt-8 sm:pt-12 border-t border-[var(--border)] px-4 sm:px-6"
      >
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center max-w-7xl mx-auto">
          <Link
            to="/family-tree"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--accent)] text-white rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-all hover:gap-3"
          >
            Start building <span className="text-lg sm:text-xl">→</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}