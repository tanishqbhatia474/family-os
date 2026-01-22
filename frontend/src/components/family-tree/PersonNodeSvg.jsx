import React from "react";

function PersonNodeSvg({
  x,
  y,
  person,
  onSelect,
  hasChildren,
  expanded,
  onToggle
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        fill="var(--panel)"
        stroke="var(--border)"
        strokeWidth={2}
      />

      <text
        x={x + NODE_WIDTH / 2}
        y={y + NODE_HEIGHT / 2 + 6}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill="var(--text)"
        style={{ cursor: "pointer" }}
        onClick={() => onSelect?.(person)}
      >
        {person.name}
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
            cy={y + NODE_HEIGHT + 10}
            r={8}
            fill="var(--bg)"
            stroke="var(--border)"
            strokeWidth={1.5}
          />
          <text
            x={x + NODE_WIDTH / 2}
            y={y + NODE_HEIGHT + 14}
            textAnchor="middle"
            fontSize={12}
            fill="var(--muted)"
          >
            {expanded ? "–" : "+"}
          </text>
        </g>
      )}
    </g>
  );
}
