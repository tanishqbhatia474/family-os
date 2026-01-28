import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { getFamilyPersons } from "../api/person.api";
import { getFamilyDetails } from "../api/family.api";
import { useAuth } from "../context/AuthContext";

import AddPerson from "../pages/FamilyTree/AddPerson";
import PersonProfileModal from "../components/family-tree/PersonProfileModal";
import SvgFamilyTree from "../components/family-tree/SvgFamilyTree";
import TreeControls from "../components/family-tree/TreeControls";

import { buildFamilyTree } from "../components/family-tree/treeBuilder";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


/* ================= Animations ================= */

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }
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
  const { user } = useAuth();

  const [people, setPeople] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showHelp, setShowHelp] = useState(false);


  const transformRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);

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
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const el = canvasRef.current;

    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setCanvasReady(true);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------------- Build tree ---------------- */

  const ownerPersonId = user?.personId;

  const rootFamily = useMemo(() => {
    if (!people.length || !ownerPersonId) return null;
    return buildFamilyTree(people, ownerPersonId);
  }, [people, ownerPersonId]);

  
  /* ---------------- Core Centering Logic ---------------- */

  /**
   * Centers the view on a specific person's node
   */
  function centerOnPerson(personId, customScale) {
    if (!transformRef.current) return;
    
    setTimeout(() => {
      const personElement = document.querySelector(`[data-person-id="${personId}"]`);
      const svg = document.querySelector('.tree-canvas svg');
      
      if (!personElement || !svg) {
        console.warn('Person element or SVG not found');
        return;
      }

      try {
        const bbox = personElement.getBBox();
        const state = transformRef.current.instance.transformState;
        const scale = customScale !== undefined ? customScale : state.scale;

        const wrapper = transformRef.current.instance.wrapperComponent;
        if (!wrapper) return;
        
        const vw = wrapper.offsetWidth;
        const vh = wrapper.offsetHeight;

        // Calculate the center of the person node in SVG coordinate space
        const nodeCenterX = bbox.x + bbox.width / 2;
        const nodeCenterY = bbox.y + bbox.height / 2;

        // Position so node center aligns with viewport center
        const targetX = (vw / 2) - (nodeCenterX * scale);
        const targetY = (vh / 2) - (nodeCenterY * scale);

        transformRef.current.setTransform(targetX, targetY, scale, 500);
      } catch (err) {
        console.error('Error centering on person:', err);
      }
    }, 150);
  }

  /* ---------------- Controls ---------------- */


function handleFitScreen() {
  const api = transformRef.current;
  if (!api) return;

  api.resetTransform(400);
}

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

        {/* The Tree Canvas */}
        <motion.section
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.4 }}
          className="w-full relative"
        >
          <div
            ref={canvasRef}
            className="tree-canvas relative w-full h-[calc(100vh-220px)] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg)] shadow-inner"
          >
            {rootFamily && canvasReady ? (
              <TransformWrapper
                ref={transformRef}
                limitToBounds={false}
                centerOnInit={false}
                minScale={0.1}
                maxScale={3}
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                wheel={{ step: 0.1 }}
                panning={{ velocityDisabled: true }}
                doubleClick={{ disabled: false, mode: "zoomIn", step: 0.3 }}
                style={{ width: "100%", height: "100%" }}
              >
                <TransformComponent
                  wrapperClass="w-full h-full"
                  contentStyle={{ width: "100%", height: "100%" }}
                >
                  <SvgFamilyTree
                    rootFamily={rootFamily}
                    onSelectPerson={setSelectedPerson}
                    currentPersonId={ownerPersonId}
                  />
                </TransformComponent>
              </TransformWrapper>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-[var(--muted)]">Loading family tree...</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Profile Modal */}
        {selectedPerson && (
          <PersonProfileModal
            person={selectedPerson}
            personMap={Object.fromEntries(people.map(p => [p._id, p]))}
            people={people}
            onClose={() => setSelectedPerson(null)}
            onSaved={fetchAll}
          />
        )}
      </div>

      {/* Control Overlay */}
      {rootFamily && (
        <TreeControls
          // onCenterMe={handleCenterMe}
          onFitScreen={handleFitScreen}
        />
      )}
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