import { useEffect, useState } from "react";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import {
  listDocuments,
  getDownloadUrl,
  deleteDocument
} from "../api/document.api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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

  const handleView = async (doc) => {
    try {
      const res = await getDownloadUrl(doc._id);
      window.open(res.data.url, "_blank");
      toast.info("Opened document", {
        description: "Link valid for 5 minutes",
      });
    } catch {
      toast.error("Failed to open document");
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

      toast.success("Download started", {
        description: "Link valid for 5 minutes",
      });
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

  const myDocumentsRaw = documents.filter(d => {
    const ownerId =
      typeof d.ownerPersonId === "object"
        ? d.ownerPersonId._id
        : d.ownerPersonId;
    return String(ownerId) === String(user.personId);
  });

  const sharedDocumentsRaw = documents.filter(d => {
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

  const myDocuments = sortDocs(myDocumentsRaw.filter(matchesSearch));
  const sharedDocuments = sortDocs(sharedDocumentsRaw.filter(matchesSearch));

  return (
    <div className="relative z-10 space-y-10 mt-15">

      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-medium">Documents</h1>
          <p className="text-sm opacity-70">
            Files shared within your family
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search by title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="control"
          />

          {/* 🔃 Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control"
          >
            <option value="recent">Recent</option>
            <option value="az">A–Z</option>
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4C7F70]"
          >
            Upload Document
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading documents…</p>
      ) : (
        <>
          <Section title="My Documents">
            {myDocuments.length === 0 ? (
              <Empty text="You haven’t uploaded any documents yet." />
            ) : (
              <DocumentGrid>
                {myDocuments.map(doc => (
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

          <Section title="Shared With Me">
            {sharedDocuments.length === 0 ? (
              <Empty text="No documents shared with you." />
            ) : (
              <DocumentGrid>
                {sharedDocuments.map(doc => (
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
  );
}

/* ---------- UI Helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </div>
  );
}

function DocumentGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function DocumentCard({ doc, onView, onDownload, onDelete, isOwner }) {
  return (
    <div className="card-bg border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="card-title text-[0.95rem] font-medium truncate">
          {doc.title || "Untitled Document"}
        </h3>
        <p className="card-meta text-xs">
          Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button onClick={onView} className="card-link text-sm font-medium">
            View
          </button>
          <button onClick={onDownload} className="card-link text-sm font-medium">
            Download
          </button>
        </div>

        {isOwner && (
          <button
            onClick={onDelete}
            className="card-link delete text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm opacity-70">{text}</p>;
}
