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
          <div className="relative rounded-2xl sm:rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0">
                    📄
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[var(--text)]">Upload Document</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-[var(--border)] flex items-center justify-center flex-shrink-0 text-[var(--text)]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
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
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer hover:bg-[var(--panel)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => togglePerson(p._id)}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-[var(--accent)]"
                      />
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--panel)] flex items-center justify-center font-semibold text-xs sm:text-sm text-[var(--text)]">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[var(--text)] truncate">
                        {p.name}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[var(--border)]">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[var(--accent)] text-white py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
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
      <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[var(--text)]">
        <span className="text-lg sm:text-xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({ label, placeholder, ...props }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}
      <input
        {...props}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-[var(--border)] rounded-lg sm:rounded-xl bg-transparent text-[var(--text)] text-sm sm:text-base placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
      />
    </div>
  );
}


function FileField({ file, onChange }) {
  return (
    <label className="block border-2 border-dashed border-[var(--border)] rounded-lg sm:rounded-xl p-4 sm:p-6 cursor-pointer hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--panel)_30%,transparent)] transition-all text-center">
      <div className="space-y-2">
        <div className="text-2xl sm:text-3xl">📎</div>
        <div className="text-xs sm:text-sm text-[var(--text)] font-medium">
          {file ? (
            <span className="text-[var(--accent)]">{file.name}</span>
          ) : (
            <>
              <span className="hidden sm:inline">Click to choose a file or drag and drop</span>
              <span className="sm:hidden">Tap to choose a file</span>
            </>
          )}
        </div>
        {!file && (
          <div className="text-[0.6875rem] sm:text-xs text-[var(--muted)]">
            PDF, Images, Documents
          </div>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        onChange={onChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
      />
    </label>
  );
}