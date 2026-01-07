// frontend/src/pages/FamilyTree/AddPerson.jsx
import { useEffect, useState } from "react";
import {
  addPerson,
  getFamilyPersons,
  setFather,
  setMother
} from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

/* ---------- Helpers ---------- */
const isOlder = (parentDob, childDob) => {
  if (!parentDob || !childDob) return false;
  return new Date(parentDob) < new Date(childDob);
};

export default function AddPerson({ inviteCode, onPersonAdded }) {
  const { user } = useAuth();
  if (!user?.isHonor) return null;

  const [persons, setPersons] = useState([]);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [childId, setChildId] = useState("");

  const [isDeceased, setIsDeceased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!gender) return setError("Gender is required");
    if (!birthDate) return setError("Birth date is required");

    const birth = new Date(birthDate);

    /* ---------- Father validation ---------- */
    if (fatherId) {
      const father = persons.find(p => p._id === fatherId);
      if (!father) return setError("Invalid father selected");
      if (father.gender !== "male")
        return setError("Father must be male");
      if (!father.birthDate || !isOlder(father.birthDate, birth))
        return setError("Father must be older than the child");
      if (father.isDeceased)
        return setError("Deceased person cannot be a parent");
    }

    /* ---------- Mother validation ---------- */
    if (motherId) {
      const mother = persons.find(p => p._id === motherId);
      if (!mother) return setError("Invalid mother selected");
      if (mother.gender !== "female")
        return setError("Mother must be female");
      if (!mother.birthDate || !isOlder(mother.birthDate, birth))
        return setError("Mother must be older than the child");
      if (mother.isDeceased)
        return setError("Deceased person cannot be a parent");
    }

    /* ---------- Add as parent of ---------- */
    if (childId) {
      const child = persons.find(p => p._id === childId);
      if (!child) return setError("Invalid child selected");
      if (!child.birthDate || !isOlder(birth, child.birthDate))
        return setError("Parent must be older than the selected child");
      if (isDeceased)
        return setError("Deceased person cannot be a parent");
    }

    setLoading(true);
    try {
      const res = await addPerson({
        name,
        gender,
        birthDate,
        fatherId: fatherId || null,
        motherId: motherId || null,
        isDeceased
      });

      const newPersonId = res.data?._id;

      /* ---------- Attach as parent ---------- */
      if (childId && newPersonId) {
        if (gender === "male") {
          await setFather(childId, { fatherId: newPersonId });
        }
        if (gender === "female") {
          await setMother(childId, { motherId: newPersonId });
        }
      }

      toast.success("Family member added");

      setName("");
      setGender("");
      setBirthDate("");
      setFatherId("");
      setMotherId("");
      setChildId("");
      setIsDeceased(false);

      await onPersonAdded();
      const updated = await getFamilyPersons();
      setPersons(updated.data);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to add person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">

      {inviteCode && (
        <div
          className="flex items-center justify-between rounded-md px-4 py-2 text-sm"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
        >
          <span>Invite code: <b>{inviteCode}</b></span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(inviteCode);
              setCopied(true);
              toast.success("Invite code copied");
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 text-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold">Add Family Member</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="control w-full" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className="control w-full" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
        <select className="control w-full" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select className="control w-full" value={fatherId} onChange={e => setFatherId(e.target.value)}>
          <option value="">Select father (optional)</option>
          {persons.filter(p => p.gender === "male" && !p.isDeceased).map(p =>
            <option key={p._id} value={p._id}>{p.name}</option>
          )}
        </select>

        <select className="control w-full" value={motherId} onChange={e => setMotherId(e.target.value)}>
          <option value="">Select mother (optional)</option>
          {persons.filter(p => p.gender === "female" && !p.isDeceased).map(p =>
            <option key={p._id} value={p._id}>{p.name}</option>
          )}
        </select>

        <select className="control w-full" value={childId} onChange={e => setChildId(e.target.value)}>
          <option value="">Add as parent of (optional)</option>
          {persons.filter(p => !p.isDeceased).map(p =>
            <option key={p._id} value={p._id}>{p.name}</option>
          )}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isDeceased} onChange={e => setIsDeceased(e.target.checked)} />
          Mark as deceased
        </label>

        <button disabled={loading} className="w-full py-2 rounded text-sm font-medium"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>
          {loading ? "Adding..." : "Add Person"}
        </button>
      </form>
    </div>
  );
}
