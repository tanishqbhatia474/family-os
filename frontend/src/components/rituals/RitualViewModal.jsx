import { motion, AnimatePresence } from "framer-motion";

/* ---------------- animations ---------------- */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

/**
 * Props:
 * - ritual
 * - onClose
 */
export default function RitualViewModal({ ritual, onClose }) {
  if (!ritual) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-xl"
        >
          {/* glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_50%,transparent)] rounded-2xl sm:rounded-3xl blur-xl opacity-20" />

          <div className="relative rounded-2xl sm:rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            {/* Header */}
            <Header
              title={ritual.title}
              subtitle={`Created on ${new Date(
                ritual.createdAt
              ).toLocaleDateString()}`}
              icon="🕯️"
              onClose={onClose}
            />

            {/* Content */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
              <Section title="Description" icon="📝">
                <InfoCard>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-[var(--text)]">
                    {ritual.description}
                  </p>
                </InfoCard>
              </Section>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[var(--border)]">
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel)] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- helper components ---------------- */

function Header({ title, subtitle, icon, onClose }) {
  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
      <div className="flex justify-between items-start gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-[var(--text)] leading-tight break-words">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 sm:mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[var(--text)]">
        <span className="text-lg sm:text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoCard({ children }) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] p-3 sm:p-4">
      {children}
    </div>
  );
}