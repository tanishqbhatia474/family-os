import { useState } from "react";
import { signup, login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import FluidBackground from "@/components/visual/FluidBackground";
import { motion } from "framer-motion";

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError("Password must contain both letters and numbers");
      return;
    }

    setLoading(true);

    try {
      await signup({ email, password });
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      await loadUser();
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <FluidBackground />

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[2.5rem] font-bold tracking-[-0.02em] text-[var(--text)] mb-3"
          >
            Begin your story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-[var(--muted)]"
          >
            Create a space for your family's memories
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
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
            backgroundColor: "color-mix(in srgb, var(--panel) 90%, transparent)",
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative p-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </motion.div>
          )}

          <div className="relative space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full rounded-xl px-4 py-3
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  placeholder:text-[var(--muted)]
                  text-base
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
                  focus:border-[var(--accent)]
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full rounded-xl px-4 py-3
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  placeholder:text-[var(--muted)]
                  text-base
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
                  focus:border-[var(--accent)]
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="
                  w-full rounded-xl px-4 py-3
                  border border-[var(--border)]
                  bg-[var(--bg)]
                  text-[var(--text)]
                  placeholder:text-[var(--muted)]
                  text-base
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20
                  focus:border-[var(--accent)]
                "
              />
            </div>
          </div>

          <div className="relative pt-2">
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              By creating an account, you agree to keep your family's story private and secure.
            </p>
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
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[color-mix(in_srgb,var(--panel)_90%,transparent)] text-[var(--muted)]">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="
              block text-center
              text-base font-medium text-[var(--accent)]
              hover:underline
              transition-all duration-200
            "
          >
            Log in →
          </Link>
        </motion.form>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link
            to="/about"
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Learn more about Family OS
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}