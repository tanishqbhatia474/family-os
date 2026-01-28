import React, { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;
const LEVEL_GAP = 140;
const SIBLING_GAP = 40;
const TOGGLE_SIZE = 24;
const TOGGLE_OFFSET = 12;
const TOGGLE_RADIUS = TOGGLE_SIZE / 2;
const TOGGLE_GAP = 4;
const PADDING = 100;

const SPRING_CONFIG = { type: "spring", stiffness: 300, damping: 30 };

function PersonNodeSvg({ x, y, person, onSelect, isCurrent }) {
  return (
    <motion.g
      data-person-id={person._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={SPRING_CONFIG}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect?.(person)}
    >
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        fill="var(--tree-node-bg)"
        stroke={isCurrent ? "var(--accent)" : "var(--tree-node-border)"}
        strokeWidth={isCurrent ? 3 : 1.5}
        className="shadow-sm"
      />
      <text
        x={x + NODE_WIDTH / 2}
        y={y + NODE_HEIGHT / 2 + 5}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="var(--tree-text)"
        style={{ userSelect: "none" }}
      >
        {person.name}
      </text>
      {isCurrent && (
        <text
          x={x + NODE_WIDTH - 8}
          y={y + NODE_HEIGHT - 8}
          textAnchor="end"
          fontSize={9}
          fill="var(--accent)"
          fontWeight={700}
        >
          YOU
        </text>
      )}
    </motion.g>
  );
}

function AnimatedLine({ x1, y1, x2, y2, edgeId }) {
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--tree-line)"
      strokeWidth={2}
      strokeLinecap="round"
      initial={{ 
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0
      }}
      animate={{ 
        strokeDashoffset: 0,
        opacity: 1
      }}
      exit={{ 
        strokeDashoffset: length,
        opacity: 0
      }}
      transition={{
        strokeDashoffset: { duration: 0.4, ease: "easeInOut" },
        opacity: { duration: 0.25 }
      }}
    />
  );
}

