import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import { getFamilyTree } from "../api/person.api";
import { transformToD3Tree } from "../utils/treeTransform";
import AddPerson from "../pages/FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";

/* ---------- Custom Node Renderer ---------- */
const renderCustomNode = (onSelect) => ({ nodeDatum }) => {
  if (!nodeDatum || nodeDatum.name === "__root__") return null;

   const isDeceased = nodeDatum.raw?.isDeceased;

  return (
    <g
      onClick={() => {
        // console.log("Clicked ID:", nodeDatum.id);
        onSelect(nodeDatum.raw);
      }}
      style={{ cursor: "pointer" }}
    >
       <rect
          width="170"
          height="44"
          x="-85"
          y="-22"
          rx="12"
          fill={isDeceased ? "#5f7f74" : "#184c3e"}
          stroke={isDeceased ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)"}
          strokeWidth="1"
        />
        <text
          x="0"
          y="1"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="13"
          fill={isDeceased ? "#e5e7eb" : "#ffffff"}
          style={{
            fontFamily:
              "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 400,          // consistent everywhere
            letterSpacing: "0.25px",
            paintOrder: "stroke",
            stroke: "transparent",
            strokeWidth: 0,
            dominantBaseline: "middle",
            pointerEvents: "none",
          }}
        >
          {nodeDatum.name}
        </text>
    </g>
  );
};


/* ---------- Family Tree Page ---------- */
export default function FamilyTree() {
  const [treeData, setTreeData] = useState(null);
  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // This state MUST live inside the component (Rules of Hooks).
  // This enables node click → modal workflows.
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personMap, setPersonMap] = useState({});

  /* ✅ SINGLE SOURCE OF TRUTH */
  const fetchTree = async () => {
    const res = await getFamilyTree();
    console.log("RAW TREE FROM BACKEND:", res.data);

    // Build person map for easy lookup
    const map = {};
    res.data.forEach(person => {
      map[person._id] = person;
    });

    setPersonMap(map);

    setTreeData({
      name: "__root__",
      children: res.data.map(transformToD3Tree),
    });
  };


  /* initial load */
  useEffect(() => {
    fetchTree();
  }, []);

  /* center tree */
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setTranslate({
      x: rect.width / 2,
      y: 20,
    });
  }, [treeData]);

  if (!treeData) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-medium">Family Tree</h1>
        <p className="text-sm text-neutral-500">
          Family lineage and relationships
        </p>
      </div>

      {/* Honor-only panel (handled internally in AddPerson) */}
      <div className="mb-8">
        <AddPerson onPersonAdded={fetchTree} />
      </div>

      <div
        ref={containerRef}
        className="relative h-[75vh] w-full overflow-hidden
                   bg-[rgba(150,170,155,0.18)]"
      >
        <div className="absolute inset-0 bg-[rgba(150,170,155,0.22)] pointer-events-none" />

        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          separation={{ siblings: 2.2, nonSiblings: 3 }}
          renderCustomNodeElement={renderCustomNode(setSelectedPerson)}

          pathFunc="step"
          draggable

          // zoomable={false} disables drag internally in react-d3-tree.
          // Recommendation:
          // zoomable={true}
          // zoom={1}
          // scaleExtent={{ min: 1, max: 1 }}
          // This keeps drag ON but prevents zooming.
          zoomable={false}

          collapsible={false}
          pathClassFunc={({ source }) =>
            source.data.name === "__root__" ? "hidden-link" : "tree-link"
          }
          styles={{
            links: {
              stroke: "#9ca3af",
              strokeWidth: 1,
            },
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
