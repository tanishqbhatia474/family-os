import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  editPerson,
  getFamilyPersons,
  setFather,
  setMother,
  addSpouse,
  removeSpouse
} from "../../api/person.api";

/* ---------- Helpers ---------- */
const isParentOlderThanChild = (parentDob, childDob) => {
  if (!parentDob || !childDob) return false;
  return new Date(parentDob) < new Date(childDob);
};

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
  const [spouseIdToAdd, setSpouseIdToAdd] = useState("");
  const [spouseLoading, setSpouseLoading] = useState(false);

  // Helper: get current spouses
  const currentSpouses = person.spouseIds
    ? persons.filter(p => person.spouseIds.includes(p._id))
    : [];

  // Helper: get eligible spouses
  const eligibleSpouses = persons.filter(p =>
    p._id !== person._id &&
    !p.isDeceased &&
    !(person.spouseIds || []).includes(p._id) &&
    !(p.spouseIds || []).includes(person._id)
  );

  // Mutual exclusion logic
  const hasSpouse = (person.spouseIds && person.spouseIds.length > 0);
  const hasParent = !!fatherId || !!motherId;

  // Remove spouse handler
  const handleRemoveSpouse = async spouseId => {
    setSpouseLoading(true);
    setError("");
    try {
      await removeSpouse(person._id, spouseId);
      await getFamilyPersons().then(res => setPersons(res.data));
      toast.success("Spouse removed");
      setSpouseIdToAdd("");
      await onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to remove spouse");
    } finally {
      setSpouseLoading(false);
    }
  };

  // Add spouse handler
  const handleAddSpouse = async () => {
    if (!spouseIdToAdd) return;
    setSpouseLoading(true);
    setError("");
    try {
      await addSpouse(person._id, spouseIdToAdd);
      await getFamilyPersons().then(res => setPersons(res.data));
      toast.success("Spouse added");
      setSpouseIdToAdd("");
      await onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to add spouse");
    } finally {
      setSpouseLoading(false);
    }
  };

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      /* ---------- BASIC ---------- */
      if (!name.trim()) return setError("Full name is required");
      if (!gender) return setError("Gender is required");

      const birth = birthDate ? new Date(birthDate) : null;

      /* ---------- FATHER VALIDATION ---------- */
      if (fatherId) {
        const father = persons.find(p => p._id === fatherId);
        if (!father) return setError("Invalid father selected");
        if (father.gender !== "male")
          return setError("Father must be male");
        if (father.isDeceased)
          return setError("Deceased person cannot be a parent");
        if (
          father.birthDate &&
          birth &&
          !isParentOlderThanChild(father.birthDate, birth)
        )
          return setError("Father must be older than the person");
      }

      /* ---------- MOTHER VALIDATION ---------- */
      if (motherId) {
        const mother = persons.find(p => p._id === motherId);
        if (!mother) return setError("Invalid mother selected");
        if (mother.gender !== "female")
          return setError("Mother must be female");
        if (mother.isDeceased)
          return setError("Deceased person cannot be a parent");
        if (
          mother.birthDate &&
          birth &&
          !isParentOlderThanChild(mother.birthDate, birth)
        )
          return setError("Mother must be older than the person");
      }

      /* ---------- SAVE CORE ---------- */
      await editPerson(person._id, {
        name: name.trim(),
        gender,
        birthDate: birthDate || null,
        isDeceased
      });

      /* ---------- RELATIONS ---------- */
      if (fatherId !== (person.fatherId || "")) {
        await setFather(person._id, fatherId || null);
      }

      if (motherId !== (person.motherId || "")) {
        await setMother(person._id, motherId || null);
      }

      toast.success("Person updated");
      await onSaved?.();
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

        <div className="flex justify-between items-center">
          <h3 className="card-title text-lg">Edit Person</h3>
          <button onClick={onClose} className="opacity-70">✕</button>
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

        {/* Parents Section */}
        <select
          value={fatherId}
          onChange={e => setFatherId(e.target.value)}
          className="control w-full"
          disabled={hasSpouse}
        >
          <option value="">Select father (optional)</option>
          {persons
            .filter(p => p.gender === "male" && !p.isDeceased && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
        </select>

        <select
          value={motherId}
          onChange={e => setMotherId(e.target.value)}
          className="control w-full"
          disabled={hasSpouse}
        >
          <option value="">Select mother (optional)</option>
          {persons
            .filter(p => p.gender === "female" && !p.isDeceased && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
        </select>

        {/* Spouse(s) Section */}
        <div>
          <label className="section-label block mb-1">Spouse(s)</label>
          {currentSpouses.length === 0 && <div className="text-sm text-gray-500">None</div>}
          <ul className="space-y-1 mb-2">
            {currentSpouses.map(spouse => (
              <li key={spouse._id} className="flex items-center gap-2">
                <span className="card-meta">{spouse.name}</span>
                <button
                  className="card-link text-xs px-2 py-1 rounded"
                  disabled={isDeceased || spouseLoading}
                  onClick={() => handleRemoveSpouse(spouse._id)}
                  title="Remove spouse"
                >✕</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 items-center">
            <select
              value={spouseIdToAdd}
              onChange={e => setSpouseIdToAdd(e.target.value)}
              className="control w-full"
              disabled={isDeceased || hasParent || spouseLoading}
            >
              <option value="">Add spouse</option>
              {eligibleSpouses.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button
              className="card-link px-3 py-1 rounded"
              disabled={isDeceased || hasParent || spouseLoading || !spouseIdToAdd}
              onClick={handleAddSpouse}
            >Add</button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isDeceased}
            onChange={e => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="opacity-70">Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
