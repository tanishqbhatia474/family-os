import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";

export default function JoinFamily() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await http.post("/family/join", {
        inviteCode,
        personName
      });

      toast.success("Joined family", {
        description: "Please log in again to continue.",
      });

      // 🔑 JWT is stale after joining family
      localStorage.removeItem("token");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      toast.error("Failed to join family", {
        description:
          err.response?.data?.message || "Invalid invite code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 p-6 border rounded-lg"
      >
        <h1 className="text-xl font-semibold text-center">
          Join Family
        </h1>

        <input
          placeholder="Invite code"
          className="w-full border px-3 py-2 rounded"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />

        <input
          placeholder="Your full name"
          className="w-full border px-3 py-2 rounded"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />

        <button
          className="w-full bg-black text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Family"}
        </button>
      </form>
    </div>
  );
}
