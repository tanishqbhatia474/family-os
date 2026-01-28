import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import {
  listDocuments,
  getDownloadUrl,
  getViewUrl,
  deleteDocument
} from "../api/document.api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/* ---------- animations ---------- */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.08 }
  }
};

/* ---------- main component ---------- */

export default function Documents() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await listDocuments();
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ listDocuments failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ---------- actions ---------- */

  const handleView = async (doc) => {
    try {
      const res = await getViewUrl(doc._id);
      if (!res.data?.url) throw new Error("No view URL");

      const viewerUrl = `/viewer?url=${encodeURIComponent(res.data.url)}`;
      window.open(viewerUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Failed to open file");
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await getDownloadUrl(doc._id);
      const link = document.createElement("a");
      link.href = res.data.url;
      link.download = doc.title || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started", { duration: 1000 });
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document permanently?")) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  /* ---------- data ---------- */

  const myDocuments = documents.filter(d => {
    const ownerId =
      typeof d.ownerPersonId === "object"
        ? d.ownerPersonId._id
        : d.ownerPersonId;
    return String(ownerId) === String(user.personId);
  });

  const sharedDocuments = documents.filter(d => {
    const ownerId =
      typeof d.ownerPersonId === "object"
        ? d.ownerPersonId._id
        : d.ownerPersonId;
    return String(ownerId) !== String(user.personId);
  });

  const matchesSearch = (doc) =>
    (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase());

  const sortDocs = (docs) => {
    const sorted = [...docs];
    if (sortBy === "az") {
      sorted.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  };

  /* ---------- render ---------- */

  return (
    <div className="relative min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-24 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] shadow-lg mb-3 sm:mb-4">
              <ArchiveIcon size="md" />
            </div>

            <h1 className="text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-[var(--text)]">
              Keep important documents{" "}
              <span className="text-[var(--accent)]">safe</span>
            </h1>

            <p className="text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-[var(--muted)] max-w-2xl">
              Store family certificates, records, and important files — privately,
              securely, and easy to find when you need them.
            </p>
          </motion.div>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[var(--muted)] max-w-3xl">
            <span className="font-medium text-[var(--text)]">
              Note:
            </span>{" "}
            For security reasons, document viewing links expire after{" "}
            <span className="font-medium">5 minutes</span>.  
            If a document doesn't open, simply click{" "}
            <span className="font-medium">Open</span> again to generate a fresh link.
          </p>
        </div>
      </section>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 rounded-2xl bg-transparent p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 bg-[var(--accent)] text-white placeholder:text-white/70 border-transparent focus:border-white focus:ring-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
              style={{ colorScheme: 'dark' }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--accent)] text-white border-transparent focus:border-white focus:ring-0 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all"
              style={{ colorScheme: 'dark' }}
            >
              <option value="recent">Recent</option>
              <option value="az">A–Z</option>
            </select>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--accent)] text-white rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-all shadow-lg whitespace-nowrap"
          >
            Upload Document
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="inline-flex items-center gap-3 text-[var(--muted)]">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Loading documents…</span>
            </div>
          </motion.div>
        ) : (
          <>
            <Section title="My Documents" count={myDocuments.length}>
              {myDocuments.length === 0 ? (
                <Empty
                  icon={<ArchiveIcon size="lg" faded invert/>}
                  title="No documents yet"
                  text="Upload your first family document to get started."
                  action={
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--border)] rounded-full font-medium text-sm text-[var(--text)] hover:border-[var(--accent)] transition-all mt-4"
                    >
                      <span>Upload Document</span>
                      <span className="text-lg">→</span>
                    </button>
                  }
                />
              ) : (
                <DocumentGrid>
                  {sortDocs(myDocuments.filter(matchesSearch)).map(doc => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      isOwner
                      onView={() => handleView(doc)}
                      onDownload={() => handleDownload(doc)}
                      onDelete={() => handleDelete(doc._id)}
                    />
                  ))}
                </DocumentGrid>
              )}
            </Section>

            <Section title="Shared With Me" count={sharedDocuments.length}>
              {sharedDocuments.length === 0 ? (
                <Empty
                  icon="🤝"
                  title="No shared documents"
                  text="Documents shared by family members will appear here."
                />
              ) : (
                <DocumentGrid>
                  {sortDocs(sharedDocuments.filter(matchesSearch)).map(doc => (
                    <DocumentCard
                      key={doc._id}
                      doc={doc}
                      onView={() => handleView(doc)}
                      onDownload={() => handleDownload(doc)}
                    />
                  ))}
                </DocumentGrid>
              )}
            </Section>
          </>
        )}

        {showUploadModal && (
          <UploadDocumentModal
            onClose={() => setShowUploadModal(false)}
            onUploaded={fetchDocuments}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({ title, count, children }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-50px" }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
          {title}
        </h2>
        <span className="inline-flex items-center justify-center min-w-[1.75rem] sm:min-w-[2rem] h-7 sm:h-8 px-2 sm:px-3 rounded-full bg-[var(--accent)] text-white text-xs sm:text-sm font-bold">
          {count}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function DocumentGrid({ children }) {
  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      {children}
    </motion.div>
  );
}

function DocumentCard({ doc, onView, onDownload, onDelete, isOwner }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-[var(--accent)] hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] shadow-md flex items-center justify-center">
          <ArchiveIcon size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-[1.0625rem] font-semibold text-[var(--text)] mb-1.5 sm:mb-2 line-clamp-1">
            {doc.title || "Untitled"}
          </h3>
          <p className="text-xs sm:text-[0.8125rem] text-[var(--muted)]">
            {new Date(doc.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView();
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] hover:gap-2 transition-all group/btn"
        >
          <span>Open</span>
          <span className="text-sm sm:text-base group-hover/btn:translate-x-0.5 transition-transform">→</span>
        </button>

        <button
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] hover:gap-2 transition-all group/btn"
        >
          <span>Download</span>
          <span className="text-sm sm:text-base">↓</span>
        </button>

        {isOwner && (
          <button
            onClick={onDelete}
            className="ml-auto text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Empty({ icon, title, text, action }) {
  return (
    <motion.div
      variants={fadeUp}
      className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_40%,transparent)]"
    >
      {icon && (
        <div className="mb-3 sm:mb-4 flex justify-center">
          {typeof icon === 'string' ? (
            <div className="text-5xl sm:text-6xl opacity-40">{icon}</div>
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-[var(--muted)] max-w-md mx-auto">{text}</p>
      {action}
    </motion.div>
  );
}

function ArchiveIcon({ size = "md", faded, invert = false }) {
  const sizes = { 
    sm: "w-6 h-6 sm:w-7 sm:h-7", 
    md: "w-8 h-8 sm:w-10 sm:h-10", 
    lg: "w-12 h-12 sm:w-16 sm:h-16" 
  };

  return (
    <>
      <img
        src={invert ? "/illustrations/ArchiveDark.png" : "/illustrations/ArchiveLight.png"}
        className={`illustration light-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Archive"
      />
      <img
        src={invert ? "/illustrations/ArchiveLight.png" : "/illustrations/ArchiveDark.png"}
        className={`illustration dark-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Archive"
      />
    </>
  );
}