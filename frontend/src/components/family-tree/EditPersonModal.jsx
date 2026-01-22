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

/* ======================================================
   HELPERS (GENEALOGY SAFETY)
====================================================== */

const isParentOlderThanChild = (parentDob, childDob) => {
  if (!parentDob || !childDob) return true;
  return new Date(parentDob) < new Date(childDob);
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

const areCoParents = (a, b, people) =>
  people.some(
    child =>
      (child.fatherId === a._id && child.motherId === b._id) ||
      (child.fatherId === b._id && child.motherId === a._id)
  );

const hasAnyConnection = (person, people) =>
  !!person.fatherId ||
  !!person.motherId ||
  (person.spouseIds?.length ?? 0) > 0 ||
  people.some(
    p =>
      p.fatherId === person._id ||
      p.motherId === person._id
  );

/* ======================================================
   COMPONENT
====================================================== */

export default function EditPersonModal({ person, onClose, onSaved }) {
  const [name, setName] = useState(person.name);
  const [gender, setGender] = useState(person.gender || "");
  const [isDeceased, setIsDeceased] = useState(person.isDeceased || false);
  const [birthDate, setBirthDate] = useState(
    person.birthDate ? person.birthDate.slice(0, 10) : ""
  );

  const [fatherId, setFatherId] = useState(person.fatherId || "");
  const [motherId, setMotherId] = useState(person.motherId || "");

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spouseIdToAdd, setSpouseIdToAdd] = useState("");
  const [spouseLoading, setSpouseLoading] = useState(false);

  const currentSpouses = persons.filter(p =>
    (person.spouseIds || []).includes(p._id)
  );

  const eligibleSpouses = persons.filter(
    p =>
      p._id !== person._id &&
      !p.isDeceased &&
      !(person.spouseIds || []).includes(p._id)
  );

  useEffect(() => {
    getFamilyPersons().then(res => setPersons(res.data));
  }, []);

  /* ======================================================
     SPOUSE REMOVE (GUARDED)
  ====================================================== */
  const handleRemoveSpouse = async spouseId => {
    const spouse = persons.find(p => p._id === spouseId);
    if (!spouse) return;

    if (areCoParents(person, spouse, persons)) {
      toast.error(
        "Cannot remove spouse. Both are parents of a child in this family."
      );
      return;
    }

    if (!hasAnyConnection(spouse, persons)) {
      toast.error(
        "This action would remove the person from the family tree."
      );
      return;
    }

    if (!window.confirm(
      `Are you sure you want to remove ${spouse.name} as spouse?`
    )) {
      return;
    }

    setSpouseLoading(true);
    try {
      await removeSpouse(person._id, spouseId);
      toast.success("Spouse relationship removed");
      await onSaved?.();
      const updated = await getFamilyPersons();
      setPersons(updated.data);
    } catch {
      toast.error("Failed to remove spouse");
    } finally {
      setSpouseLoading(false);
    }
  };

  /* ======================================================
     SPOUSE ADD
  ====================================================== */
  const handleAddSpouse = async () => {
    const spouse = persons.find(p => p._id === spouseIdToAdd);
    if (!spouse) return toast.error("Invalid spouse");

    if (isDirectRelative(person, spouse))
      return toast.error("Cannot add direct relative as spouse");

    if (!isReasonableSpouseAge(person.birthDate, spouse.birthDate))
      return toast.error("Unrealistic age gap between spouses");

    setSpouseLoading(true);
    try {
      await addSpouse(person._id, spouseIdToAdd);
      toast.success("Spouse added");
      setSpouseIdToAdd("");
      await onSaved?.();
    } catch {
      toast.error("Failed to add spouse");
    } finally {
      setSpouseLoading(false);
    }
  };

  /* ======================================================
    ADD AS PARENT OF (NEW)
  ====================================================== */

  const [childIdToLink, setChildIdToLink] = useState("");

  const eligibleChildren = persons.filter(p => {
    if (p._id === person._id) return false;

    // Male can be added as father if child has no father
    if (person.gender === "male") {
      return !p.fatherId;
    }

    // Female can be added as mother if child has no mother
    if (person.gender === "female") {
      return !p.motherId;
    }

    return false;
  });

  const handleAddAsParentOf = async () => {
    const child = persons.find(p => p._id === childIdToLink);
    if (!child) return toast.error("Invalid child selection");

    if (person._id === child._id)
      return toast.error("A person cannot be their own parent");

    if (!isParentOlderThanChild(person.birthDate, child.birthDate))
      return toast.error("Parent must be older than child");

    try {
      if (person.gender === "male") {
        if (child.fatherId)
          return toast.error("Child already has a father");
        await setFather(child._id, person._id);
      } else if (person.gender === "female") {
        if (child.motherId)
          return toast.error("Child already has a mother");
        await setMother(child._id, person._id);
      } else {
        return toast.error("Parent gender must be male or female");
      }

      toast.success(`${person.name} linked as parent`);
      setChildIdToLink("");
      await onSaved?.();
    } catch {
      toast.error("Failed to link parent");
    }
  };


  /* ======================================================
     SAVE (WITH CONFIRMATION)
  ====================================================== */
  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to apply these changes?")) {
      return;
    }

    if (!name.trim()) return toast.error("Name is required");
    if (!gender) return toast.error("Gender is required");

    const birth = birthDate ? new Date(birthDate) : null;

    if (fatherId) {
      const father = persons.find(p => p._id === fatherId);
      if (!father) return toast.error("Invalid father");
      if (father.gender !== "male") return toast.error("Father must be male");
      if (!isParentOlderThanChild(father.birthDate, birth))
        return toast.error("Father must be older");
    }

    if (motherId) {
      const mother = persons.find(p => p._id === motherId);
      if (!mother) return toast.error("Invalid mother");
      if (mother.gender !== "female") return toast.error("Mother must be female");
      if (!isParentOlderThanChild(mother.birthDate, birth))
        return toast.error("Mother must be older");
    }

    setLoading(true);
    try {
      await editPerson(person._id, {
        name: name
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, c => c.toUpperCase()),
        gender,
        birthDate: birthDate || null,
        isDeceased
      });

      if (fatherId !== (person.fatherId || "")) {
        await setFather(person._id, fatherId || null);
      }

      if (motherId !== (person.motherId || "")) {
        await setMother(person._id, motherId || null);
      }

      toast.success("Person updated successfully");
      await onSaved?.();
      onClose();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card-bg edit-modal rounded-xl p-6 space-y-4 shadow-xl w-full max-w-xl">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-lg">Edit Person</h3>
          <button onClick={onClose} className="opacity-70">✕</button>
        </div>

        <input value={name} onChange={e => setName(e.target.value)} className="control w-full" />
        <select value={gender} onChange={e => setGender(e.target.value)} className="control w-full">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="control w-full" />

        <select value={fatherId} onChange={e => setFatherId(e.target.value)} className="control w-full">
          <option value="">Select father</option>
          {persons.filter(p => p.gender === "male").map(p =>
            <option key={p._id} value={p._id}>{p.name}</option>
          )}
        </select>

        <select value={motherId} onChange={e => setMotherId(e.target.value)} className="control w-full">
          <option value="">Select mother</option>
          {persons.filter(p => p.gender === "female").map(p =>
            <option key={p._id} value={p._id}>{p.name}</option>
          )}
        </select>

        {/* ➕ ADD AS PARENT OF */}
        <div>
          <label className="section-label">Add as parent of</label>
          <div className="flex gap-2 mt-1">
            <select
              value={childIdToLink}
              onChange={e => setChildIdToLink(e.target.value)}
              className="control w-full"
            >
              <option value="">Select child</option>
              {eligibleChildren.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <button
              onClick={handleAddAsParentOf}
              disabled={!childIdToLink}
              className="px-3 py-1 rounded"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
            >
              Link
            </button>
          </div>
        </div>

        <div>
          <label className="section-label">Spouse(s)</label>

          {/* Existing spouses */}
          {currentSpouses.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No spouse added</p>
          )}

          {currentSpouses.map(s => (
            <div
              key={s._id}
              className="flex justify-between items-center"
            >
              <span>{s.name}</span>
              <button
                onClick={() => handleRemoveSpouse(s._id)}
                className="card-link delete"
              >
                Remove
              </button>
            </div>
          ))}

          {/* ➕ ADD SPOUSE */}
          <div className="flex gap-2 mt-2">
            <select
              value={spouseIdToAdd}
              onChange={e => setSpouseIdToAdd(e.target.value)}
              className="control w-full"
              disabled={spouseLoading}
            >
              <option value="">Add spouse</option>
              {eligibleSpouses.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddSpouse}
              disabled={!spouseIdToAdd || spouseLoading}
              className="px-3 py-1 rounded"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--bg)"
              }}
            >
              Add
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isDeceased}
            onChange={e => setIsDeceased(e.target.checked)}
          />
          Mark as deceased
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="opacity-70">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded" style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
