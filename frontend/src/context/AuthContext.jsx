import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
