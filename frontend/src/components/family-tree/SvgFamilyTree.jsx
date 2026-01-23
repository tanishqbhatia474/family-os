// import React, { useMemo, useState } from "react";

// /* =======================
//    Geometry
// ======================= */
// const NODE_WIDTH = 160;
// const NODE_HEIGHT = 48;
// const LEVEL_GAP = 120;
// const SIBLING_GAP = 60;
// const CONNECTOR_GAP = 24;
// const PADDING = 40;

// /* =======================
//    Helpers
// ======================= */
// function emptyLayout(x, y) {
//   return {
//     nodes: [],
//     edges: [],
//     families: [],
//     width: 0,
//     minX: x,
//     maxX: x,
//     minY: y,
//     personAnchorX: x,
//     familyAnchorX: x
//   };
// }

// /* =======================
//    Person Node
// ======================= */
// function PersonNodeSvg({ x, y, person, onSelect }) {
//   if (!person) return null;

//   return (
//     <g>
//       <rect
//         x={x}
//         y={y}
//         width={NODE_WIDTH}
//         height={NODE_HEIGHT}
//         rx={12}
//         fill="var(--tree-node-bg)"
//         stroke="var(--tree-node-border)"
//         strokeWidth={2}
//       />
//       <text
//         fill="var(--tree-text)"
//         x={x + NODE_WIDTH / 2}
//         y={y + NODE_HEIGHT / 2 + 6}
//         textAnchor="middle"
//         fontSize={14}
//         fontWeight={600}
//         style={{ cursor: "pointer", userSelect: "none" }}
//         onClick={() => onSelect?.(person)}
//       >
//         {person.name?.length > 18
//           ? person.name.slice(0, 16) + "…"
//           : person.name}
//       </text>
//     </g>
//   );
// }

// /* =======================
//    Recursive Layout
// ======================= */
// function layoutFamilyTree(node, depth, x, expandedMap) {
//   if (!node) return emptyLayout(x, depth * LEVEL_GAP);

//   const parents = Array.isArray(node.parents) ? node.parents : [];
//   const children = Array.isArray(node.children) ? node.children : [];
//   const y = depth * LEVEL_GAP;
//   const marriageY = y + NODE_HEIGHT / 2;

//   /* ---- Parents ---- */
//   const parentNodes = parents.map((p, i) => {
//     const px = x + i * (NODE_WIDTH + 24);
//     return {
//       person: p,
//       x: px,
//       y,
//       isPrimary: i === 0,
//       personAnchorX: px + NODE_WIDTH / 2,

//       // 🔑 ADD THESE
//       familyId: node.id,
//       hasChildren: children.length > 0
//     };
//   });

//   if (!parentNodes.length) return emptyLayout(x, y);

//   const personAnchorX =
//     parentNodes.length === 1
//       ? parentNodes[0].personAnchorX
//       : (parentNodes[0].personAnchorX +
//          parentNodes[parentNodes.length - 1].personAnchorX) / 2;

//   const biologicalAnchorX =
//   parentNodes.find(p => p.isPrimary)?.personAnchorX ??
//   personAnchorX;

//   const families = [{
//     familyId: node.id,
//     anchorX: biologicalAnchorX,
//     y,
//     hasChildren: children.length > 0
//   }];

//   let nodes = [...parentNodes];
//   let edges = [];

//   /* ---- Spouse connector ---- */
//   if (parentNodes.length === 2) {
//     edges.push({
//       x1: parentNodes[0].personAnchorX,
//       y1: marriageY,
//       x2: parentNodes[1].personAnchorX,
//       y2: marriageY
//     });
//   }

//   const expanded = expandedMap[node.id] ?? true;

//   /* ---- Children ---- */
//   if (expanded && children.length) {
//     const measured = children.map(child =>
//       layoutFamilyTree(child, depth + 1, 0, expandedMap)
//     );

