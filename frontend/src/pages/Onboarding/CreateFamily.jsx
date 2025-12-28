import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import { toast } from "sonner";


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

      // Show success notification
      toast.success("Family created", {
        description: "Please log in again to continue.",
      });

      // IMPORTANT:
      // Family creation updates DB but JWT is now stale
      // Force user to re-login to get a fresh token
      localStorage.removeItem("token");

      // Small delay so user can read the toast
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      // Optional: error toast
      toast.error("Family creation failed", {
        description:
          err.response?.data?.message || "Please try again.",
      });

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 p-6 border rounded-lg"
      >
        <h1 className="text-xl font-semibold text-center">
          Create Family
        </h1>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <input
          placeholder="Family name"
          className="w-full border px-3 py-2 rounded"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          required
        />

        <input
          placeholder="Your full name"
          className="w-full border px-3 py-2 rounded"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />

        <button
          className="w-full bg-black text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Family"}
        </button>
      </form>
    </div>
  );
}
