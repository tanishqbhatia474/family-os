import FluidBackground from "@/components/visual/FluidBackground";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="relative">
      {/* Hero background */}

      {/* Hero content */}
      <section className="relative z-10 max-w-[680px] px-6 pt-32 pb-24 mx-auto">
        <h1 className="text-[3.25rem] leading-[1.05] font-medium tracking-tight mb-6">
          Welcome
        </h1>

        <p className="text-[1.125rem] leading-relaxed text-neutral-700 mb-6">
          This is your family’s private space for preserving relationships,
          important records, and shared traditions over time.
        </p>

        <p className="text-[1rem] leading-relaxed text-neutral-500 italic max-w-md">
          Built to grow quietly with your family — not to rush it.
        </p>
      </section>

      {/* Main content */}
      <section className="max-w-[680px] mx-auto px-6 space-y-20 pb-32">
        <div className="space-y-4">
          <h2 className="text-[1.25rem] font-medium">Family Tree</h2>
          <p className="text-[1.125rem] text-neutral-600">
            View and manage your family structure, relationships, and lineage
            in one place.
          </p>
          <Link
            to="/family-tree"
            className="text-sm font-medium underline underline-offset-4"
          >
            View family tree
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-[1.25rem] font-medium">Documents</h2>
          <p className="text-[1.125rem] text-neutral-600">
            Store and access important family documents securely.
          </p>
          <Link
            to="/documents"
            className="text-sm font-medium underline underline-offset-4"
          >
            Go to documents
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-[1.25rem] font-medium">Rituals</h2>
          <p className="text-[1.125rem] text-neutral-600">
            Capture traditions and meaningful recurring moments.
          </p>
          <Link
            to="/rituals"
            className="text-sm font-medium underline underline-offset-4"
          >
            Explore rituals
          </Link>
        </div>
      </section>
    </div>
  );
}