//     const totalWidth =
//       measured.reduce((sum, l) => sum + l.width, 0) +
//       SIBLING_GAP * (measured.length - 1);

//     let cursorX = biologicalAnchorX - totalWidth / 2;

//     const childLayouts = measured.map(l => {
//       const shifted = {
//         ...l,
//         nodes: l.nodes.map(n => ({ ...n, x: n.x + cursorX })),
//         edges: l.edges.map(e => ({
//           ...e,
//           x1: e.x1 + cursorX,
//           x2: e.x2 + cursorX
//         })),
//         minX: l.minX + cursorX,
//         maxX: l.maxX + cursorX,
//         personAnchorX: l.personAnchorX + cursorX,
//         biologicalAnchorX: l.biologicalAnchorX + cursorX
//       };
//       cursorX += l.width + SIBLING_GAP;
//       return shifted;
//     });

//     const minX = Math.min(...childLayouts.map(l => l.minX));
//     const maxX = Math.max(...childLayouts.map(l => l.maxX));
//     const barY = y + NODE_HEIGHT + CONNECTOR_GAP;

//     /* ---- Parent → sibling bar ---- */
//     edges.push({
//       x1: biologicalAnchorX,
//       y1: marriageY,
//       x2: biologicalAnchorX,
//       y2: barY
//     });

//     /* ---- Sibling bar (INDIVIDUAL anchors) ---- */
//     if (childLayouts.length > 1) {
//       edges.push({
//         x1: childLayouts[0].biologicalAnchorX,
//         y1: barY,
//         x2: childLayouts[childLayouts.length - 1].biologicalAnchorX,
//         y2: barY
//       });
//     }

//     /* ---- Drops to each sibling ---- */
//     childLayouts.forEach(cl => {
//       edges.push({
//         x1: cl.biologicalAnchorX,
//         y1: barY,
//         x2: cl.biologicalAnchorX,
//         y2: cl.minY
//       });
//     });

//     childLayouts.forEach(cl => {
//       nodes.push(...cl.nodes);
//       edges.push(...cl.edges);
//     });

//     childLayouts.forEach(cl => {
//       families.push(...cl.families);
//     });

//     return {
//       nodes,
//       edges,
//       families,
//       width: maxX - minX,
//       minX,
//       maxX,
//       minY: y,
//       personAnchorX,
//       biologicalAnchorX
//     };
//   }

//   /* ---- Leaf ---- */
//   return {
//     nodes,
//     edges,
//     families,
//     width:
//       parents.length * NODE_WIDTH +
//       (parents.length - 1) * 24,
//     minX: x,
//     maxX:
//       x +
//       parents.length * NODE_WIDTH +
//       (parents.length - 1) * 24,
//     minY: y,
//     personAnchorX,
//     biologicalAnchorX
//   };
// }

// function ExpandToggle({ x, y, expanded, onToggle }) {
//   return (
//     <g
//       transform={`translate(${x}, ${y})`}
//       onClick={onToggle}
//       style={{ cursor: "pointer" }}
//     >
//       {/* background */}
//       <circle
//         r={9}
//         fill="var(--tree-node-bg)"
//         stroke="var(--tree-line)"
//         strokeWidth={1.5}
//       />

//       {/* caret */}
//       <path
//         d="M -4 -2 L 4 -2 L 0 4 Z"
//         fill="var(--tree-text)"
//         transform={expanded ? "rotate(180 0 0)" : undefined}
//       />

//       <title>
//         {expanded ? "Collapse branch" : "Expand branch"}
//       </title>

//     </g>
//   );
// }

// /* =======================
//    SVG Family Tree
// ======================= */
// export default function SvgFamilyTree({ rootFamily, onSelectPerson }) {
//   const [expandedMap, setExpandedMap] = useState({});
//   const toggleNode = (id) => {
//     setExpandedMap(prev => ({
//       ...prev,
//       [id]: !(prev[id] ?? true)
//     }));
//   };

