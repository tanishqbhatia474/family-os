import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRitual } from "../../api/ritual.api";
import { getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

/* ---------------- animations (same as UploadDocumentModal) ---------------- */

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

export default function CreateRitualModal({ onClose, onCreated }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [persons, setPersons] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFamilyPersons()
      .then(res => {
        const filtered = res.data.filter(
          p => String(p._id) !== String(user.personId)
        );
        setPersons(filtered);
      })
      .catch(() => toast.error("Failed to load family members"));
  }, [user.personId]);

  const togglePerson = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      await createRitual({
        title: title.trim(),
        description: description.trim(),
        viewAccessPersonIds: selectedIds
      });

      toast.success("Ritual created");
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create ritual"
      );
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
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_50%,transparent)] rounded-3xl blur-xl opacity-20" />

          <div className="relative rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            {/* Header */}
            <Header
              title="Create Ritual"
              subtitle="Preserve and share meaningful family practices"
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
                      placeholder="e.g. Diwali morning puja"
                    />
                    <Divider />
                    <TextareaField
                      label="Description"
                      icon="📝"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe how this ritual is performed…"
                    />
                  </div>
                </InfoCard>
              </Section>

              <Section title="Share With Family" icon="👨‍👩‍👧‍👦">
                <InfoCard>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {persons.map(p => (
                      <PersonCheckbox
                        key={p._id}
                        person={p}
                        checked={selectedIds.includes(p._id)}
                        onToggle={() => togglePerson(p._id)}
                      />
                    ))}
                  </div>
                </InfoCard>
              </Section>
            </div>

            {/* Actions */}
            <Actions
              primaryLabel={loading ? "Creating…" : "Create Ritual"}
              primaryIcon="✨"
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

/* ---------------- helper components (same style as upload modal) ---------------- */

function Header({ title, subtitle, icon, onClose }) {
  return (
    <div className="px-8 py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
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

function PersonCheckbox({ person, checked, onToggle }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl hover:border-[var(--accent)] border border-transparent cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div className="w-8 h-8 rounded-lg bg-[var(--panel)] flex items-center justify-center font-semibold">
        {person.name.charAt(0)}
      </div>
      <span className="text-sm font-medium">{person.name}</span>
    </label>
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
