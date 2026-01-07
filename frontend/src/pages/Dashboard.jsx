import FluidBackground from "@/components/visual/FluidBackground";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="relative">
      {/* Hero background */}
      <FluidBackground />

      {/* Hero content */}
      <section className="relative z-10 max-w-[680px] px-6 pt-32 pb-24 mx-auto">
        <h1 className="text-[3.25rem] leading-[1.05] font-medium tracking-tight mb-6 text-[var(--text)]">
          Welcome
        </h1>

        <p className="text-[1.125rem] leading-relaxed mb-6 text-[var(--muted)]">
          This is your family’s private space for preserving relationships,
          important records, and shared traditions over time.
        </p>

        {/* ✅ contextual line */}
        <p className="text-[0.95rem] leading-relaxed italic max-w-md text-[var(--muted)]">
          You’re viewing a space that grows quietly with your family.
        </p>
      </section>

      {/* Main content */}
      <section className="max-w-[680px] mx-auto px-6 space-y-10 pb-32">

        {/* Family Tree */}
        <div className="card-bg rounded-xl p-6 space-y-4">
          <h2 className="text-[1.25rem] font-medium text-[var(--text)]">
            Family Tree
          </h2>

          <p className="text-[1.05rem] text-[var(--muted)]">
            View and manage your family structure, relationships, and lineage
            in one place.
          </p>

          <Link
            to="/family-tree"
            className="text-sm font-medium text-[var(--accent)] hover:opacity-80"
          >
            View family tree →
          </Link>
        </div>

        {/* Documents */}
        <div className="card-bg rounded-xl p-6 space-y-4">
          <h2 className="text-[1.25rem] font-medium text-[var(--text)]">
            Documents
          </h2>

          <p className="text-[1.05rem] text-[var(--muted)]">
            Store and access important family documents securely.
          </p>

          <Link
            to="/documents"
            className="text-sm font-medium text-[var(--accent)] hover:opacity-80"
          >
            Go to documents →
          </Link>
        </div>

        {/* Rituals */}
        <div className="card-bg rounded-xl p-6 space-y-4">
          <h2 className="text-[1.25rem] font-medium text-[var(--text)]">
            Rituals
          </h2>

          <p className="text-[1.05rem] text-[var(--muted)]">
            Capture traditions and meaningful recurring moments.
          </p>

          <Link
            to="/rituals"
            className="text-sm font-medium text-[var(--accent)] hover:opacity-80"
          >
            Explore rituals →
          </Link>
        </div>

      </section>
    </div>
  );
}
