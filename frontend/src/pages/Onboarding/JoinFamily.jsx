import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";
import FluidBackground from "@/components/visual/FluidBackground";

export default function JoinFamily() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [personName, setPersonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await http.post("/family/join", {
        inviteCode,
        personName,
        birthDate,
        gender
      });

      toast.success("Joined family", {
        description: "Please log in again to continue."
      });

      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error("Failed to join family", {
        description: err.response?.data?.message || "Invalid invite code"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <FluidBackground />

      <form
        onSubmit={handleSubmit}
        className="
          relative z-10 w-full max-w-sm
          bg-white/70 backdrop-blur-md
          rounded-xl px-8 py-10
          shadow-lg shadow-black/5
          space-y-6
        "
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">
            Join Family
          </h1>
          <p className="text-sm text-neutral-600">
            Enter your invite code
          </p>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80 text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
          />

          <input
            placeholder="Your full name"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80 text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
          />

          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80 text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80 text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="
            w-full rounded-md py-2 text-sm font-medium
            bg-[#1F3D34] text-white
            hover:bg-[#183128]
            transition-colors
            disabled:opacity-60
          "
        >
          {loading ? "Joining..." : "Join Family"}
        </button>
      </form>
    </div>
  );
}
