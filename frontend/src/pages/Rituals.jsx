import { useEffect, useState } from "react";
import { listFamilyRituals, deleteRitual } from "../api/ritual.api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import CreateRitualModal from "../components/rituals/CreateRitualModal";
import EditRitualModal from "../components/rituals/EditRitualModal";
import RitualViewModal from "../components/rituals/RitualViewModal";

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
    <div className="relative z-10 space-y-10 mt-15">

      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-medium">Rituals</h1>
          <p className="text-sm opacity-70">
            Traditions and practices shared in your family
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            placeholder="Search rituals…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="control"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control"
          >
            <option value="recent">Recent</option>
            <option value="az">A–Z</option>
          </select>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#5A9684] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4C7F70]"
          >
            Add Ritual
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading rituals…</p>
      ) : (
        <>
          <Section title="My Rituals">
            {myRituals.length === 0 ? (
              <Empty text="You haven’t added any rituals yet." />
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

          <Section title="Shared With Me">
            {sharedRituals.length === 0 ? (
              <Empty text="No rituals shared with you." />
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
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function RitualCard({ ritual, isOwner, onView, onEdit, onDelete }) {
  return (
    <div className="card-bg border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="card-title text-[0.95rem] font-medium truncate">
          {ritual.title}
        </h3>

        <p className="text-sm opacity-80 line-clamp-3">
          {ritual.description}
        </p>

        <p className="card-meta text-xs mt-1">
          Added on {new Date(ritual.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onView} className="card-link text-sm">
          View
        </button>

        {isOwner && (
          <div className="flex gap-4">
            <button onClick={onEdit} className="card-link text-sm">
              Edit
            </button>
            <button onClick={onDelete} className="card-link delete text-sm">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm opacity-70">{text}</p>;
}
