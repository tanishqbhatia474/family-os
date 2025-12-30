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
        className="
          w-[420px]
          rounded-xl p-6 space-y-5
          bg-white text-neutral-900
          dark:bg-[#0f1f1a] dark:text-neutral-100
          shadow-xl
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{person.name}</h2>
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
            "
          >
            Edit Details
          </button>
        )}

        <button
          onClick={onClose}
          className="
            w-full py-2 rounded-md text-sm
            border border-neutral-300
            text-neutral-700
            hover:bg-neutral-100

            dark:border-neutral-700
            dark:text-neutral-300
            dark:hover:bg-neutral-800
          "
        >
          Close
        </button>

        {showEdit && (
          <EditPersonModal
            person={person}
            onClose={() => setShowEdit(false)}
            onSaved={onSaved}
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
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-400">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, lightText }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={
        lightText
          ? "text-neutral-600 dark:text-neutral-400"
          : "text-neutral-500 dark:text-neutral-400"
      }>
        {label}
      </span>
      <span className={
        lightText
          ? "font-medium text-neutral-900 dark:text-neutral-100"
          : "font-medium text-neutral-900 dark:text-neutral-100"
      }>
        {value}
      </span>
    </div>
  );
}
