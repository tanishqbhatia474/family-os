import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import EditPersonModal from "./EditPersonModal";

const formatDate = date =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

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
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 300 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

export default function PersonProfileModal({
  person,
  personMap,
  people,
  onClose,
  onSaved
}) {
  const { user } = useAuth();
  const isHonor = user?.isHonor;
  const [showEdit, setShowEdit] = useState(false);

  if (!person || !personMap) return null;

  const father = person.fatherId ? personMap[person.fatherId] : null;
  const mother = person.motherId ? personMap[person.motherId] : null;
  const spouses = (person.spouseIds || [])
    .map(id => personMap[id])
    .filter(Boolean);

  const children = Array.isArray(people)
    ? people.filter(
        p =>
          p.fatherId === person._id ||
          p.motherId === person._id
      )
    : [];

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-xl mx-4"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_50%,transparent)] rounded-3xl blur-xl opacity-20"></div>
          
          <div className="relative rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="relative px-8 py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">
                      {person.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        person.isDeceased 
                          ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400' 
                          : 'bg-green-500/20 text-green-700 dark:text-green-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {person.isDeceased ? "Deceased" : "Alive"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <Section title="Basic Information" icon="📋">
                <InfoCard>
                  <Row label="Gender" value={person.gender || "—"} icon="⚧" />
                  <Divider />
                  <Row label="Date of Birth" value={formatDate(person.birthDate)} />
                </InfoCard>
              </Section>

              <Section title="Family Connections">
                <InfoCard>
                  <Row label="Father" value={father?.name || "—"}/>
                  <Divider />
                  <Row label="Mother" value={mother?.name || "—"} />
                  <Divider />
                  <Row
                    label="Spouse(s)"
                    value={
                      spouses.length > 0
                        ? spouses.map(s => s.name).join(", ")
                        : "—"
                    }
                  />
                  <Divider />
                  <Row
                    label="Children"
                    value={children.length > 0 ? children.length : "—"}
                  />
                </InfoCard>
              </Section>

              {children.length > 0 && (
                <Section title="Children" icon="🌱">
                  <div className="grid grid-cols-1 gap-2">
                    {children.map(child => (
                      <div
                        key={child._id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] hover:border-[var(--accent)] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_30%,transparent)] to-[color-mix(in_srgb,var(--accent)_10%,transparent)] flex items-center justify-center text-sm font-semibold text-[var(--text)]">
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--text)]">
                          {child.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Actions */}
            <div className="px-8 py-6 bg-[color-mix(in_srgb,var(--panel)_30%,transparent)] border-t border-[var(--border)] space-y-3">
              {isHonor && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-full font-semibold text-base hover:opacity-90 transition-all shadow-lg group"
                >
                  <span className="text-lg">✏️</span>
                  <span>Edit Details</span>
                  <span className="text-lg group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-base font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        {showEdit && (
          <EditPersonModal
            person={person}
            onClose={() => setShowEdit(false)}
            onSaved={async () => {
              await onSaved?.();
              setShowEdit(false);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* helpers */

function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
        <span className="text-xl">{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

function InfoCard({ children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] p-4 space-y-3">
      {children}
    </div>
  );
}

function Row({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[var(--muted)]">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[var(--text)] text-right">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--border)]"></div>;
}