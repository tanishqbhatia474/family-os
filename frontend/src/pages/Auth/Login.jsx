import { useState } from "react";
import { login } from "../../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FluidBackground from "@/components/visual/FluidBackground";

export default function Login() {
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      await loadUser();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
            Log in
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Welcome back to your family space
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full rounded-md py-2 text-sm font-medium
            transition-colors disabled:opacity-60
          "
          style={{
            backgroundColor: "var(--accent)",
            color: "white"
          }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