//   const layout = useMemo(() => {
//     if (!rootFamily) return null;

//     const raw = layoutFamilyTree(rootFamily, 0, 0, expandedMap);

//     const treeWidth = raw.maxX - raw.minX;
//     const viewportWidth = Math.max(treeWidth + PADDING * 2, 600);
//     const offsetX = (viewportWidth - treeWidth) / 2 - raw.minX;

//     return {
//       ...raw,
//       viewportWidth,
//       nodes: raw.nodes.map(n => ({ ...n, x: n.x + offsetX })),
//       edges: raw.edges.map(e => ({
//         ...e,
//         x1: e.x1 + offsetX,
//         x2: e.x2 + offsetX
//       })),
//       families: raw.families.map(f => ({
//         ...f,
//         anchorX: f.anchorX + offsetX
//       })),
//       minX: 0,
//       maxX: viewportWidth
//     };
//   }, [rootFamily, expandedMap]);

//   if (!layout || !layout.nodes.length) return null;

//   const { nodes, edges, viewportWidth } = layout;
//   const maxY = Math.max(...nodes.map(n => n.y));

//   return (
//     <svg
//       viewBox={`0 ${-PADDING} ${viewportWidth} ${maxY + NODE_HEIGHT + PADDING * 2}`}
//       width="100%"
//       height={maxY + NODE_HEIGHT + PADDING * 2}
//       preserveAspectRatio="xMidYMid meet"
//     >
//       {edges.map((e, i) => (
//         <line
//           key={i}
//           x1={e.x1}
//           y1={e.y1}
//           x2={e.x2}
//           y2={e.y2}
//           stroke="var(--tree-line)"
//           strokeWidth={2}
//           strokeLinecap="round"
//         />
//       ))}

      
//     {/* nodes */}
//     {nodes.map((n, i) => (
//       <PersonNodeSvg
//         key={`node-${i}`}
//         x={n.x}
//         y={n.y}
//         person={n.person}
//         onSelect={onSelectPerson}
//       />
//     ))}

//     {/* expand / collapse toggles — ONE PER FAMILY */}
//     {layout.families.map(fam => {
//       if (!fam.hasChildren) return null;

//       const expanded = expandedMap[fam.familyId] ?? true;

//       return (
//         <ExpandToggle
//           key={fam.familyId}
//           x={fam.anchorX}
//           y={fam.y + NODE_HEIGHT + 14}
//           expanded={expanded}
//           onToggle={() => toggleNode(fam.familyId)}
//         />
//       );
//     })}

//     </svg>
//   );
// }

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* =======================
   Geometry
======================= */
const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;
const LEVEL_GAP = 120;
const SIBLING_GAP = 60;
const CONNECTOR_GAP = 24;
const PADDING = 40;

/* =======================
   Helpers
======================= */
function emptyLayout(x, y) {
  return {
    nodes: [],
    edges: [],
    families: [],
    width: 0,
    minX: x,
    maxX: x,
    minY: y,
    personAnchorX: x,
    familyAnchorX: x
  };
}

/* =======================
   Person Node
======================= */
function PersonNodeSvg({ x, y, person, onSelect }) {
  if (!person) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        fill="var(--tree-node-bg)"
        stroke="var(--tree-node-border)"
        strokeWidth={2}
      />
      <text
        fill="var(--tree-text)"
        x={x + NODE_WIDTH / 2}
        y={y + NODE_HEIGHT / 2 + 6}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() => onSelect?.(person)}
      >
        {person.name?.length > 18
          ? person.name.slice(0, 16) + "…"
          : person.name}
      </text>
    </g>
  );
}

