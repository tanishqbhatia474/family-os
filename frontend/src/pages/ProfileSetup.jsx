import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import FluidBackground from "@/components/visual/FluidBackground";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await http.patch("/user/profile", {
        fullName,
        gender,
        birthDate
      });

      navigate("/onboarding");
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
          shadow-lg space-y-6
        "
      >
        <h1 className="text-2xl font-medium text-center">
          Tell us about you
        </h1>

        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-md px-3 py-2 border bg-white/80"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Gender</p>
          <div className="flex gap-4 text-sm">
            {["male", "female", "other"].map(g => (
              <label key={g} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-md px-3 py-2 border bg-white/80"
        />

        <button
          disabled={loading}
          className="w-full bg-[#1F3D34] text-white py-2 rounded-md"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
