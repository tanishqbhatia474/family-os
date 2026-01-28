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
        px-2 py-1.5 sm:px-3 sm:py-2
        bg-white dark:bg-neutral-800
        transition-all
        focus:outline-none focus:ring-2 focus:ring-accent
        text-xs sm:text-sm
        min-w-[80px] sm:min-w-[100px]

        ${isHome ? "ring-2 ring-accent shadow-lg" : "hover:shadow-md"}
        ${person.isDeceased ? "opacity-60" : ""}
      `}
      onClick={() => onSelect?.(person)}
      onKeyDown={e => {
        if (e.key === "Enter") onSelect?.(person);
      }}
    >
      <div className="font-medium truncate text-center">
        {person.name}
      </div>

      {person.isDeceased && (
        <div className="text-[0.625rem] sm:text-xs text-neutral-500 italic text-center mt-0.5">
          Deceased
        </div>
      )}
    </div>
  );
}