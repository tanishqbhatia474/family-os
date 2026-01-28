import PersonNode from "./PersonNode";

export default function CoupleNode({
  primary,
  spouse,
  isHome,
  onSelect,
  coupleRef
}) {
  return (
    <div className="couple-node relative flex items-center gap-2 sm:gap-4">
      <PersonNode person={primary} isHome={isHome} onSelect={onSelect} />

      {spouse && (
        <>
          {/* SPOUSE CONNECTOR + TRUE MIDPOINT */}
          <span
            ref={coupleRef}
            className="partner-connector"
          />
          <PersonNode
            person={spouse}
            isHome={false}
            onSelect={onSelect}
          />
        </>
      )}
    </div>
  );
}