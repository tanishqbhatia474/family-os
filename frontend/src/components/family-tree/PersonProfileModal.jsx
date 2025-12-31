import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EditPersonModal from "./EditPersonModal";

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
        onClick={(e) => e.stopPropagation()}
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
          <Row label="Gender" value={person.gender || "—"} lightText />
          <Row label="Status" value={person.isDeceased ? "Deceased" : "Alive"} lightText />
        </Section>

        <Section title="Family">
          <Row label="Father" value={father?.name || "—"} lightText />
          <Row label="Mother" value={mother?.name || "—"} lightText />
          <Row label="Children" value={person.children?.length || 0} lightText />
        </Section>

        {isHonor && (
          <button
            onClick={() => setShowEdit(true)}
            className="
              w-full py-2 rounded-md text-sm font-medium
              bg-[#1F3D34] text-white
              hover:bg-[#183128]
              cursor-pointer
            "
          >
            Edit Details
          </button>
        )}

        <button
          onClick={onClose}
          className="card-link w-full py-2 rounded-md text-sm border border-transparent cursor-pointer no-underline"
          style={{ textDecoration: 'none' }}
        >
          Close
        </button>

        {showEdit && (
          <EditPersonModal
            person={person}
            onClose={() => {
              setShowEdit(false);
              onClose(); // 🔥 CLOSE PROFILE TOO
            }}
            onSaved={async () => {
              if (onSaved) await onSaved(); // 🔥 REFRESH TREE & PERSONMAP
              setShowEdit(false);
              onClose();       // 🔥 CLOSE PROFILE
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

function Row({ label, value, lightText }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="row-label">{label}</span>
      <span className="row-value">{value}</span>
    </div>
  );
}
