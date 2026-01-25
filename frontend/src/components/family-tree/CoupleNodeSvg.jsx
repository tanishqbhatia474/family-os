export default function CoupleNodeSvg({
  x,
  y,
  father,
  mother,
  onSelect
}) {
  const width = 200;
  const height = 56;
  const radius = 12;
  const textY = 36;
  const maxChars = 14;

  const truncate = (name) =>
    name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;

  const leftName = father?.name ?? "Unknown";
  const rightName = mother?.name ?? "Unknown";

  const clipId = `clip-${x}-${y}`;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Background */}
      <rect
        width={width}
        height={height}
        rx={radius}
        fill="#ffffff"
        stroke="#1f2937"
        strokeWidth="1.5"
      />

      {/* Divider */}
      <line
        x1={width / 2}
        y1="6"
        x2={width / 2}
        y2={height - 6}
        stroke="#1f2937"
        strokeWidth="1"
      />

      {/* Clip text inside rounded box */}
      <clipPath id={clipId}>
        <rect width={width} height={height} rx={radius} />
      </clipPath>

      {/* Father half click target */}
      <rect
        x={0}
        y={0}
        width={width / 2}
        height={height}
        fill="transparent"
        style={{ cursor: father ? "pointer" : "default" }}
        onClick={() => father && onSelect?.(father)}
      />

      {/* Mother half click target */}
      <rect
        x={width / 2}
        y={0}
        width={width / 2}
        height={height}
        fill="transparent"
        style={{ cursor: mother ? "pointer" : "default" }}
        onClick={() => mother && onSelect?.(mother)}
      />

      {/* Father name */}
      <text
        x={width / 4}
        y={textY}
        textAnchor="middle"
        fontSize="14"
        fontWeight="500"
        fill="#1f2937"
        clipPath={`url(#${clipId})`}
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {truncate(leftName)}
      </text>

      {/* Mother name */}
      <text
        x={(width * 3) / 4}
        y={textY}
        textAnchor="middle"
        fontSize="14"
        fontWeight="500"
        fill="#1f2937"
        clipPath={`url(#${clipId})`}
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {truncate(rightName)}
      </text>
    </g>
  );
}
