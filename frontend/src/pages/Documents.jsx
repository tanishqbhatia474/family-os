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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await listDocuments();
      setDocuments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ---------- Actions ---------- */

  const handleDownload = async (id) => {
    const res = await getDownloadUrl(id);
    window.open(res.data.url, "_blank");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document permanently?")) return;
    await deleteDocument(id);
    fetchDocuments();
  };

  /* ---------- Split Docs ---------- */

  const myDocuments = documents.filter(
    d => d.ownerPersonId === user.personId
  );

  const sharedDocuments = documents.filter(
    d => d.ownerPersonId !== user.personId
  );

  /* ---------- UI ---------- */

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center mt-6">
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

      {/* Upload Modal */}
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
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white dark:bg-neutral-900 dark:border-neutral-700">
      <div>
        <h3 className="text-sm font-medium truncate">
          {doc.title || "Untitled Document"}
        </h3>
        <p className="text-xs opacity-70">
          Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onView}
          className="text-sm text-[#5A9684] hover:underline"
        >
          View
        </button>

        {isOwner && (
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <p className="text-sm opacity-70">{text}</p>
  );
}
