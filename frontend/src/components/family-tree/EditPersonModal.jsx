import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 300 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

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

    if (person.gender === "male") {
      return !p.fatherId;
    }

    if (person.gender === "female") {
      return !p.motherId;
    }

    return false;
  });

  const handleAddAsParentOf = async () => {
    const child = persons.find(p => p._id === childIdToLink);
    if (
      (person.gender === "male" && child.motherId && child.fatherId) ||
      (person.gender === "female" && child.motherId && child.fatherId)
    ) {
      toast.error("Child already has two parents");
      return;
    }
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

      // --------------------
      // Father handling
      // --------------------
      if (!fatherId && person.fatherId) {
        toast.error("Removing a parent is not supported yet");
        return;
      }

      if (fatherId && fatherId !== person.fatherId) {
        await setFather(person._id, fatherId);
      }

      // --------------------
      // Mother handling
      // --------------------
      if (!motherId && person.motherId) {
        toast.error("Removing a parent is not supported yet");
        return;
      }

      if (motherId && motherId !== person.motherId) {
        await setMother(person._id, motherId);
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
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Gradient border effect - hidden on mobile */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_50%,transparent)] rounded-2xl sm:rounded-3xl blur-xl opacity-25 hidden sm:block"></div>
          
          <div className="relative rounded-2xl sm:rounded-3xl border-2 border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_15%,transparent)] to-[color-mix(in_srgb,var(--accent)_5%,transparent)] border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] flex items-center justify-center text-white text-base sm:text-lg shadow-lg">
                    ✏️
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text)]">Edit Person</h3>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--text)] min-h-[44px] sm:min-h-0"
                  aria-label="Close modal"
                >
                  <span className="text-lg sm:text-xl">✕</span>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 space-y-5 sm:space-y-6">
              {/* Basic Info */}
              <FormSection title="Basic Information" icon="📋">
                <FormField label="Name" required>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="control w-full text-sm sm:text-base"
                    placeholder="Enter full name"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField label="Gender" required>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)} 
                      className="control w-full text-sm sm:text-base"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Date of Birth">
                    <input 
                      type="date" 
                      value={birthDate} 
                      onChange={e => setBirthDate(e.target.value)} 
                      className="control w-full text-sm sm:text-base"
                    />
                  </FormField>
                </div>

                <label className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] cursor-pointer hover:border-[var(--accent)] transition-all min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={e => setIsDeceased(e.target.checked)}
                    className="w-5 h-5 rounded accent-[var(--accent)]"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[var(--text)]">Mark as deceased</span>
                </label>
              </FormSection>

              {/* Parents */}
              <FormSection title="Parents">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField label="Father">
                    <select 
                      value={fatherId} 
                      onChange={e => setFatherId(e.target.value)} 
                      className="control w-full text-sm sm:text-base"
                    >
                      <option value="">Select father</option>
                      {persons.filter(p => p.gender === "male").map(p =>
                        <option key={p._id} value={p._id}>{p.name}</option>
                      )}
                    </select>
                    <p className="text-xs text-[var(--muted)] mt-1.5 sm:mt-2">
                      Note: Removing a parent is not supported yet.
                    </p>
                  </FormField>

                  <FormField label="Mother">
                    <select 
                      value={motherId} 
                      onChange={e => setMotherId(e.target.value)} 
                      className="control w-full text-sm sm:text-base"
                    >
                      <option value="">Select mother</option>
                      {persons.filter(p => p.gender === "female").map(p =>
                        <option key={p._id} value={p._id}>{p.name}</option>
                      )}
                    </select>
                    <p className="text-xs text-[var(--muted)] mt-1.5 sm:mt-2">
                      Note: Removing a parent is not supported yet.
                    </p>
                  </FormField>
                </div>
              </FormSection>

              {/* Add as Parent Of */}
              <FormSection title="Link as Parent">
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm text-[var(--muted)]">
                    Add this person as a parent of an existing child
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={childIdToLink}
                      onChange={e => setChildIdToLink(e.target.value)}
                      className="control flex-1 text-sm sm:text-base"
                      disabled={eligibleChildren.length === 0}
                    >
                      <option value="">
                        {eligibleChildren.length === 0 ? 'No eligible children' : 'Select child'}
                      </option>
                      {eligibleChildren.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleAddAsParentOf}
                      disabled={!childIdToLink}
                      className="px-5 py-2.5 sm:py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity w-full sm:w-auto min-h-[44px] sm:min-h-0 whitespace-nowrap"
                      style={{ 
                        backgroundColor: childIdToLink ? "var(--accent)" : "var(--border)", 
                        color: childIdToLink ? "white" : "var(--muted)" 
                      }}
                    >
                      Link
                    </button>
                  </div>
                </div>
              </FormSection>

              {/* Spouses */}
              <FormSection title="Spouse(s)">
                <div className="space-y-2 sm:space-y-3">
                  {/* Current spouses */}
                  {currentSpouses.length > 0 && (
                    <div className="space-y-2">
                      {currentSpouses.map(s => (
                        <div
                          key={s._id}
                          className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] gap-2"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[color-mix(in_srgb,var(--accent)_30%,transparent)] to-[color-mix(in_srgb,var(--accent)_10%,transparent)] flex items-center justify-center text-sm font-semibold text-[var(--text)] flex-shrink-0">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-[var(--text)] text-sm sm:text-base truncate">{s.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveSpouse(s._id)}
                            className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex-shrink-0 min-h-[44px] sm:min-h-0 flex items-center px-2"
                            disabled={spouseLoading}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSpouses.length === 0 && (
                    <p className="text-xs sm:text-sm text-[var(--muted)] italic p-3 text-center bg-[color-mix(in_srgb,var(--panel)_30%,transparent)] rounded-lg sm:rounded-xl border border-dashed border-[var(--border)]">
                      No spouse added
                    </p>
                  )}

                  {/* Add spouse */}
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm text-[var(--muted)]">Add a new spouse</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={spouseIdToAdd}
                        onChange={e => setSpouseIdToAdd(e.target.value)}
                        className="control flex-1 text-sm sm:text-base"
                        disabled={spouseLoading || eligibleSpouses.length === 0}
                      >
                        <option value="">
                          {eligibleSpouses.length === 0 ? 'No eligible spouses' : 'Select spouse'}
                        </option>
                        {eligibleSpouses.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleAddSpouse}
                        disabled={!spouseIdToAdd || spouseLoading}
                        className="px-5 py-2.5 sm:py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity w-full sm:w-auto min-h-[44px] sm:min-h-0 whitespace-nowrap"
                        style={{
                          backgroundColor: spouseIdToAdd ? "var(--accent)" : "var(--border)",
                          color: spouseIdToAdd ? "white" : "var(--muted)"
                        }}
                      >
                        {spouseLoading ? "..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Actions Footer */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-[color-mix(in_srgb,var(--panel)_30%,transparent)] border-t border-[var(--border)] flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={onClose} 
                className="flex-1 px-6 py-3 rounded-full font-semibold text-sm sm:text-base border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] transition-all min-h-[44px] order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading} 
                className="flex-1 px-6 py-3 rounded-full font-semibold text-sm sm:text-base bg-[var(--accent)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[44px] order-1 sm:order-2"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* Helper Components */

function FormSection({ title, icon, children }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h4 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[var(--text)]">
        <span className="text-lg sm:text-xl">{icon}</span>
        <span>{title}</span>
      </h4>
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="block text-xs sm:text-sm font-semibold text-[var(--text)]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}