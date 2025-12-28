import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.familyId) {
    return <Navigate to="/onboarding" />;
  }

  return <Navigate to="/dashboard" />;
}
