export default function TreeNode({ person }) {
  const isDeceased = person.isDeceased;

  return (
    <div className="pl-6 relative">
      {/* connector line */}
      <div
        className="
          absolute left-0 top-0 h-full w-px
          opacity-40
        "
        style={{
          backgroundColor: isDeceased
            ? "var(--muted)"
            : "var(--accent)"
        }}
      />

      {/* node */}
      <div
        className="
          inline-block
          px-4 py-2
          rounded-md
          border
          backdrop-blur-sm
        "
        style={{
          backgroundColor: "var(--panel)",
          borderColor: "var(--border)",
          color: "var(--text)",
          opacity: isDeceased ? 0.7 : 1
        }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text)" }}
        >
          {person.name}
        </p>

        {isDeceased && (
          <p
            className="text-xs italic mt-0.5"
            style={{ color: "var(--muted)" }}
          >
            Deceased
          </p>
        )}
      </div>

      {/* children */}
      {person.children?.length > 0 && (
        <div className="mt-6 space-y-6">
          {person.children.map((child) => (
            <TreeNode key={child._id} person={child} />
          ))}
        </div>
      )}
    </div>
  );
}
