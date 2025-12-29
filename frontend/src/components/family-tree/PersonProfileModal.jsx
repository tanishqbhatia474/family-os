export default function PersonProfileModal({
  person,
  personMap,
  onClose
}) {
  if (!person || !personMap) return null;

  const father = person.fatherId
    ? personMap[person.fatherId]
    : null;

  const mother = person.motherId
    ? personMap[person.motherId]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{person.name}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Basic Info */}
        <Section title="Basic Information">
          <Row label="Gender" value={person.gender || "—"} />
          <Row
            label="Status"
            value={person.isDeceased ? "Deceased" : "Alive"}
          />
        </Section>

        {/* Family */}
        <Section title="Family">
          <Row
            label="Father"
            value={father ? father.name : "—"}
          />
          <Row
            label="Mother"
            value={mother ? mother.name : "—"}
          />
          <Row
            label="Children"
            value={person.children?.length || 0}
          />
        </Section>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-black text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* helpers */
function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
