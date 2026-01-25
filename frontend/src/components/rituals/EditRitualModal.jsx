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
          {/* glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_50%,transparent)] rounded-3xl blur-xl opacity-20" />

          <div className="relative rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            {/* Header */}
            <Header
              title="Edit Ritual"
              subtitle="Update details or visibility"
              icon="🕯️"
              onClose={onClose}
            />

            {/* Content */}
            <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <Section title="Ritual Details" icon="📋">
                <InfoCard>
                  <div className="space-y-4">
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
                          className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[var(--accent)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p._id)}
                            disabled={isOwner}
                            onChange={() => togglePerson(p._id)}
                          />

                          <div className="w-8 h-8 rounded-lg bg-[var(--panel)] flex items-center justify-center font-semibold">
                            {p.name.charAt(0)}
                          </div>

                          <span className="text-sm font-medium">
                            {p.name}
                            {isOwner && (
                              <span className="text-xs opacity-60 ml-1">
                                (you)
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex gap-2 p-3 rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
                    <span>ℹ️</span>
                    <p className="text-xs text-[var(--muted)]">
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
    <div className="px-8 py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">
              {title}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[var(--border)] flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-base font-bold">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoCard({ children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] p-4">
      {children}
    </div>
  );
}

function InputField({ label, icon, ...props }) {
  return (
    <div className="flex gap-4 items-center">
      <Label icon={icon} label={label} />
      <input
        {...props}
        className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  );
}

function TextareaField({ label, icon, ...props }) {
  return (
    <div className="flex gap-4">
      <Label icon={icon} label={label} />
      <textarea
        {...props}
        rows={4}
        className="flex-1 rounded-xl px-4 py-2.5 text-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] resize-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  );
}

function Label({ icon, label }) {
  return (
    <div className="min-w-[120px] flex items-center gap-2 text-sm text-[var(--muted)]">
      <span>{icon}</span>
      {label}
    </div>
  );
}

function Actions({ primaryLabel, primaryIcon, disabled, onPrimary, onCancel }) {
  return (
    <div className="px-8 py-6 border-t border-[var(--border)] space-y-3">
      <button
        onClick={onPrimary}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-full font-semibold disabled:opacity-50"
      >
        <span>{primaryIcon}</span>
        {primaryLabel}
      </button>

      <button
        onClick={onCancel}
        className="w-full text-sm text-[var(--muted)]"
      >
        Cancel
      </button>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--border)]" />;
}
