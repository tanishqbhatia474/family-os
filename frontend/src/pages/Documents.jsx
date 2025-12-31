import { useEffect, useState } from "react";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import {
  listDocuments,
  getDownloadUrl,
  deleteDocument
} from "../api/document.api";
import { useAuth } from "../context/AuthContext";

export default function Documents() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /* ---------- FETCH ---------- */

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await listDocuments();

      console.log("📄 RAW DOCUMENTS FROM API:", res.data);
      console.log("👤 LOGGED IN USER:", user);

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

  /* ---------- ACTIONS ---------- */

  const handleDownload = async (id) => {
    console.log("⬇️ View clicked for document:", id);
    const res = await getDownloadUrl(id);
    console.log("🔗 Signed URL:", res.data.url);
    window.open(res.data.url, "_blank");
  };

  const handleDelete = async (id) => {
    console.log("🗑️ Delete clicked for document:", id);
    if (!confirm("Delete this document permanently?")) return;
    await deleteDocument(id);
    fetchDocuments();
  };

  /* ---------- DEBUG SPLIT ---------- */

  const myDocuments = documents.filter(d => {
    console.log("---- CHECK MY DOC ----");
    console.log("doc._id:", d._id);
    console.log("doc.ownerPersonId:", d.ownerPersonId);
    console.log("user.personId:", user.personId);

    const ownerId =
      typeof d.ownerPersonId === "object"
        ? d.ownerPersonId._id
        : d.ownerPersonId;

    console.log("normalized ownerId:", ownerId);
    console.log(
      "MATCH:",
      String(ownerId) === String(user.personId)
    );

    return String(ownerId) === String(user.personId);
  });

  const sharedDocuments = documents.filter(d => {
    const ownerId =
      typeof d.ownerPersonId === "object"
        ? d.ownerPersonId._id
        : d.ownerPersonId;

    return String(ownerId) !== String(user.personId);
  });

  console.log("✅ MY DOCUMENTS:", myDocuments);
  console.log("🤝 SHARED DOCUMENTS:", sharedDocuments);

  /* ---------- UI ---------- */

  return (
    <div className="relative z-10 space-y-10">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium">Documents</h1>
          <p className="text-sm opacity-70">
            Files shared within your family
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4C7F70]"
        >
          Upload Document
        </button>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading documents…</p>
      ) : (
        <>
          {/* My Documents */}
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
                    onView={() => handleDownload(doc._id)}
                    onDelete={() => handleDelete(doc._id)}
                  />
                ))}
              </DocumentGrid>
            )}
          </Section>

          {/* Shared With Me */}
          <Section title="Shared With Me">
            {sharedDocuments.length === 0 ? (
              <Empty text="No documents shared with you." />
            ) : (
              <DocumentGrid>
                {sharedDocuments.map(doc => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onView={() => handleDownload(doc._id)}
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

function DocumentCard({ doc, onView, onDelete, isOwner }) {
  console.log(
    "🧩 RENDER CARD:",
    doc._id,
    "isOwner:",
    isOwner
  );

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
        <button
          onClick={onView}
          className="card-link text-sm font-medium"
        >
          View
        </button>

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
