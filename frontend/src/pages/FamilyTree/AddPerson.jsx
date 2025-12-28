import { useEffect, useState } from "react";
import { addPerson, getFamilyPersons } from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";

export default function AddPerson({ onPersonAdded }) {
  const { user } = useAuth();

  // Honor only
  if (!user?.isHonor) return null;

  const [persons, setPersons] = useState([]);
  const [name, setName] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
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
    setLoading(true);

    try {
      await addPerson({
        name,
        fatherId: fatherId || null,
        motherId: motherId || null
      });

      // reset form
      setName("");
      setFatherId("");
      setMotherId("");

      // refresh parent tree
      await onPersonAdded();

      // refresh local parent list
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
        <input
          placeholder="Full name"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={fatherId}
          onChange={(e) => setFatherId(e.target.value)}
        >
          <option value="">Select father (optional)</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border px-3 py-2 rounded"
          value={motherId}
          onChange={(e) => setMotherId(e.target.value)}
        >
          <option value="">Select mother (optional)</option>
          {persons.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Adding..." : "Add Person"}
        </button>
      </form>
    </div>
  );
}
