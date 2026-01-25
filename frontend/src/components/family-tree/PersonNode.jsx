export default function PersonNode({ person, isHome, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={isHome ? "true" : undefined}
      title={person.name}
      className={`
        person-node
        cursor-pointer
        rounded-lg
        px-3 py-2
        bg-white dark:bg-neutral-800
        transition
        focus:outline-none focus:ring-2 focus:ring-accent

        ${isHome ? "ring-2 ring-accent shadow-lg" : ""}
        ${person.isDeceased ? "opacity-60" : ""}
      `}
      onClick={() => onSelect?.(person)}
      onKeyDown={e => {
        if (e.key === "Enter") onSelect?.(person);
      }}
    >
      <div className="font-medium truncate">
        {person.name}
      </div>

      {person.isDeceased && (
        <div className="text-xs text-neutral-500 italic">
          Deceased
        </div>
      )}
    </div>
  );
}