/* =======================
   Recursive Layout
======================= */
function layoutFamilyTree(node, depth, x, expandedMap) {
  if (!node) return emptyLayout(x, depth * LEVEL_GAP);

  const parents = Array.isArray(node.parents) ? node.parents : [];
  const children = Array.isArray(node.children) ? node.children : [];
  const y = depth * LEVEL_GAP;
  const marriageY = y + NODE_HEIGHT / 2;

  /* ---- Parents ---- */
  const parentNodes = parents.map((p, i) => {
    const px = x + i * (NODE_WIDTH + 24);
    return {
      person: p,
      x: px,
      y,
      isPrimary: i === 0,
      personAnchorX: px + NODE_WIDTH / 2,

      // 🔑 ADD THESE
      familyId: node.id,
      hasChildren: children.length > 0
    };
  });

  if (!parentNodes.length) return emptyLayout(x, y);

  const personAnchorX =
    parentNodes.length === 1
      ? parentNodes[0].personAnchorX
      : (parentNodes[0].personAnchorX +
         parentNodes[parentNodes.length - 1].personAnchorX) / 2;

  const biologicalAnchorX =
  parentNodes.find(p => p.isPrimary)?.personAnchorX ??
  personAnchorX;

  const families = [{
    familyId: node.id,
    anchorX: biologicalAnchorX,
    y,
    hasChildren: children.length > 0
  }];

  let nodes = [...parentNodes];
  let edges = [];

  /* ---- Spouse connector ---- */
  if (parentNodes.length === 2) {
    edges.push({
      x1: parentNodes[0].personAnchorX,
      y1: marriageY,
      x2: parentNodes[1].personAnchorX,
      y2: marriageY
    });
  }

  const expanded = expandedMap[node.id] ?? true;

  /* ---- Children ---- */
  if (expanded && children.length) {
    const measured = children.map(child =>
      layoutFamilyTree(child, depth + 1, 0, expandedMap)
    );

    const totalWidth =
      measured.reduce((sum, l) => sum + l.width, 0) +
      SIBLING_GAP * (measured.length - 1);

    let cursorX = biologicalAnchorX - totalWidth / 2;

    const childLayouts = measured.map(l => {
      const shifted = {
        ...l,
        nodes: l.nodes.map(n => ({ ...n, x: n.x + cursorX })),
        edges: l.edges.map(e => ({
          ...e,
          x1: e.x1 + cursorX,
          x2: e.x2 + cursorX
        })),
        minX: l.minX + cursorX,
        maxX: l.maxX + cursorX,
        personAnchorX: l.personAnchorX + cursorX,
        biologicalAnchorX: l.biologicalAnchorX + cursorX
      };
      cursorX += l.width + SIBLING_GAP;
      return shifted;
    });

    const minX = Math.min(...childLayouts.map(l => l.minX));
    const maxX = Math.max(...childLayouts.map(l => l.maxX));
    const barY = y + NODE_HEIGHT + CONNECTOR_GAP;

    /* ---- Parent → sibling bar ---- */
    edges.push({
      x1: biologicalAnchorX,
      y1: marriageY,
      x2: biologicalAnchorX,
      y2: barY
    });

    /* ---- Sibling bar (INDIVIDUAL anchors) ---- */
    if (childLayouts.length > 1) {
      edges.push({
        x1: childLayouts[0].biologicalAnchorX,
        y1: barY,
        x2: childLayouts[childLayouts.length - 1].biologicalAnchorX,
        y2: barY
      });
    }

    /* ---- Drops to each sibling ---- */
    childLayouts.forEach(cl => {
      edges.push({
        x1: cl.biologicalAnchorX,
        y1: barY,
        x2: cl.biologicalAnchorX,
        y2: cl.minY
      });
    });

    childLayouts.forEach(cl => {
      nodes.push(...cl.nodes);
      edges.push(...cl.edges);
    });

    childLayouts.forEach(cl => {
      families.push(...cl.families);
    });

    return {
      nodes,
      edges,
      families,
      width: maxX - minX,
      minX,
      maxX,
      minY: y,
      personAnchorX,
      biologicalAnchorX
    };
  }

  /* ---- Leaf ---- */
  return {
    nodes,
    edges,
    families,
    width:
      parents.length * NODE_WIDTH +
      (parents.length - 1) * 24,
    minX: x,
    maxX:
      x +
      parents.length * NODE_WIDTH +
      (parents.length - 1) * 24,
    minY: y,
    personAnchorX,
    biologicalAnchorX
  };
}

