import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getFamilyPersons } from "../api/person.api";
import { getFamilyDetails } from "../api/family.api";

import AddPerson from "../pages/FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";
import SvgFamilyTree from "../components/family-tree/SvgFamilyTree";

import { buildFamilyTree } from "../components/family-tree/treeBuilder";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function FamilyTree() {
  const [people, setPeople] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  /* ---------------- Fetch ---------------- */

  async function fetchAll() {
    try {
      const [peopleRes, familyRes] = await Promise.all([
        getFamilyPersons(),
        getFamilyDetails()
      ]);

      setPeople(Array.isArray(peopleRes.data) ? peopleRes.data : []);
      setInviteCode(familyRes.data?.inviteCode ?? null);
      setIsOwner(familyRes.data?.isOwner === true);
    } catch (err) {
      console.error("Failed to fetch family data", err);
      setPeople([]);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  /* ---------------- Build recursive tree ---------------- */

  const rootFamily = useMemo(
    () => buildFamilyTree(people),
    [people]
  );

  /* ---------------- Render ---------------- */

  return (
    <div className="relative min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center max-w-4xl mx-auto space-y-6"
          >
            <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-[var(--text)]">
              Your family,{" "}
              <span className="text-[var(--accent)]">mapped</span>
            </h1>

            <p className="text-[clamp(1.0625rem,2vw,1.25rem)] leading-relaxed text-[var(--muted)] max-w-2xl mx-auto">
              A shared, visual record of how generations connect — from ancestors to children, and everyone in between.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Add Person Section - Centered Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_85%,transparent)] p-8 md:p-10 space-y-6">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] shadow-lg mb-4">
              <GenesisIcon size="lg" />
            </div>
              
              <h2 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
                {isOwner ? "Grow your family tree" : "Explore your family tree"}
              </h2>

              <p className="text-[1rem] text-[var(--muted)] max-w-lg mx-auto">
                {isOwner ? (
                  <>
                    Add people and relationships as your family grows. You can return and
                    update this over time — nothing here needs to be complete.
                  </>
                ) : (
                  <>
                    View your family’s structure and history. Editing and adding members
                    is managed by the family owner.
                  </>
                )}
              </p>
            </div>

            <AddPerson
              inviteCode={inviteCode}
              onPersonAdded={fetchAll}
            />
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          variants={staggerChildren}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto space-y-12"
        >
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
              How this family tree works
            </h2>

            <p className="text-[1.0625rem] leading-relaxed text-[var(--muted)] max-w-2xl mx-auto">
              This view shows how people are connected across time — partners, siblings, parents, and children — so relationships stay clear even as families grow.
            </p>
          </motion.div>

          {/* Visual Guide Grid */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { icon: "●", label: "Each card represents one person" },
              { icon: "● ●", label: "Partners appear side-by-side" },
              { icon: "│", label: "Children flow downward from parents" },
              { icon: "— —", label: "Siblings align on the same level" }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_60%,transparent)] hover:border-[var(--accent)] transition-all"
              >
                <div className="text-2xl font-mono text-[var(--accent)] leading-none">
                  {item.icon}
                </div>
                <p className="text-[1rem] text-[var(--text)] font-medium pt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Illustration */}
          <motion.div variants={fadeUp} className="mx-auto max-w-4xl opacity-90">
            <div className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_50%,transparent)] p-8">
              <img
                src="/illustrations/family-growth-light.png"
                alt="Family lineage illustration"
                className="light-only mx-auto w-full"
              />
              <img
                src="/illustrations/family-growth-dark.png"
                alt="Family lineage illustration"
                className="dark-only mx-auto w-full"
              />
            </div>
          </motion.div>

          {/* Help Toggle */}
          <motion.div variants={fadeUp} className="text-center">
            <button
              onClick={() => setShowHelp(v => !v)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--border)] font-medium text-[var(--text)] hover:border-[var(--accent)] transition-all group"
            >
              <span className="text-xl">{showHelp ? "📖" : "💡"}</span>
              {showHelp ? "Hide reading guide" : "How to read this tree"}
            </button>

            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_85%,transparent)] px-8 py-6 text-left max-w-2xl mx-auto"
              >
                <p className="font-semibold text-[var(--text)] mb-4 text-lg">
                  Understanding the layout
                </p>

                <ul className="space-y-2.5 text-[var(--muted)]">
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold shrink-0">→</span>
                    <span>Each card represents one person</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold shrink-0">→</span>
                    <span>Partners appear side-by-side</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold shrink-0">→</span>
                    <span>Children flow downward from parents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold shrink-0">→</span>
                    <span>Siblings align on the same level</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-bold shrink-0">→</span>
                    <span>Expand or collapse branches to explore</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </motion.section>

        {/* Tree Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="w-full"
        >
          <div className="tree-canvas w-full overflow-auto p-8 md:p-12">
            <SvgFamilyTree
              rootFamily={rootFamily}
              onSelectPerson={setSelectedPerson}
            />
          </div>
        </motion.section>

        {/* Person Profile */}
        {selectedPerson && (
          <PersonProfileModal
            person={selectedPerson}
            personMap={Object.fromEntries(
              people.map(p => [p._id, p])
            )}
            people={people}
            onClose={() => setSelectedPerson(null)}
            onSaved={fetchAll}
          />
        )}
      </div>
    </div>
  );
}

function GenesisIcon({ size = "md", faded, invert = false }) {
  const sizes = { sm: "w-7 h-7", md: "w-10 h-10", lg: "w-16 h-16" };

  return (
    <>
      <img
        src={invert ? "/illustrations/GenesisDark.png" : "/illustrations/GenesisLight.png"}
        className={`illustration light-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Genesis"
      />
      <img
        src={invert ? "/illustrations/GenesisLight.png" : "/illustrations/GenesisDark.png"}
        className={`illustration dark-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Genesis"
      />
    </>
  );
}
