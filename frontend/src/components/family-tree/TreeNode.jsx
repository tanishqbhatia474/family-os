export default function TreeNode({ person }) {
  return (
    <div className="pl-6 relative">
      {/* connector line */}
      <div className="absolute left-0 top-0 h-full w-px bg-[#1F3D34]/20" />

      {/* node */}
      <div
        className="
          inline-block
          px-4 py-2
          rounded-md
          bg-white/70
          backdrop-blur-sm
          border border-[#1F3D34]/15
        "
      >
        <p className="text-sm font-medium text-neutral-900">
          {person.name}
        </p>

        {person.isDeceased && (
          <p className="text-xs text-neutral-500 italic mt-0.5">
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
