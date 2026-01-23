import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";
import FluidBackground from "@/components/visual/FluidBackground";
import { motion } from "framer-motion";

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
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <FluidBackground />

      {/* Decorative glow */}
      <div className="absolute top-16 right-16 w-32 h-32 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />
      <div className="absolute bottom-24 left-24 w-40 h-40 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[2.5rem] font-bold tracking-[-0.02em] text-[var(--text)] mb-3">
            Create your family
          </h1>
          <p className="text-base text-[var(--muted)]">
            Start a private space for your family’s story
          </p>
        </div>

        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="
            relative
            backdrop-blur-xl
            rounded-3xl
            px-8 py-10
            border border-[var(--border)]
            shadow-2xl
            space-y-6
          "
          style={{
            backgroundColor: "color-mix(in srgb, var(--panel) 90%, transparent)"
          }}
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          <div className="relative space-y-4">
            <Field
              label="Family name"
              value={familyName}
              onChange={setFamilyName}
              placeholder="e.g. Sharma Family"
            />

            <Field
              label="Your full name"
              value={personName}
              onChange={setPersonName}
              placeholder="Your name"
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Birth date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="
                  w-full rounded-xl px-4 py-3
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
                  focus:border-[var(--accent)]
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="
                  w-full rounded-xl px-4 py-3
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
                  focus:border-[var(--accent)]
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              relative w-full rounded-xl py-3.5 px-6
              text-base font-semibold
              bg-[var(--accent)] text-white
              transition-all duration-200
              hover:opacity-90 hover:shadow-lg
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2
            "
          >
            {loading ? "Creating family…" : "Create family"}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

/* ---------- helper ---------- */

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)] mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="
          w-full rounded-xl px-4 py-3
          border border-[var(--border)]
          bg-[var(--bg)]
          text-[var(--text)]
          placeholder:text-[var(--muted)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
          focus:border-[var(--accent)]
        "
      />
    </div>
  );
}
