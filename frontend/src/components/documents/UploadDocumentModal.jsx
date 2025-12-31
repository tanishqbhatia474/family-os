import { useEffect, useState } from "react";
import { uploadDocument } from "../../api/document.api";
import { getFamilyPersons } from "../../api/person.api";
import { toast } from "sonner";

export default function UploadDocumentModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [persons, setPersons] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const togglePerson = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      selectedIds.forEach(id =>
        formData.append("viewAccessPersonIds", id)
      );
      await uploadDocument(formData);
      toast.success("Document uploaded", {
        description: "Available to selected family members",
      });
      onUploaded();
      onClose();
    } catch (err) {
    console.error("Upload failed:", err);
    
    let message = "Upload failed";

    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        message = err.response.data;
      } else if (err.response.data.message) {
        message = err.response.data.message;
      } else {
        message = JSON.stringify(err.response.data);
      }
    } else if (err.message) {
      message = err.message;
    }

    toast.error("Upload failed", {
      description: message,
    });

  } finally {
    setLoading(false);
  }
  };
  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="
          absolute inset-0
          bg-neutral-900/20
          dark:bg-black/70
        "
        onClick={onClose}
      />

      {/* Modal wrapper */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="
            relative w-[460px] rounded-2xl p-6 space-y-6
            bg-white text-neutral-900 shadow-2xl
            dark:bg-neutral-900 dark:text-neutral-100
          "
          onClick={(e) => e.stopPropagation()}
        >


        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Upload Document</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            placeholder="Document title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="
              w-full rounded-lg px-3 py-2 text-sm
              border border-neutral-300
              bg-white text-neutral-900
              dark:border-neutral-700
              dark:bg-neutral-800 dark:text-neutral-100
            "
          />

          {/* File */}
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            className="text-sm"
          />

          {/* Share */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Share with family members</p>

            <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {persons.map(p => (
                <label key={p._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={() => togglePerson(p._id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>

            <p className="text-xs opacity-70">
              You always have access to your own documents.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm opacity-70 hover:opacity-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !file}
              className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
