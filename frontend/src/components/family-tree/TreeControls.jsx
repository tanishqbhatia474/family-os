import { motion } from "framer-motion";

export default function TreeControls({ onFitScreen }) {
  return (
    <div className="flex justify-center mt-4 sm:mt-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-xl backdrop-blur-sm w-full sm:w-auto"
      >
        <ControlButton
          onClick={onFitScreen}
          label="Fit to Screen"
          icon={<FitIcon />}
        />
      </motion.div>
    </div>
  );
}

function ControlButton({ onClick, disabled, icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-3 py-2 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-[var(--hover)] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px] sm:min-h-0"
      aria-label={label}
    >
      <span className="text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
        {icon}
      </span>
      <span className="text-sm sm:text-sm font-medium text-[var(--text)] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function FitIcon() {
  return (
    <svg
      width="18"
      height="18"
      className="sm:w-5 sm:h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}