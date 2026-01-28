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

const isCloseBloodRelative = (personA, personB, persons) => {
  if (!personA || !personB) return false;

  const byId = Object.fromEntries(persons.map(p => [p._id, p]));

  const parentsOf = p =>
    [p.fatherId, p.motherId].map(id => byId[id]).filter(Boolean);

  const childrenOf = p =>
    persons.filter(
      x => x.fatherId === p._id || x.motherId === p._id
    );

  /* ---------- direct ---------- */
  if (
    personA._id === personB.fatherId ||
    personA._id === personB.motherId ||
    personB._id === personA.fatherId ||
    personB._id === personA.motherId
  ) {
    return true;
  }

  /* ---------- siblings ---------- */
  const parentsA = parentsOf(personA);
  const parentsB = parentsOf(personB);

  if (
    parentsA.some(pa =>
      parentsB.some(pb => pa._id === pb._id)
    )
  ) {
    return true;
  }

  /* ---------- grandparent / grandchild ---------- */
  const grandparentsA = parentsA.flatMap(parentsOf);
  const grandparentsB = parentsB.flatMap(parentsOf);

  if (
    grandparentsA.some(gp => gp._id === personB._id) ||
    grandparentsB.some(gp => gp._id === personA._id)
  ) {
    return true;
  }

  return false;
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

  const [errors, setErrors] = useState({});

  const fetchPersons = async () => {
    const res = await getFamilyPersons();
    setPersons(res.data);
  };

useEffect(() => {
  fetchPersons();
}, []);


  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const birth = new Date(birthDate);

    /* ---------- PARENT VALIDATION ---------- */
    if (fatherId) {
      const father = persons.find(p => p._id === fatherId);
      if (!father) return toast.error("Invalid father selected");
      if (father.gender !== "male")
        return toast.error("Father must be male");
      if (!isOlder(father.birthDate, birth))
        return toast.error("Father must be older than the child");
    }

    if (motherId) {
      const mother = persons.find(p => p._id === motherId);
      if (!mother) return toast.error("Invalid mother selected");
      if (mother.gender !== "female")
        return toast.error("Mother must be female");
      if (!isOlder(mother.birthDate, birth))
        return toast.error("Mother must be older than the child");
    }

    /* ---------- CHILD VALIDATION ---------- */
    if (childId) {
      const child = persons.find(p => p._id === childId);
      if (!child) return toast.error("Invalid child selected");
      if (!isOlder(birth, child.birthDate))
        return toast.error("Parent must be older than the child");
    }

    /* ---------- SPOUSE VALIDATION ---------- */
    if (spouseId) {
      const spouse = persons.find(p => p._id === spouseId);
      if (!spouse) return toast.error("Invalid spouse selected");
      if (!isReasonableSpouseAge(spouse.birthDate, birthDate))
        return toast.error("Unrealistic age gap between spouses");
      if (
        isCloseBloodRelative(
          spouse,
          { _id: "NEW", fatherId, motherId },
          persons
        )
      ) {
        return toast.error(
          "Cannot add spouse who is a close blood relative"
        );
      }
    }

    // if (spouseId && childId) {
    //   const spouse = persons.find(p => p._id === spouseId);
    //   const child = persons.find(p => p._id === childId);

    //   if (spouse && child) {
    //     if (isCloseBloodRelative(spouse, child, persons)) {
    //       return toast.error(
    //         "Spouse cannot be a close blood relative of the selected child"
    //       );
    //     }
    //   }
    // }

    const normalizeName = name =>
      name
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

    setLoading(true);

    try {
      const actions = [];

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
          await setFather(childId, newId);
          actions.push("• Linked as father");
        }
        if (gender === "female") {
          await setMother(childId, newId);
          actions.push("• Linked as mother");
        }
      }

      if (spouseId && newId) {
        await addSpouse(newId, spouseId);
        actions.push("• Spouse relationship added");
      }

      toast.success("Family member added", {
        description: actions.length ? actions.join("\n") : undefined
      });

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
        err?.response?.data?.message ||
        "Unable to add this family member. A similar person may already exist."
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
      {/* Full Name */}
      <div>
        <input
          className="control w-full"
          placeholder="Full name"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setErrors(prev => ({ ...prev, name: "" }));
          }}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <input
          className="control w-full"
          type="date"
          value={birthDate}
          onChange={e => {
            setBirthDate(e.target.value);
            setErrors(prev => ({ ...prev, birthDate: "" }));
          }}
        />
        {errors.birthDate && (
          <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <select
          className="control w-full"
          value={gender}
          onChange={e => {
            setGender(e.target.value);
            setErrors(prev => ({ ...prev, gender: "" }));
          }}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
        )}
      </div>

      {/* Father */}
      <select
        className="control w-full"
        value={fatherId}
        onChange={e => setFatherId(e.target.value)}
      >
        <option value="">Select father (optional)</option>
        {persons
          .filter(p => p.gender === "male" && !p.isDeceased)
          .map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
      </select>

      {/* Mother */}
      <select
        className="control w-full"
        value={motherId}
        onChange={e => setMotherId(e.target.value)}
      >
        <option value="">Select mother (optional)</option>
        {persons
          .filter(p => p.gender === "female" && !p.isDeceased)
          .map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
      </select>

      {/* Child */}
      <select
        className="control w-full"
        value={childId}
        onChange={e => setChildId(e.target.value)}
      >
        <option value="">Add as parent of (optional)</option>
        {persons
          .filter(p => !p.isDeceased)
          .map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
      </select>

      {/* Spouse */}
      <select
        className="control w-full"
        value={spouseId}
        onChange={e => setSpouseId(e.target.value)}
      >
        <option value="">Add spouse (optional)</option>
        {persons
          .filter(p => !p.isDeceased)
          .map(p => (
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
        className="w-full py-2 rounded text-sm font-medium"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
      >
        {loading ? "Adding..." : "Add Person"}
      </button>
    </form>
    </div>
  );
}
