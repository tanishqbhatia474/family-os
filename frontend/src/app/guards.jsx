import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

export const RequireFamily = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.familyId ? children : <Navigate to="/onboarding" />;
};
