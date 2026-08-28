import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAdmin, fetchMe } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("amri_admin_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchMe();
        setAdmin(res.data);
      } catch {
        localStorage.removeItem("amri_admin_token");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginAdmin(email, password);
    localStorage.setItem("amri_admin_token", res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("amri_admin_token");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, isAuthenticated: !!admin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};