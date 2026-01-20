export default function TreeNode({ person, onSelect }) {
  const isDeceased = person.isDeceased;

  return (
    <div className="pl-6 relative">
      {/* connector line */}
      <div
        className="absolute left-0 top-0 h-full w-px opacity-40"
        style={{
          backgroundColor: isDeceased
            ? "var(--muted)"
            : "var(--accent)",
          pointerEvents: "none",
        }}
      />

      {/* NODE (CLICKABLE) */}
      <button
        type="button"
        onClick={() => onSelect?.(person)}
        className="
          relative
          z-10
          inline-flex
          flex-col
          px-4
          py-2
          rounded-md
          text-left
        "
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--bg)",
          opacity: isDeceased ? 0.55 : 1,
          cursor: "pointer",
        }}
      >
        <span className="text-sm font-medium leading-tight">
          {person.name}
        </span>

        {isDeceased && (
          <span
            className="text-xs italic mt-0.5"
            style={{
              color: "var(--bg)",
              opacity: 0.85,
            }}
          >
            Deceased
          </span>
        )}
      </button>

      {/* CHILDREN */}
      {person.children?.length > 0 && (
        <div className="mt-6 space-y-6">
          {person.children.map(child => (
            <TreeNode
              key={child._id}
              person={child}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
