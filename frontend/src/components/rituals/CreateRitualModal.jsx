import { useEffect, useState } from "react";
import { createRitual } from "../../api/ritual.api";
import { getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

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
        // ❌ remove logged-in user
        const filtered = res.data.filter(
          p => String(p._id) !== String(user.personId)
        );
        setPersons(filtered);
      })
      .catch(() => {
        toast.error("Failed to load family members");
      });
  }, [user.personId]);

  const togglePerson = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      onCreated();
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
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-neutral-900/20 dark:bg-black/70"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-[460px] rounded-2xl p-6 space-y-6 bg-white dark:bg-neutral-900 shadow-2xl"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Create Ritual</h2>
            <button onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              placeholder="Ritual title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="control w-full"
            />

            <textarea
              placeholder="Describe the ritual…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="control w-full resize-none"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Share with family members
              </p>

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
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
