import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";
import FluidBackground from "@/components/visual/FluidBackground";

export default function CreateFamily() {
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState("");
  const [personName, setPersonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!familyName.trim()) {
      toast.error("Family name is required");
      return;
    }
    if (!personName.trim()) {
      toast.error("Your full name is required");
      return;
    }
    if (!birthDate) {
      toast.error("Birth date is required");
      return;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return;
    }

    setLoading(true);

    try {
      await http.post("/family", {
        familyName,
        personName,
        birthDate,
        gender
      });

      toast.success("Family created", {
        description: "Please log in again to continue."
      });

      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error("Family creation failed", {
        description: err.response?.data?.message || "Please try again."
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
          backdrop-blur-md
          rounded-xl px-8 py-10
          shadow-lg shadow-black/5
          space-y-6
        "
        style={{ backgroundColor: "var(--panel)", color: "var(--text)" }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">
            Create Family
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Start a new family space
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              placeholder: "Family name",
              value: familyName,
              onChange: setFamilyName,
              type: "text"
            },
            {
              placeholder: "Your full name",
              value: personName,
              onChange: setPersonName,
              type: "text"
            }
          ].map((field, i) => (
            <input
              key={i}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              required
              className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)"
              }}
            />
          ))}

          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)"
            }}
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)"
            }}
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
          className="w-full rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)", color: "white" }}
        >
          {loading ? "Creating..." : "Create Family"}
        </button>
      </form>
    </div>
  );
}