function layoutFamilyTree(node, depth, expandedMap, isRoot = true) {
  if (!node || !Array.isArray(node.parents)) {
    return {
      nodes: [],
      edges: [],
      toggles: [],
      width: 0,
      minX: 0,
      maxX: 0,
      minY: depth * LEVEL_GAP
    };
  }

  const children = node.children ?? [];
  const parents = node.parents;

  const y = depth * LEVEL_GAP;
  const marriageY = y + NODE_HEIGHT / 2;

  /**
 * AUTO-SHOW SPOUSE IF THEY ARE EXPLICITLY A SPOUSE
 * Visual-only. Never inferred from children.
 */
function collectImplicitSpouses(parentNodes) {
  const spouses = [];
  const visibleIds = new Set(parentNodes.map(p => String(p.person._id)));

  parentNodes.forEach(p => {
    const person = p.person;
    if (!Array.isArray(person.spouses)) return;

    person.spouses.forEach(spouse => {
      const sid = String(spouse._id);
      if (!visibleIds.has(sid)) {
        spouses.push({
          ...spouse,
          spouseOf: person._id
        });
        visibleIds.add(sid);
      }
    });
  });

  return spouses;
}

  // ---- layout parents ----
  const totalParentsWidth =
    parents.length * NODE_WIDTH + (parents.length - 1) * 24;
  const startX = -totalParentsWidth / 2;

  const parentNodes = parents.map((p, i) => {
    const x = startX + i * (NODE_WIDTH + 24);
    const selfAnchorX = x + NODE_WIDTH / 2;
    return {
      person: p,
      x,
      y,
      anchorX: selfAnchorX,
      selfAnchorX,
      nodeId: `${node.id}_parent_${i}`,
      id: p._id
    };
  });

  let nodes = [...parentNodes];
  let edges = [];
  let toggles = [];

  const implicitSpouses = collectImplicitSpouses(parentNodes);


  implicitSpouses.forEach((spouse, i) => {
  const anchorParent =
    parentNodes.find(p =>
      String(p.person._id) === String(spouse.spouseOf)
    ) || parentNodes[0];

  const x = anchorParent.x + NODE_WIDTH + 24;
  const anchorX = x + NODE_WIDTH / 2;

  nodes.push({
    person: spouse,
    x,
    y,
    anchorX,
    selfAnchorX: anchorX,
    nodeId: `${node.id}_implicit_spouse_${i}`,
    id: spouse._id,
    isImplicitSpouse: true
  });

  edges.push({
    x1: anchorParent.anchorX,
    y1: marriageY,
    x2: anchorX,
    y2: marriageY,
    isParentEdge: true
  });
});

  // ---- edge case: no parents ----
  if (parentNodes.length === 0) {
    return {
      nodes,
      edges,
      toggles,
      width: NODE_WIDTH,
      minX: 0,
      maxX: NODE_WIDTH,
      minY: y
    };
  }

  let minX = parentNodes[0].x;
  let maxX = parentNodes[parentNodes.length - 1].x + NODE_WIDTH;

  // ---- spouse connector between real parents ----
  if (parentNodes.length === 2) {
    edges.push({
      x1: parentNodes[0].anchorX,
      y1: marriageY,
      x2: parentNodes[1].anchorX,
      y2: marriageY,
      edgeId: `${node.id}_spouse`,
      isParentEdge: true
    });
  }

  // ⬇️ rest of your existing logic continues unchanged
  // Check if expanded
  const isExpanded = expandedMap[node.id] !== false;

  function getPersonId(p) {
  // Handle string IDs, object IDs, or nested references
  if (typeof p === 'string') {
    return p;
  }
  if (p?._id) {
    return String(p._id);
  }
  if (p?.id) {
    return String(p.id);
  }
  return String(p);
}

// DEBUG: Check actual data structure
console.log('🔬 RAW CHILD DATA:', JSON.stringify(children.map(c => ({
  name: c.name,
  parents: c.parents,
  _id: c._id
})), null, 2));
  // Calculate biological anchor (center between parents or single parent center)

  function getBiologicalAnchorX(parentNodes, children) {
  if (parentNodes.length === 1) {
    return parentNodes[0].selfAnchorX;
  }

  if (parentNodes.length === 2) {
    const parentIds = parentNodes.map(p => String(p.person._id));
    const referencedParentIds = new Set();

    children.forEach(child => {
      const person = child.person ?? child.parents?.[0];
      if (!person) return;


      if (person.fatherId && parentIds.includes(String(person.fatherId))) {
      referencedParentIds.add(String(person.fatherId));
      }


      if (person.motherId && parentIds.includes(String(person.motherId))) {
      referencedParentIds.add(String(person.motherId));
      }
    });

    const matchedParents = parentNodes.filter(p =>
      referencedParentIds.has(String(p.person._id))
    );

    if (matchedParents.length === 1) {
      return matchedParents[0].selfAnchorX;
    }

    if (matchedParents.length === 2) {
      return (
        matchedParents[0].selfAnchorX +
        matchedParents[1].selfAnchorX
      ) / 2;
    }

    return (
      parentNodes[0].selfAnchorX +
      parentNodes[1].selfAnchorX
    ) / 2;
  }

  return parentNodes[0].selfAnchorX;
}
console.group("BIOLOGICAL ANCHOR DEBUG");

console.table(
  parentNodes.map(p => ({
    role: "parentNode",
    id: p.person._id,
    name: p.person.name
  }))
);

console.table(
  children.flatMap(c =>
    (c.parents ?? []).map(p => ({
      role: "childParent",
      id: p._id,
      name: p.name,
      child: c.name
    }))
  )
);

console.groupEnd();

  // const biologicalAnchorX = parentNodes.length === 2
  //   ? (parentNodes[0].selfAnchorX + parentNodes[1].selfAnchorX) / 2
  //   : parentNodes[0].selfAnchorX;

  const biologicalAnchorX = getBiologicalAnchorX(parentNodes, children);

  // Show toggle if there are children
  if (children.length > 0) {
    const toggleY = y + NODE_HEIGHT + TOGGLE_OFFSET;
    toggles.push({
      nodeId: node.id,
      x: biologicalAnchorX,
      y: toggleY,
      isExpanded
    });
  }

  // Stop if collapsed or no children
  if (!isExpanded || children.length === 0) {
    return {
      nodes,
      edges,
      toggles,
      width: maxX - minX,
      minX,
      maxX,
      minY: y
    };
  }

  // Layout children recursively
  const childLayouts = children
    .map(child => layoutFamilyTree(child, depth + 1, expandedMap, false))
    .filter(l => l && l.nodes.length > 0);

  if (!childLayouts.length) {
    return {
      nodes,
      edges,
      toggles,
      width: maxX - minX,
      minX,
      maxX,
      minY: y
    };
  }

  const totalWidth = childLayouts.reduce((sum, l) => sum + l.width, 0) + SIBLING_GAP * (childLayouts.length - 1);

  // Position children layouts
  let cursorX = biologicalAnchorX - totalWidth / 2;

  childLayouts.forEach((cl) => {
    const dx = cursorX - cl.minX;

    cl.nodes.forEach(n => (n.x += dx));
    cl.edges.forEach(e => {
      e.x1 += dx;
      e.x2 += dx;
    });
    cl.toggles.forEach(t => {
      t.x += dx;
    });

    cl.personAnchorX = cl.nodes[0].x + NODE_WIDTH / 2;
    cursorX += cl.width + SIBLING_GAP;
  });

  const toggleY = y + NODE_HEIGHT + TOGGLE_OFFSET;
  const barY = toggleY + TOGGLE_RADIUS + TOGGLE_GAP;

  // Vertical connector from parent to toggle (top segment)
  edges.push({
    x1: biologicalAnchorX,
    y1: marriageY,
    x2: biologicalAnchorX,
    y2: toggleY - TOGGLE_RADIUS - TOGGLE_GAP,
    edgeId: `${node.id}_down_top`,
    isDescendantEdge: true
  });

  // Vertical connector from toggle to horizontal bar (bottom segment)
  edges.push({
    x1: biologicalAnchorX,
    y1: toggleY + TOGGLE_RADIUS + TOGGLE_GAP,
    x2: biologicalAnchorX,
    y2: barY,
    edgeId: `${node.id}_down_bottom`,
    isDescendantEdge: true
  });

  if (childLayouts.length > 1) {
    // Horizontal bar connecting all children
    edges.push({
      x1: childLayouts[0].personAnchorX,
      y1: barY,
      x2: childLayouts[childLayouts.length - 1].personAnchorX,
      y2: barY,
      edgeId: `${node.id}_sibling_bar`,
      isDescendantEdge: true
    });

    // Vertical drops from bar to each child
    childLayouts.forEach((cl, idx) => {
      edges.push({
        x1: cl.personAnchorX,
        y1: barY,
        x2: cl.personAnchorX,
        y2: cl.nodes[0].y,
        edgeId: `${node.id}_drop_${idx}`,
        isDescendantEdge: true
      });
    });
  } else {
    // Single child - direct vertical drop
    const childAnchorX = childLayouts[0].personAnchorX;
    const childTopY = childLayouts[0].nodes[0].y;

    edges.push({
      x1: childAnchorX,
      y1: barY,
      x2: childAnchorX,
      y2: childTopY,
      edgeId: `${node.id}_single_drop`,
      isDescendantEdge: true
    });

    // Horizontal bridge if parent and child are not aligned
    if (biologicalAnchorX !== childAnchorX) {
      edges.push({
        x1: biologicalAnchorX,
        y1: barY,
        x2: childAnchorX,
        y2: barY,
        edgeId: `${node.id}_bridge`,
        isDescendantEdge: true
      });
    }
  }

  // Merge child layouts
  childLayouts.forEach(cl => {
    nodes.push(...cl.nodes);
    edges.push(...cl.edges);
    toggles.push(...cl.toggles);
    minX = Math.min(minX, cl.minX);
    maxX = Math.max(maxX, cl.maxX);
  });

  // Root centering fix
  if (isRoot) {
    const layoutCenterX = (minX + maxX) / 2;
    const offsetX = -layoutCenterX;

    nodes.forEach(n => (n.x += offsetX));
    edges.forEach(e => {
      e.x1 += offsetX;
      e.x2 += offsetX;
    });
    toggles.forEach(t => (t.x += offsetX));

    minX += offsetX;
    maxX += offsetX;
  }

  return {
    nodes,
    edges,
    toggles,
    width: maxX - minX,
    minX,
    maxX,
    minY: y
  };
}

