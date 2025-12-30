import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";
import FluidBackground from "@/components/visual/FluidBackground";

export default function CreateFamily() {
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState("");
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await http.post("/family", { familyName, personName });

      toast.success("Family created", {
        description: "Please log in again to continue.",
      });

      localStorage.removeItem("token");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error("Family creation failed", {
        description:
          err.response?.data?.message || "Please try again.",
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
            Create Family
          </h1>
          <p className="text-sm text-neutral-600">
            Start a new family space
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <input
            placeholder="Family name"
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />

          <input
            placeholder="Your full name"
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
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
          {loading ? "Creating..." : "Create Family"}
        </button>
      </form>
    </div>
  );
}
