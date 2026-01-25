import { useEffect, useState } from "react";
import {
  addPerson,
  getFamilyPersons,
  setFather,
  setMother,
  addSpouse
} from "../../api/person.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

/* ---------- Helpers ---------- */
const isOlder = (olderDob, youngerDob) => {
  if (!olderDob || !youngerDob) return true;
  return new Date(olderDob) < new Date(youngerDob);
};

const isReasonableSpouseAge = (a, b) => {
  if (!a || !b) return true;
  return Math.abs(
    new Date(a).getFullYear() - new Date(b).getFullYear()
  ) <= 40;
};

const isDirectRelative = (a, b) => {
  if (!a || !b) return false;
  return (
    a._id === b.fatherId ||
    a._id === b.motherId ||
    b._id === a.fatherId ||
    b._id === a.motherId
  );
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
  const [spouseId, setSpouseId] = useState("");

  const [isDeceased, setIsDeceased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPersons = async () => {
    const res = await getFamilyPersons();
    setPersons(res.data);
  };

useEffect(() => {
  fetchPersons();
}, []);


  const handleSubmit = async e => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!gender) {
      toast.error("Gender is required");
      return;
    }
    if (!birthDate) {
      toast.error("Birth date is required");
      return;
    }

    const birth = new Date(birthDate);

    /* ---------- PARENT VALIDATION ---------- */
    if (fatherId) {
      const father = persons.find(p => p._id === fatherId);
      if (!father) return toast.error("Invalid father selected");
      if (father.gender !== "male")
        return toast.error("Father must be male");
      if (father.isDeceased)
        return toast.error("Deceased person cannot be a parent");
      if (!isOlder(father.birthDate, birth))
        return toast.error("Father must be older than the child");
    }

    if (motherId) {
      const mother = persons.find(p => p._id === motherId);
      if (!mother) return toast.error("Invalid mother selected");
      if (mother.gender !== "female")
        return toast.error("Mother must be female");
      if (mother.isDeceased)
        return toast.error("Deceased person cannot be a parent");
      if (!isOlder(mother.birthDate, birth))
        return toast.error("Mother must be older than the child");
    }

    /* ---------- CHILD VALIDATION ---------- */
    if (childId) {
      const child = persons.find(p => p._id === childId);
      if (!child) return toast.error("Invalid child selected");
      if (!isOlder(birth, child.birthDate))
        return toast.error("Parent must be older than the child");
      if (isDeceased)
        return toast.error("Deceased person cannot be a parent");
    }

    /* ---------- SPOUSE VALIDATION ---------- */
    if (spouseId) {
      const spouse = persons.find(p => p._id === spouseId);
      if (!spouse) return toast.error("Invalid spouse selected");
      if (spouse.isDeceased)
        return toast.error("Cannot marry a deceased person");
      if (!isReasonableSpouseAge(spouse.birthDate, birthDate))
        return toast.error("Unrealistic age gap between spouses");
      if (isDirectRelative(spouse, { _id: "NEW", fatherId, motherId }))
        return toast.error("Cannot add spouse who is a direct relative");
    }

    const normalizeName = name =>
    name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

    setLoading(true);
    try {
      const res = await addPerson({
        name: normalizeName(name),
        gender,
        birthDate,
        fatherId: fatherId || null,
        motherId: motherId || null,
        isDeceased
      });

      const newId = res.data?._id;

      if (childId && newId) {
        if (gender === "male") {
          await setFather(childId, { fatherId: newId });
          toast.success("Father linked to child");
        }
        if (gender === "female") {
          await setMother(childId, { motherId: newId });
          toast.success("Mother linked to child");
        }
      }

      if (spouseId && newId) {
        await addSpouse(newId, spouseId);
        toast.success("Spouse relationship created");
      }

      toast.success("Family member added successfully");

      setName("");
      setGender("");
      setBirthDate("");
      setFatherId("");
      setMotherId("");
      setChildId("");
      setSpouseId("");
      setIsDeceased(false);

      await onPersonAdded();
      const updated = await getFamilyPersons();
      setPersons(updated.data);

    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to add person"
      );
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

        <select className="control w-full" value={spouseId} onChange={e => setSpouseId(e.target.value)}>
          <option value="">Add spouse (optional)</option>
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
