import React from "react";

// Responsive constants
const getNodeSize = () => {
  if (typeof window === 'undefined') return { width: 120, height: 56 };
  const isMobile = window.innerWidth < 640;
  return {
    width: isMobile ? 100 : 120,
    height: isMobile ? 48 : 56
  };
};

function PersonNodeSvg({
  x,
  y,
  person,
  onSelect,
  hasChildren,
  expanded,
  onToggle
}) {
  const { width: NODE_WIDTH, height: NODE_HEIGHT } = getNodeSize();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const fontSize = isMobile ? 12 : 14;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={isMobile ? 10 : 12}
        fill="var(--panel)"
        stroke="var(--border)"
        strokeWidth={2}
      />

      <text
        x={x + NODE_WIDTH / 2}
        y={y + NODE_HEIGHT / 2 + (isMobile ? 4 : 6)}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={600}
        fill="var(--text)"
        style={{ cursor: "pointer" }}
        onClick={() => onSelect?.(person)}
      >
        {person.name.length > (isMobile ? 10 : 12) 
          ? person.name.slice(0, isMobile ? 9 : 11) + "…" 
          : person.name}
      </text>

      {/* Expand / collapse control */}
      {hasChildren && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onToggle(person.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <circle
            cx={x + NODE_WIDTH / 2}
            cy={y + NODE_HEIGHT + (isMobile ? 8 : 10)}
            r={isMobile ? 7 : 8}
            fill="var(--bg)"
            stroke="var(--border)"
            strokeWidth={1.5}
          />
          <text
            x={x + NODE_WIDTH / 2}
            y={y + NODE_HEIGHT + (isMobile ? 12 : 14)}
            textAnchor="middle"
            fontSize={isMobile ? 11 : 12}
            fill="var(--muted)"
          >
            {expanded ? "–" : "+"}
          </text>
        </g>
      )}
    </g>
  );
}

export default PersonNodeSvg;