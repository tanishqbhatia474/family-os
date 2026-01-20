import { useEffect, useState } from "react";
import { getFamilyTree } from "../api/person.api";
import { getFamilyDetails } from "../api/family.api";
import AddPerson from "./FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";
import TreeNode from "../components/family-tree/TreeNode";

/* ======================================================
   BLOODLINE LOGIC (ANCESTRY MODEL)
====================================================== */

function buildBloodlineSet(people) {
  const bloodline = new Set();

  // 1. Anyone with parents is bloodline
  people.forEach(p => {
    if (p.fatherId || p.motherId) {
      bloodline.add(p._id);
      if (p.fatherId) bloodline.add(p.fatherId);
      if (p.motherId) bloodline.add(p.motherId);
    }
  });

  // 2. Anyone who is a parent is bloodline
  people.forEach(p => {
    const isParent = people.some(
      c => c.fatherId === p._id || c.motherId === p._id
    );
    if (isParent) bloodline.add(p._id);
  });

  // 3. BOOTSTRAP RULE (no ancestry yet → married couple)
  if (bloodline.size === 0) {
    const married = people.find(p => (p.spouseIds || []).length > 0);
    if (married) {
      bloodline.add(married._id);
      married.spouseIds.forEach(id => bloodline.add(id));
    }
  }

  return bloodline;
}

function findRoots(people, bloodline) {
  return people.filter(
    p =>
      bloodline.has(p._id) &&
      !p.fatherId &&
      !p.motherId
  );
}

if (roots.length === 0 && honorPerson) {
  roots = [honorPerson];
}


export default function FamilyTree() {
  const [people, setPeople] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [honorUserId, setHonorUserId] = useState(null);

  const fetchTree = async () => {
    const res = await getFamilyTree();
    setPeople(res.data);
  };

  const fetchFamilyDetails = async () => {
    try {
      const res = await getFamilyDetails();
      setInviteCode(res.data.inviteCode);
      setHonorUserId(res.data.honorUserId);
    } catch {}
  };

  useEffect(() => {
    fetchTree();
    fetchFamilyDetails();
  }, []);

  if (!people.length) return null;

  const honorPerson = honorUserId
    ? people.find(p => p.userId === honorUserId)
    : null;

  const bloodline = buildBloodlineSet(people);
  let roots = findRoots(people, bloodline);

  // ✅ CRITICAL FALLBACK
  if (roots.length === 0 && honorPerson) {
    roots = [honorPerson];
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* header */}

      <div className="mb-8">
        <AddPerson inviteCode={inviteCode} onPersonAdded={fetchTree} />
      </div>

      <div
        className="rounded-xl p-6 space-y-10"
        style={{
          backgroundColor: "var(--panel)",
          boxShadow: "inset 0 0 0 1px var(--border)"
        }}
      >
        {roots.map(root => (
          <TreeNode
            key={root._id}
            person={root}
            people={people}
            bloodline={bloodline}
            onSelect={setSelectedPerson}
          />
        ))}
      </div>

      {selectedPerson && (
        <PersonProfileModal
          person={selectedPerson}
          personMap={Object.fromEntries(
            people.map(p => [p._id, p])
          )}
          onClose={() => setSelectedPerson(null)}
          onSaved={fetchTree}
        />
      )}
    </div>
  );
}
