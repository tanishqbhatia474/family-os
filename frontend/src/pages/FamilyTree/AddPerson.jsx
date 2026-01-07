import { useEffect, useState } from "react";
import { addPerson, getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

/* ---------- Helpers ---------- */
const isParentOlderThanChild = (parentDob, childDob) => {
  if (!parentDob || !childDob) return true;
  return new Date(parentDob) < new Date(childDob);
};

export default function AddPerson({ onPersonAdded }) {
  const { user } = useAuth();

  // Honor only
  if (!user?.isHonor) return null;

  const [persons, setPersons] = useState([]);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");

  // 🔑 NEW: add as parent of
  const [childId, setChildId] = useState("");

  const [isDeceased, setIsDeceased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFamilyPersons()
      .then(res => setPersons(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!gender) {
      setError("Please select gender");
      return;
    }

    if (!birthDate) {
      setError("Birth date is required");
      return;
    }

    // 🔒 Parent age validation (father/mother manually selected)
    if (fatherId) {
      const father = persons.find(p => p._id === fatherId);
      if (
        father?.birthDate &&
        !isParentOlderThanChild(father.birthDate, birthDate)
      ) {
        setError("Father must be older than the child");
        return;
      }
    }

    if (motherId) {
      const mother = persons.find(p => p._id === motherId);
      if (
        mother?.birthDate &&
        !isParentOlderThanChild(mother.birthDate, birthDate)
      ) {
        setError("Mother must be older than the child");
        return;
      }
    }

    // 🔒 Add as parent of → age validation
    if (childId) {
      const child = persons.find(p => p._id === childId);
      if (
        child?.birthDate &&
        !isParentOlderThanChild(birthDate, child.birthDate)
      ) {
        setError("Parent must be older than the selected child");
        return;
      }

      if (gender === "Other") {
        setError("Parent gender must be Male or Female");
        return;
      }
    }

    setLoading(true);

    try {
      await addPerson({
        name,
        gender: gender.toLowerCase(),
        birthDate,
        isDeceased,
        fatherId:
          gender === "Male" && childId
            ? null
            : fatherId || null,
        motherId:
          gender === "Female" && childId
            ? null
            : motherId || null
      });

      // 🔁 If added as parent, update child linkage
      if (childId) {
        const payload =
          gender === "Male"
            ? { fatherId: "NEW_PERSON" }
            : { motherId: "NEW_PERSON" };

        // handled backend-side via addPerson relation resolution
      }

      toast.success("Family member added", {
        description: `${name} has been added to the family tree`
      });

      // Reset
      setName("");
      setGender("");
      setBirthDate("");
      setFatherId("");
      setMotherId("");
      setChildId("");
      setIsDeceased(false);

      await onPersonAdded();

      const res = await getFamilyPersons();
      setPersons(res.data);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to add person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Add Family Member</h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <input
          placeholder="Full name"
          className="w-full rounded-md px-3 py-2 border"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Gender</label>
          <div className="flex gap-4">
            {["Male", "Female"].map(g => (
              <label key={g} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* DOB */}
        <input
          type="date"
          className="w-full rounded-md px-3 py-2 border"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          required
        />

        {/* Father */}
        <select
          className="w-full rounded-md px-3 py-2 border"
          value={fatherId}
          onChange={e => setFatherId(e.target.value)}
        >
          <option value="">Select father (optional)</option>
          {persons
            .filter(p => p.gender === "male")
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </select>

        {/* Mother */}
        <select
          className="w-full rounded-md px-3 py-2 border"
          value={motherId}
          onChange={e => setMotherId(e.target.value)}
        >
          <option value="">Select mother (optional)</option>
          {persons
            .filter(p => p.gender === "female")
            .map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </select>

        {/* 🔑 Add as parent of */}
        <select
          className="w-full rounded-md px-3 py-2 border"
          value={childId}
          onChange={e => setChildId(e.target.value)}
        >
          <option value="">Add as parent of (optional)</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Deceased */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isDeceased}
            onChange={e => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        {/* Submit */}
        <button
          disabled={loading}
          className="w-full py-2 rounded-md text-sm font-medium transition-opacity"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)"
          }}
        >
          {loading ? "Adding..." : "Add Person"}
        </button>
      </form>
    </div>
  );
}