export default function SvgFamilyTree({ rootFamily, onSelectPerson, currentPersonId }) {
  const [expandedMap, setExpandedMap] = useState({});
  const layout = useMemo(() => {
    if (!rootFamily) return null;
    return layoutFamilyTree(rootFamily, 0, expandedMap);
  }, [rootFamily, expandedMap]);

  useEffect(() => {
    setExpandedMap({});
  }, [rootFamily]);

  const handleToggle = (nodeId) => {
    setExpandedMap(prev => ({
      ...prev,
      [nodeId]: prev[nodeId] === false ? true : false
    }));
  };

  if (!layout || layout.nodes.length === 0) return null;

  // Calculate bounding box
  const allNodeBounds = layout.nodes.map(n => ({
    minX: n.x,
    maxX: n.x + NODE_WIDTH,
    minY: n.y,
    maxY: n.y + NODE_HEIGHT
  }));

  const allEdgeBounds = layout.edges.map(e => ({
    minX: Math.min(e.x1, e.x2),
    maxX: Math.max(e.x1, e.x2),
    minY: Math.min(e.y1, e.y2),
    maxY: Math.max(e.y1, e.y2)
  }));

  const allToggleBounds = layout.toggles.map(t => ({
    minX: t.x - TOGGLE_RADIUS,
    maxX: t.x + TOGGLE_RADIUS,
    minY: t.y - TOGGLE_RADIUS,
    maxY: t.y + TOGGLE_RADIUS
  }));

  const allBounds = [...allNodeBounds, ...allEdgeBounds, ...allToggleBounds];

  const contentMinX = Math.min(...allBounds.map(b => b.minX));
  const contentMaxX = Math.max(...allBounds.map(b => b.maxX));
  const contentMinY = Math.min(...allBounds.map(b => b.minY));
  const contentMaxY = Math.max(...allBounds.map(b => b.maxY));

  const STROKE_MARGIN = 4;
  
  const viewBoxMinX = contentMinX - PADDING - STROKE_MARGIN;
  const viewBoxMinY = contentMinY - PADDING - STROKE_MARGIN;
  const viewBoxWidth = (contentMaxX - contentMinX) + PADDING * 2 + STROKE_MARGIN * 2;
  const viewBoxHeight = (contentMaxY - contentMinY) + PADDING * 2 + STROKE_MARGIN * 2;
  const treeRef = useRef(null);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
      className="tree-svg"
      // data-content-min-x={contentMinX}
      // data-content-min-y={contentMinY}
      // data-content-width={contentMaxX - contentMinX}
      // data-content-height={contentMaxY - contentMinY}
    >
      <g ref={treeRef}>
        {/* Parent edges (non-animated, always visible) */}
        {layout.edges
          .filter(e => e.isParentEdge)
          .map((e, i) => (
            <line
              key={`parent-${e.edgeId || i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="var(--tree-line)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}

        {/* Descendant edges (animated) */}
        <AnimatePresence mode="sync">
          {layout.edges
            .filter(e => e.isDescendantEdge)
            .map((e, i) => (
              <AnimatedLine
                key={e.edgeId || `edge-${i}`}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                edgeId={e.edgeId}
              />
            ))}
        </AnimatePresence>

        {/* Nodes (animated) */}
        <AnimatePresence mode="sync">
          {layout.nodes.map((n) => (
            <PersonNodeSvg
              key={n.nodeId || n.id}
              x={n.x}
              y={n.y}
              person={n.person}
              onSelect={onSelectPerson}
              isCurrent={String(n.id) === String(currentPersonId)}
            />
          ))}
        </AnimatePresence>

        {/* Toggle buttons */}
        {layout.toggles.map((t) => (
          <g
            key={`toggle-${t.nodeId}`}
            transform={`translate(${t.x}, ${t.y})`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(t.nodeId);
            }}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              r={TOGGLE_RADIUS}
              fill="var(--tree-node-bg)"
              stroke="var(--tree-node-border)"
              strokeWidth={2}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            <text
              dy="5"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="var(--tree-text)"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {t.isExpanded ? "−" : "+"}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

