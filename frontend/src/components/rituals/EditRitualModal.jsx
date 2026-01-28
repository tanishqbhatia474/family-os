import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateRitual } from "../../api/ritual.api";
import { getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

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
 * - onSaved
 */
export default function EditRitualModal({ ritual, onClose, onSaved }) {
  const { user } = useAuth();

  const [title, setTitle] = useState(ritual.title);
  const [description, setDescription] = useState(ritual.description);
  const [persons, setPersons] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- INIT ---------- */

  useEffect(() => {
    getFamilyPersons()
      .then(res => {
        setPersons(res.data);
        setSelectedIds(
          ritual.viewAccessPersonIds?.map(String) || []
        );
      })
      .catch(() => toast.error("Failed to load family members"));
  }, [ritual]);

  /* ---------- HELPERS ---------- */

  const togglePerson = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ---------- SAVE ---------- */

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      await updateRitual(ritual._id, {
        title: title.trim(),
        description: description.trim(),
        viewAccessPersonIds: selectedIds
      });

      toast.success("Ritual updated");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error("Failed to update ritual");
    } finally {
      setLoading(false);
    }
  };

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
              title="Edit Ritual"
              subtitle="Update details or visibility"
              icon="🕯️"
              onClose={onClose}
            />

            {/* Content */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
              <Section title="Ritual Details" icon="📋">
                <InfoCard>
                  <div className="space-y-3 sm:space-y-4">
                    <InputField
                      label="Ritual Title"
                      icon="✏️"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ritual title"
                    />
                    <Divider />
                    <TextareaField
                      label="Description"
                      icon="📝"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe the ritual…"
                    />
                  </div>
                </InfoCard>
              </Section>

              <Section title="Visible To" icon="👨‍👩‍👧‍👦">
                <InfoCard>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {persons.map(p => {
                      const isOwner =
                        String(p._id) === String(user.personId);

                      return (
                        <label
                          key={p._id}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-transparent hover:border-[var(--accent)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p._id)}
                            disabled={isOwner}
                            onChange={() => togglePerson(p._id)}
                            className="w-4 h-4 sm:w-5 sm:h-5 accent-[var(--accent)]"
                          />

                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--panel)] flex items-center justify-center font-semibold text-xs sm:text-sm text-[var(--text)]">
                            {p.name.charAt(0)}
                          </div>

                          <span className="text-xs sm:text-sm font-medium text-[var(--text)] truncate">
                            {p.name}
                            {isOwner && (
                              <span className="text-[0.65rem] sm:text-xs opacity-60 ml-1">
                                (you)
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-2 sm:mt-3 flex gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
                    <span className="text-sm sm:text-base">ℹ️</span>
                    <p className="text-[0.6875rem] sm:text-xs text-[var(--muted)] leading-relaxed">
                      You always have access to rituals you create.
                    </p>
                  </div>
                </InfoCard>
              </Section>
            </div>

            {/* Actions */}
            <Actions
              primaryLabel={loading ? "Saving…" : "Save Changes"}
              primaryIcon="💾"
              disabled={loading}
              onPrimary={handleSubmit}
              onCancel={onClose}
            />
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
            <h2 className="text-lg sm:text-2xl font-bold text-[var(--text)] truncate">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5 sm:mt-1 line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[var(--border)] flex items-center justify-center flex-shrink-0 text-[var(--text)]"
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

function InputField({ label, icon, ...props }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
      <Label icon={icon} label={label} />
      <input
        {...props}
        className="flex-1 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]"
      />
    </div>
  );
}

function TextareaField({ label, icon, ...props }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
      <Label icon={icon} label={label} />
      <textarea
        {...props}
        rows={4}
        className="flex-1 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] resize-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]"
      />
    </div>
  );
}

function Label({ icon, label }) {
  return (
    <div className="min-w-0 sm:min-w-[120px] flex items-center gap-2 text-xs sm:text-sm text-[var(--muted)]">
      <span>{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

function Actions({ primaryLabel, primaryIcon, disabled, onPrimary, onCancel }) {
  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[var(--border)] space-y-2 sm:space-y-3">
      <button
        onClick={onPrimary}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-[var(--accent)] text-white rounded-full text-sm sm:text-base font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        <span>{primaryIcon}</span>
        {primaryLabel}
      </button>

      <button
        onClick={onCancel}
        className="w-full text-xs sm:text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--border)]" />;
}