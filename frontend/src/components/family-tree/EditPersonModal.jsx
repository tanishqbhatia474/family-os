import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  editPerson,
  getFamilyPersons,
  setFather,
  setMother
} from "../../api/person.api";

export default function EditPersonModal({ person, onClose, onSaved }) {
  const [name, setName] = useState(person.name);
  const [gender, setGender] = useState(person.gender || "");
  const [isDeceased, setIsDeceased] = useState(person.isDeceased || false);

  const [birthDate, setBirthDate] = useState(
    person.birthDate ? person.birthDate.slice(0, 10) : ""
  );

  const [fatherId, setFatherId] = useState(
    typeof person.fatherId === "string" ? person.fatherId : ""
  );
  const [motherId, setMotherId] = useState(
    typeof person.motherId === "string" ? person.motherId : ""
  );

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      await editPerson(person._id, {
        name: name.trim(),
        gender: gender.toLowerCase(),
        birthDate: birthDate || null,
        isDeceased
      });

      if (fatherId !== (person.fatherId || "")) {
        await setFather(person._id, fatherId || null);
      }

      if (motherId !== (person.motherId || "")) {
        await setMother(person._id, motherId || null);
      }

      toast.success("Person updated");

      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to save"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card-bg edit-modal rounded-xl p-6 space-y-4 shadow-xl w-full max-w-xl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="card-title text-lg">Edit Person</h3>
          <button
            onClick={onClose}
            className="text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="control w-full"
          placeholder="Full name"
        />

        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          className="control w-full"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          className="control w-full"
        />

        <select
          value={fatherId}
          onChange={e => setFatherId(e.target.value)}
          className="control w-full"
        >
          <option value="">Select father (optional)</option>
          {persons
            .filter(p => p.gender === "male" && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </select>

        <select
          value={motherId}
          onChange={e => setMotherId(e.target.value)}
          className="control w-full"
        >
          <option value="">Select mother (optional)</option>
          {persons
            .filter(p => p.gender === "female" && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isDeceased}
            onChange={e => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="text-sm opacity-70 hover:opacity-100 cursor-pointer"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            type="button"
            className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
