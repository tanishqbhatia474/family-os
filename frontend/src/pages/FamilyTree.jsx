import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import { getFamilyTree } from "../api/person.api";
import { getFamilyDetails } from "../api/family.api";
import { transformToD3Tree } from "../utils/treeTransform";
import AddPerson from "./FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";

/* ======================================================
   GROUP SPOUSES (IMMUTABLE, SAFE)
====================================================== */
function groupSpouses(node, personMap) {
  if (!node || !node.children) return node;

  return {
    ...node,
    children: node.children.map(child => {
      const raw = child.raw;

      if (!raw || child._groupedSpouses) return child;

      const spouses = (raw.spouseIds || [])
        .map(id => personMap[id])
        .filter(
          spouse =>
            spouse &&
            spouse._id !== raw._id
        );

      const updatedChild = {
        ...child,
        spouses,
        _groupedSpouses: true
      };

      return groupSpouses(updatedChild, personMap);
    })
  };
}

/* ======================================================
   CUSTOM NODE RENDERER
====================================================== */
const renderCustomNode =
  (onSelect, personMap) =>
  ({ nodeDatum }) => {
    if (!nodeDatum || nodeDatum.name === "__root__") return null;

    const isDeceased = nodeDatum.raw?.isDeceased;
    const spouses = nodeDatum.spouses || [];

    return (
      <g>
        {/* MAIN PERSON */}
        <g
          onClick={() => onSelect(personMap[nodeDatum.raw._id])}
          style={{ cursor: "pointer" }}
        >
          <rect
            width="170"
            height="44"
            x="-85"
            y="-22"
            rx="12"
            fill={isDeceased ? "#5f7f74" : "#184c3e"}
            stroke="rgba(0,0,0,0.08)"
          />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="13"
            fill="#ffffff"
            style={{ pointerEvents: "none" }}
          >
            {nodeDatum.name}
          </text>
        </g>

        {/* SPOUSES */}
        {spouses.map((spouse, idx) => (
          <g
            key={spouse._id}
            onClick={() => onSelect(personMap[spouse._id])}
            style={{ cursor: "pointer" }}
            transform={`translate(${(idx + 1) * 180}, 0)`}
          >
            <rect
              width="170"
              height="44"
              x="-85"
              y="-22"
              rx="12"
              fill={spouse.isDeceased ? "#5f7f74" : "#184c3e"}
              stroke="rgba(0,0,0,0.08)"
            />
            <text
              x="0"
              y="1"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="13"
              fill="#ffffff"
              style={{ pointerEvents: "none" }}
            >
              {spouse.name}
            </text>
          </g>
        ))}
      </g>
    );
  };

/* ======================================================
   FAMILY TREE PAGE
====================================================== */
export default function FamilyTree() {
  const [treeData, setTreeData] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [personMap, setPersonMap] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);

  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  /* ======================================================
     FETCH TREE (SINGLE SOURCE OF TRUTH)
  ====================================================== */
  const fetchTree = async () => {
    const res = await getFamilyTree();

    const map = {};
    res.data.forEach(p => (map[p._id] = p));
    setPersonMap(map);

    // 🚫 Remove spouses from being top-level anchors
    const spouseIds = new Set();
    res.data.forEach(p => {
      (p.spouseIds || []).forEach(id => spouseIds.add(id));
    });

    const roots = res.data.filter(p => !spouseIds.has(p._id));

    let tree = {
      name: "__root__",
      children: roots.map(transformToD3Tree)
    };

    tree = groupSpouses(tree, map);
    setTreeData(tree);
  };

  const fetchFamilyDetails = async () => {
    try {
      const res = await getFamilyDetails();
      setInviteCode(res.data.inviteCode);
    } catch {
      /* non-critical */
    }
  };

  useEffect(() => {
    fetchTree();
    fetchFamilyDetails();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !treeData) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTranslate({ x: rect.width / 2, y: 40 });
  }, [treeData]);

  if (!treeData) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-medium">Family Tree</h1>
        <p className="text-sm text-[var(--muted)]">
          Family lineage and relationships
        </p>
      </div>

      <div className="mb-8">
        <AddPerson
          inviteCode={inviteCode}
          onPersonAdded={fetchTree}
        />
      </div>

      <div
        ref={containerRef}
        className="relative h-[75vh] w-full overflow-hidden bg-[var(--panel)] border rounded-lg"
      >
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          separation={{ siblings: 2.2, nonSiblings: 3 }}
          renderCustomNodeElement={renderCustomNode(
            setSelectedPerson,
            personMap
          )}
          pathFunc="step"
          draggable
          zoomable={false}
          collapsible={false}
          pathClassFunc={({ source }) =>
            source.data.name === "__root__"
              ? "hidden-link"
              : "tree-link"
          }
          styles={{
            links: {
              stroke: "#9ca3af",
              strokeWidth: 1
            }
          }}
        />

        {selectedPerson && (
          <PersonProfileModal
            person={selectedPerson}
            personMap={personMap}
            onClose={() => setSelectedPerson(null)}
            onSaved={fetchTree}
          />
        )}
      </div>
    </div>
  );
}
