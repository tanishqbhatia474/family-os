import { useState } from "react";
import { signup, login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import FluidBackground from "@/components/visual/FluidBackground";

export default function Signup() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Signup
      await signup({ email, password });

      // 2️⃣ Auto-login
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);

      // 3️⃣ Load user
      await loadUser();

      // 4️⃣ Go to onboarding
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <FluidBackground />

      {/* Signup panel */}
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
            Sign up
          </h1>
          <p className="text-sm text-neutral-600">
            Create your family space
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="
              w-full rounded-md px-3 py-2
              border border-neutral-300
              bg-white/80
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-[#1F3D34]/30
            "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full rounded-md py-2 text-sm font-medium
            bg-[#1F3D34] text-white
            hover:bg-[#183128]
            transition-colors
            disabled:opacity-60
          "
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center text-neutral-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1F3D34] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
