import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listFamilyRituals, deleteRitual } from "../api/ritual.api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import CreateRitualModal from "../components/rituals/CreateRitualModal";
import EditRitualModal from "../components/rituals/EditRitualModal";
import RitualViewModal from "../components/rituals/RitualViewModal";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function Rituals() {
  const { user } = useAuth();

  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [showCreate, setShowCreate] = useState(false);
  const [editingRitual, setEditingRitual] = useState(null);
  const [viewingRitual, setViewingRitual] = useState(null);

  /* ---------- FETCH ---------- */

  const fetchRituals = async () => {
    try {
      setLoading(true);
      const res = await listFamilyRituals();
      setRituals(res.data);
    } catch {
      toast.error("Failed to load rituals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRituals();
  }, []);

  /* ---------- DELETE ---------- */

  const handleDelete = async (id) => {
    if (!confirm("Delete this ritual permanently?")) return;

    try {
      await deleteRitual(id);
      toast.success("Ritual deleted");
      fetchRituals();
    } catch {
      toast.error("Failed to delete ritual");
    }
  };

  /* ---------- SPLIT ---------- */

  const myRitualsRaw = rituals.filter(
    r => String(r.ownerPersonId) === String(user.personId)
  );

  const sharedRitualsRaw = rituals.filter(
    r => String(r.ownerPersonId) !== String(user.personId)
  );

  /* ---------- SEARCH ---------- */

  const matchesSearch = (r) =>
    (r.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  /* ---------- SORT ---------- */

  const sortRituals = (list) => {
    const sorted = [...list];
    if (sortBy === "az") {
      sorted.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return sorted;
  };

  const myRituals = sortRituals(myRitualsRaw.filter(matchesSearch));
  const sharedRituals = sortRituals(sharedRitualsRaw.filter(matchesSearch));

  /* ---------- UI ---------- */

  return (
    <div className="relative min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-24 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] shadow-lg mb-3 sm:mb-4">
              <ContinuumIcon size="md" />
            </div>

            <h1 className="text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-[var(--text)]">
              Capture family{" "}
              <span className="text-[var(--accent)]">rituals</span>
            </h1>

            <p className="text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-[var(--muted)] max-w-2xl">
              Record the moments that repeat — celebrations, habits, and traditions that shape your family over generations.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 rounded-2xl bg-transparent p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <input
              placeholder="Search rituals…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 bg-[var(--accent)] text-white placeholder:text-white/70 border-transparent focus:border-white focus:ring-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              style={{ colorScheme: 'dark' }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--accent)] text-white border-transparent focus:border-white focus:ring-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              style={{ colorScheme: 'dark' }}
            >
              <option value="recent">Recent</option>
              <option value="az">A–Z</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--accent)] text-white rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-all hover:gap-3 shadow-lg whitespace-nowrap"
          >
            Add Ritual
          </button>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 sm:py-20"
          >
            <div className="inline-flex items-center gap-3 text-[var(--muted)]">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Loading rituals…</span>
            </div>
          </motion.div>
        ) : (
          <>
            <Section title="My Rituals" count={myRituals.length}>
              {myRituals.length === 0 ? (
                <Empty 
                  icon={<ContinuumIcon size="lg" faded invert/>}
                  title="No rituals yet"
                  text="Create your first family ritual to start capturing traditions."
                  action={
                    <button
                      onClick={() => setShowCreate(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--border)] rounded-full font-medium text-sm text-[var(--text)] hover:border-[var(--accent)] transition-all mt-4"
                    >
                      <span>Add Ritual</span>
                      <span className="text-lg">→</span>
                    </button>
                  }
                />
              ) : (
                <Grid>
                  {myRituals.map(r => (
                    <RitualCard
                      key={r._id}
                      ritual={r}
                      isOwner
                      onView={() => setViewingRitual(r)}
                      onEdit={() => setEditingRitual(r)}
                      onDelete={() => handleDelete(r._id)}
                    />
                  ))}
                </Grid>
              )}
            </Section>

            <Section title="Shared With Me" count={sharedRituals.length}>
              {sharedRituals.length === 0 ? (
                <Empty 
                  icon="🤝"
                  title="No shared rituals"
                  text="Rituals shared by family members will appear here."
                />
              ) : (
                <Grid>
                  {sharedRituals.map(r => (
                    <RitualCard
                      key={r._id}
                      ritual={r}
                      onView={() => setViewingRitual(r)}
                    />
                  ))}
                </Grid>
              )}
            </Section>
          </>
        )}

        {showCreate && (
          <CreateRitualModal
            onClose={() => setShowCreate(false)}
            onCreated={fetchRituals}
          />
        )}

        {editingRitual && (
          <EditRitualModal
            ritual={editingRitual}
            onClose={() => setEditingRitual(null)}
            onSaved={fetchRituals}
          />
        )}

        {viewingRitual && (
          <RitualViewModal
            ritual={viewingRitual}
            onClose={() => setViewingRitual(null)}
            onDeleted={fetchRituals}
            onEdit={() => {
              setEditingRitual(viewingRitual);
              setViewingRitual(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, count, children }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-50px" }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-[var(--text)]">
          {title}
        </h2>
        <span className="inline-flex items-center justify-center min-w-[1.75rem] sm:min-w-[2rem] h-7 sm:h-8 px-2 sm:px-3 rounded-full bg-[var(--accent)] text-white text-xs sm:text-sm font-bold">
          {count}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function Grid({ children }) {
  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      {children}
    </motion.div>
  );
}

function RitualCard({ ritual, isOwner, onView, onEdit, onDelete }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-[var(--accent)] hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,transparent)] shadow-md flex items-center justify-center">
          <ContinuumIcon size="sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-[1.0625rem] font-semibold text-[var(--text)] mb-1.5 sm:mb-2 line-clamp-1">
            {ritual.title}
          </h3>
          <p className="text-sm sm:text-[0.9375rem] text-[var(--muted)] line-clamp-2 leading-relaxed mb-1.5 sm:mb-2">
            {ritual.description}
          </p>
          <p className="text-xs sm:text-[0.8125rem] text-[var(--muted)]">
            {new Date(ritual.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-2 border-t border-[var(--border)]">
        <button 
          onClick={onView} 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] hover:gap-2 transition-all group/btn"
        >
          <span>View</span>
          <span className="text-sm sm:text-base group-hover/btn:translate-x-0.5 transition-transform">→</span>
        </button>

        {isOwner && (
          <>
            <button 
              onClick={onEdit} 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] hover:gap-2 transition-all group/btn"
            >
              <span>Edit</span>
            </button>
            
            <button
              onClick={onDelete}
              className="ml-auto text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function Empty({ icon, title, text, action }) {
  return (
    <motion.div
      variants={fadeUp}
      className="text-center py-12 sm:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_40%,transparent)]"
    >
      {typeof icon === 'string' ? (
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-40">{icon}</div>
      ) : (
        <div className="mb-3 sm:mb-4 flex justify-center">{icon}</div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-[var(--muted)] max-w-md mx-auto">{text}</p>
      {action}
    </motion.div>
  );
}


function ContinuumIcon({ size = "md", faded, invert = false }) {
  const sizes = { 
    sm: "w-6 h-6 sm:w-7 sm:h-7", 
    md: "w-8 h-8 sm:w-10 sm:h-10", 
    lg: "w-12 h-12 sm:w-16 sm:h-16" 
  };

  return (
    <>
      <img
        src={invert ? "/illustrations/ContinuumDark.png" : "/illustrations/ContinuumLight.png"}
        className={`illustration light-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Continuum"
      />
      <img
        src={invert ? "/illustrations/ContinuumLight.png" : "/illustrations/ContinuumDark.png"}
        className={`illustration dark-only ${sizes[size]} ${faded ? "opacity-40" : ""}`}
        draggable={false}
        alt="Continuum"
      />
    </>
  );
}