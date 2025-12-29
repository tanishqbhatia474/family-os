import { useEffect, useState } from "react";
import { updatePersonParents, getFamilyPersons } from "../../api/person.api";

export default function EditPersonModal({ person, onClose, onSaved }) {
  const [persons, setPersons] = useState([]);
  const [fatherId, setFatherId] = useState(person.fatherId || "");
  const [motherId, setMotherId] = useState(person.motherId || "");
  const [gender, setGender] = useState(person.gender || "");
  const [isDeceased, setIsDeceased] = useState(person.isDeceased || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const handleSave = async () => {
    setLoading(true);

    await updatePersonParents(person._id, {
      fatherId: fatherId || null,
      motherId: motherId || null,
      gender,
      isDeceased,
    });

    await onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] space-y-5">

        <h3 className="text-lg font-medium">
          Edit Details — {person.name}
        </h3>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-600">Gender</label>
          <div className="flex gap-4">
            {["Male", "Female", "Other"].map(g => (
              <label key={g} className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Deceased */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-600">Status</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={!isDeceased}
                onChange={() => setIsDeceased(false)}
              />
              Alive
            </label>
            <label>
              <input
                type="radio"
                checked={isDeceased}
                onChange={() => setIsDeceased(true)}
              />
              Deceased
            </label>
          </div>
        </div>

        {/* Parents */}
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled
            className="bg-neutral-400 text-white px-4 py-2 rounded cursor-not-allowed"
          >
            Save (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
