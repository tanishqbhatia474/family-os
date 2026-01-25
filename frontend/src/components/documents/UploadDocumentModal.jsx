import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFamilyPersons } from "../../api/person.api";
import { uploadDocument } from "../../api/document.api";
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

export default function UploadDocumentModal({ onClose, onUploaded }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [persons, setPersons] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- load family members (same as rituals) ---------- */
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
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!title.trim()) {
      toast.error("Document title is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      selectedIds.forEach(id => {
        formData.append("viewAccessPersonIds[]", id);
      });

      await uploadDocument(formData);

      toast.success("Document uploaded");
      onUploaded?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to upload document"
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
          <div className="relative rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">Upload Document</h2>
                <button onClick={onClose}>✕</button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <InputField
                label="Document Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Birth Certificate"
              />

              <FileField
                file={file}
                onChange={e => setFile(e.target.files[0])}
              />

              <Section title="Share With Family" icon="👨‍👩‍👧‍👦">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {persons.map(p => (
                    <label
                      key={p._id}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--panel)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => togglePerson(p._id)}
                      />
                      <span className="text-sm font-medium">
                        {p.name}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 border-t border-[var(--border)]">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[var(--accent)] text-white py-3 rounded-full font-semibold disabled:opacity-50"
              >
                {loading ? "Uploading…" : "Upload Document"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- helpers ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="space-y-2">
      <h3 className="flex gap-2 font-bold">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({ label, placeholder, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}
      <input
        {...props}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-xl bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]"
      />
    </div>
  );
}


function FileField({ file, onChange }) {
  return (
    <label className="block border-2 border-dashed rounded-xl p-4 cursor-pointer">
      {file ? file.name : "Choose file…"}
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}
