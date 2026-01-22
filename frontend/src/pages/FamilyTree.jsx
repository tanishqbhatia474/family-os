import { useEffect, useState, useMemo } from "react";
import { getFamilyPersons } from "../api/person.api";
import { getFamilyDetails } from "../api/family.api";

import AddPerson from "../pages/FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";
import SvgFamilyTree from "../components/family-tree/SvgFamilyTree";

import { buildFamilyTree } from "../components/family-tree/treeBuilder";

export default function FamilyTree() {
  const [people, setPeople] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);

  /* ---------------- Fetch ---------------- */

  async function fetchAll() {
    try {
      const [peopleRes, familyRes] = await Promise.all([
        getFamilyPersons(),
        getFamilyDetails()
      ]);

      setPeople(Array.isArray(peopleRes.data) ? peopleRes.data : []);
      setInviteCode(familyRes.data?.inviteCode ?? null);
    } catch (err) {
      console.error("Failed to fetch family data", err);
      setPeople([]);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  /* ---------------- Build recursive tree ---------------- */

  const rootFamily = useMemo(
    () => buildFamilyTree(people),
    [people]
  );

  /* ---------------- Render ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Add Person */}
      <AddPerson
        inviteCode={inviteCode}
        onPersonAdded={fetchAll}
      />

      {/* SVG Family Tree */}
      <div className="tree-canvas w-full overflow-auto p-4">
        <SvgFamilyTree
          rootFamily={rootFamily}
          onSelectPerson={setSelectedPerson}
        />
      </div>

      {/* Person Profile */}
      {selectedPerson && (
        <PersonProfileModal
          person={selectedPerson}
          personMap={Object.fromEntries(
            people.map(p => [p._id, p])
          )}
          people={people}
          onClose={() => setSelectedPerson(null)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
