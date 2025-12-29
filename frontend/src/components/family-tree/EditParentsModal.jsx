import { useState, useEffect } from "react";
import { updatePersonParents, getFamilyPersons } from "../../api/person.api";

export default function EditParentsModal({ person, onClose, onSaved }) {
  const [persons, setPersons] = useState([]);
  const [fatherId, setFatherId] = useState(person.fatherId || "");
  const [motherId, setMotherId] = useState(person.motherId || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await updatePersonParents(person._id, {
      fatherId: fatherId || null,
      motherId: motherId || null,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[360px] space-y-4">
        <h3 className="text-lg font-medium">
          Edit Parents — {person.name}
        </h3>

        <select
          className="w-full border px-3 py-2 rounded"
          value={fatherId}
          onChange={(e) => setFatherId(e.target.value)}
        >
          <option value="">Select Father</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          className="w-full border px-3 py-2 rounded"
          value={motherId}
          onChange={(e) => setMotherId(e.target.value)}
        >
          <option value="">Select Mother</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
