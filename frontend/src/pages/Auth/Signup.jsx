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
            Sign up
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Create your family space
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {[
            { value: email, set: setEmail, placeholder: "Email", type: "email" },
            { value: password, set: setPassword, placeholder: "Password", type: "password" },
            { value: confirmPassword, set: setConfirmPassword, placeholder: "Confirm password", type: "password" }
          ].map((field, idx) => (
            <input
              key={idx}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              required
              className="w-full rounded-md px-3 py-2 border bg-transparent text-sm focus:outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)", color: "white" }}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
