import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EditPersonModal from "./EditPersonModal";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function PersonProfileModal({
  person,
  personMap,
  onClose,
  onSaved,
}) {
  const { user } = useAuth();
  const isHonor = user?.isHonor;
  const [showEdit, setShowEdit] = useState(false);

  if (!person || !personMap) return null;

  const father = person.fatherId ? personMap[person.fatherId] : null;
  const mother = person.motherId ? personMap[person.motherId] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-xl p-6 space-y-5 card-bg modal shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="card-title text-lg truncate">{person.name}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <Section title="Basic Information">
          <Row label="Gender" value={person.gender || "—"} />
          <Row label="Date of Birth" value={formatDate(person.birthDate)} />
          <Row label="Status" value={person.isDeceased ? "Deceased" : "Alive"} />
        </Section>

        <Section title="Family">
          <Row label="Father" value={father?.name || "—"} />
          <Row label="Mother" value={mother?.name || "—"} />
          <Row label="Children" value={person.children?.length || 0} />
        </Section>

        {isHonor && (
          <button
            onClick={() => setShowEdit(true)}
            className="
              w-full py-2 rounded-md text-sm font-medium
              bg-[#1F3D34] text-white
              hover:bg-[#183128]
            "
          >
            Edit Details
          </button>
        )}

        <button
          onClick={onClose}
          className="card-link w-full py-2 rounded-md text-sm no-underline"
        >
          Close
        </button>

        {showEdit && (
          <EditPersonModal
            person={person}
            onClose={() => {
              setShowEdit(false);
              onClose();
            }}
            onSaved={async () => {
              if (onSaved) await onSaved();
              setShowEdit(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

/* helpers */

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="section-label">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="row-label">{label}</span>
      <span className="row-value">{value}</span>
    </div>
  );
}
