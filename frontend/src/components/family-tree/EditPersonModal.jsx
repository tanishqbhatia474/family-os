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
    // 1️⃣ Update basic fields (this already works)
    await editPerson(person._id, {
      name: name.trim(),
      gender: gender.toLowerCase(),
      isDeceased
    });

    // 2️⃣ Update father ONLY if changed
    if (fatherId !== (person.fatherId || "")) {
      await setFather(person._id, fatherId || null);
    }

    // 3️⃣ Update mother ONLY if changed
    if (motherId !== (person.motherId || "")) {
      await setMother(person._id, motherId || null);
    }

    toast.success("Person updated", {
      description: `${name} details were saved successfully.`,
    });

    if (typeof onSaved === "function") {
      await onSaved();
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="
          w-[420px]
          rounded-xl p-6 space-y-5
          bg-white text-neutral-900
          dark:bg-[#0f1f1a] dark:text-neutral-100
          shadow-xl
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Edit Person</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}

        {/* Name */}
        <Input value={name} onChange={setName} />

        {/* Gender */}
        <Select value={gender} onChange={setGender}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>

        {/* Parents */}
        <Select value={fatherId} onChange={setFatherId}>
          <option value="">Father</option>
          {persons
            .filter(p => p.gender === "male" && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </Select>

        <Select value={motherId} onChange={setMotherId}>
          <option value="">Mother</option>
          {persons
            .filter(p => p.gender === "female" && p._id !== person._id)
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </Select>


        {/* Deceased */}
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={isDeceased}
            onChange={e => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="
              text-sm text-neutral-600
              hover:text-neutral-900
              dark:text-neutral-400 dark:hover:text-neutral-100
              transition-colors
              cursor-pointer
            "
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="
              bg-[#1F3D34] text-white
              px-4 py-2 rounded-md text-sm
              hover:bg-[#183128]
              disabled:opacity-60
              transition-colors
              cursor-pointer
            "
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- small helpers ---- */

function Input({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="
        w-full rounded-md px-3 py-2 text-sm
        border border-neutral-300
        bg-white text-neutral-900
        focus:outline-none focus:ring-2 focus:ring-[#1F3D34]/30
        dark:border-neutral-700
        dark:bg-neutral-900 dark:text-neutral-100
      "
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="
        w-full rounded-md px-3 py-2 text-sm
        border border-neutral-300
        bg-white text-neutral-900
        focus:outline-none focus:ring-2 focus:ring-[#5A9684]/40
        dark:border-neutral-700
        dark:bg-neutral-900 dark:text-neutral-100
      "
    >
      {children}
    </select>
  );
}
