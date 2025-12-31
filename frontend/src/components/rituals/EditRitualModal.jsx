import { useEffect, useState } from "react";
import { updateRitual } from "../../api/ritual.api";
import { getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

/**
 * Props:
 * - ritual
 * - onClose
 * - onSaved (refresh rituals list)
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
    getFamilyPersons().then(res => {
      setPersons(res.data);

      // Pre-fill access list
      setSelectedIds(
        ritual.viewAccessPersonIds?.map(String) || []
      );
    });
  }, [ritual]);

  /* ---------- HELPERS ---------- */

  const togglePerson = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  /* ---------- SAVE ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);

    try {
      await updateRitual(ritual._id, {
        title,
        description,
        viewAccessPersonIds: selectedIds
      });

      toast.success("Ritual updated");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Update ritual failed:", err);
      toast.error("Failed to update ritual");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-bg edit-modal rounded-xl p-6 space-y-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="card-title text-lg">
            Edit Ritual
          </h2>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ritual title"
            className="w-full rounded-md px-3 py-2 text-sm control"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ritual description"
            rows={4}
            className="w-full rounded-md px-3 py-2 text-sm control resize-none"
          />

          {/* Share */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Visible to family members
            </p>

            <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {persons.map(p => {
                const isOwner =
                  String(p._id) === String(user.personId);

                return (
                  <label
                    key={p._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p._id)}
                      disabled={isOwner}
                      onChange={() => togglePerson(p._id)}
                    />
                    {p.name}
                    {isOwner && (
                      <span className="text-xs opacity-60">
                        (you)
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <p className="text-xs opacity-70">
              You always have access to rituals you create.
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
              disabled={loading}
              className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
