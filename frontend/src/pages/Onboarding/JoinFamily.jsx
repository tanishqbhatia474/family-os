import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";
import FluidBackground from "@/components/visual/FluidBackground";
import { motion } from "framer-motion";

export default function JoinFamily() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [personName, setPersonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- inline errors ---------- */
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!inviteCode.trim()) {
      newErrors.inviteCode = "Invite code is required";
    }

    if (!personName.trim()) {
      newErrors.personName = "Your full name is required";
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
      toast.error("Unable to join family", {
        description:
          "Either the invite code is incorrect, or this family member is already linked to another account."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <FluidBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-[2.5rem] font-bold text-[var(--text)] mb-3">
            Join your family
          </h1>
          <p className="text-base text-[var(--muted)]">
            Enter the invite code to become part of an existing family
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          noValidate
          className="
            backdrop-blur-xl rounded-3xl px-8 py-10
            border border-[var(--border)] shadow-2xl space-y-6
          "
          style={{
            backgroundColor: "color-mix(in srgb, var(--panel) 90%, transparent)"
          }}
        >
          {/* Invite Code */}
          <Field
            label="Invite code"
            value={inviteCode}
            onChange={(v) => {
              setInviteCode(v);
              setErrors((e) => ({ ...e, inviteCode: "" }));
            }}
            placeholder="e.g. FAM-8KQ2"
            error={errors.inviteCode}
          />

          {/* Full Name */}
          <Field
            label="Your full name"
            value={personName}
            onChange={(v) => {
              setPersonName(v);
              setErrors((e) => ({ ...e, personName: "" }));
            }}
            placeholder="Your name"
            error={errors.personName}
          />

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Birth date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setErrors((er) => ({ ...er, birthDate: "" }));
              }}
              className="w-full rounded-xl px-4 py-3 border"
            />
            {errors.birthDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setErrors((er) => ({ ...er, gender: "" }));
              }}
              className="w-full rounded-xl px-4 py-3 border"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">
                {errors.gender}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 font-semibold bg-[var(--accent)] text-white"
          >
            {loading ? "Joining family…" : "Join family"}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

/* ---------- Field helper ---------- */
function Field({ label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 border"
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}