function ExpandToggle({ x, y, expanded, onToggle }) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onToggle}
      style={{ cursor: "pointer" }}
    >
      {/* background */}
      <circle
        r={9}
        fill="var(--tree-node-bg)"
        stroke="var(--tree-line)"
        strokeWidth={1.5}
      />

      {/* caret */}
      <path
        d="M -4 -2 L 4 -2 L 0 4 Z"
        fill="var(--tree-text)"
        transform={expanded ? "rotate(180 0 0)" : undefined}
      />

      <title>
        {expanded ? "Collapse branch" : "Expand branch"}
      </title>

    </g>
  );
}

/* =======================
   SVG Family Tree
======================= */
export default function SvgFamilyTree({ rootFamily, onSelectPerson }) {
  const [expandedMap, setExpandedMap] = useState({});
  const toggleNode = (id) => {
    setExpandedMap(prev => ({
      ...prev,
      [id]: !(prev[id] ?? true)
    }));
  };

  const layout = useMemo(() => {
    if (!rootFamily) return null;

    const raw = layoutFamilyTree(rootFamily, 0, 0, expandedMap);

    const treeWidth = raw.maxX - raw.minX;
    const viewportWidth = Math.max(treeWidth + PADDING * 2, 600);
    const offsetX = (viewportWidth - treeWidth) / 2 - raw.minX;

    return {
      ...raw,
      viewportWidth,
      nodes: raw.nodes.map(n => ({ ...n, x: n.x + offsetX })),
      edges: raw.edges.map(e => ({
        ...e,
        x1: e.x1 + offsetX,
        x2: e.x2 + offsetX
      })),
      families: raw.families.map(f => ({
        ...f,
        anchorX: f.anchorX + offsetX
      })),
      minX: 0,
      maxX: viewportWidth
    };
  }, [rootFamily, expandedMap]);

  if (!layout || !layout.nodes.length) return null;

  const { nodes, edges, viewportWidth } = layout;
  const maxY = Math.max(...nodes.map(n => n.y));

  return (
    <svg
      viewBox={`0 ${-PADDING} ${viewportWidth} ${maxY + NODE_HEIGHT + PADDING * 2}`}
      width="100%"
      height={maxY + NODE_HEIGHT + PADDING * 2}
      preserveAspectRatio="xMidYMid meet"
    >
      <AnimatePresence initial={false}>
        {edges.map((e, i) => (
          <motion.line
            key={`edge-${i}-${e.x1}-${e.y1}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="var(--tree-line)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: "linear" }}
          />
        ))}
      </AnimatePresence>


      
    {/* nodes */}
    <AnimatePresence initial={false}>
      {nodes.map((n) => {
        const expanded =
          expandedMap[n.familyId] ?? true;

        return (
          <motion.g
            key={n.person.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <PersonNodeSvg
              x={n.x}
              y={n.y}
              person={n.person}
              onSelect={onSelectPerson}
            />
          </motion.g>
        );
      })}
    </AnimatePresence>

    {/* expand / collapse toggles — ONE PER FAMILY */}
    {layout.families.map(fam => {
      if (!fam.hasChildren) return null;

      const expanded = expandedMap[fam.familyId] ?? true;

      return (
        <ExpandToggle
          key={fam.familyId}
          x={fam.anchorX}
          y={fam.y + NODE_HEIGHT + 14}
          expanded={expanded}
          onToggle={() => toggleNode(fam.familyId)}
        />
      );
    })}

    </svg>
  );
}
