/**
 * Props:
 * - ritual
 * - onClose
 */
export default function RitualViewModal({ ritual, onClose }) {
  if (!ritual) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-bg modal rounded-xl p-6 space-y-5 shadow-xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <h2 className="card-title text-lg leading-tight">
            {ritual.title}
          </h2>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Meta */}
        <p className="card-meta text-xs">
          Created on{" "}
          {new Date(ritual.createdAt).toLocaleDateString()}
        </p>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="section-label">Description</h3>
          <p className="row-value whitespace-pre-wrap text-sm leading-relaxed">
            {ritual.description}
          </p>
        </div>
      </div>
    </div>
  );
}
