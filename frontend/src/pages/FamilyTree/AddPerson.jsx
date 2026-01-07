import { useEffect, useState } from "react";
import { addPerson, getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function AddPerson({ onPersonAdded }) {
  const { user } = useAuth();

  // Honor only
  if (!user?.isHonor) return null;

  const [persons, setPersons] = useState([]);

  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // REQUIRED
  const [birthDate, setBirthDate] = useState(""); // OPTIONAL
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");

  // NEW
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

    if (!gender) {
      setError("Please select gender");
      return;
    }

    setLoading(true);

    try {
      await addPerson({
        name,
        gender: gender.toLowerCase(), // 🔑 frontend → backend conversion
        birthDate: birthDate || undefined,
        isDeceased,
        fatherId: fatherId || null,
        motherId: motherId || null
      });

      toast.success("Family member added", {
        description: `${name} has been added to the family tree`
      });

      // Reset form
      setName("");
      setGender("");
      setBirthDate("");
      setFatherId("");
      setMotherId("");
      setIsDeceased(false);

      // Refresh tree
      await onPersonAdded();

      // Refresh dropdowns
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

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Name */}
        <input
          placeholder="Full name"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={gender === "Male"}
                onChange={() => setGender("Male")}
                required
              />
              Male
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={gender === "Female"}
                onChange={() => setGender("Female")}
                required
              />
              Female
            </label>
          </div>
        </div>

        {/* Birth Date (REQUIRED now) */}
        <input
          type="date"
          className="w-full border px-3 py-2 rounded"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />

        {/* Father */}
        <select
          className="w-full border px-3 py-2 rounded"
          value={fatherId}
          onChange={(e) => setFatherId(e.target.value)}
          disabled={isDeceased}
        >
          <option value="">Select father (optional)</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Mother */}
        <select
          className="w-full border px-3 py-2 rounded"
          value={motherId}
          onChange={(e) => setMotherId(e.target.value)}
          disabled={isDeceased}
        >
          <option value="">Select mother (optional)</option>
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
            onChange={(e) => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        {/* Submit */}
        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Person"}
        </button>
      </form>
    </div>
  );
}
