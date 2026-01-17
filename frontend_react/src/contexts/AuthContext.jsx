import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refresh"),
    role: localStorage.getItem("role"),
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const response = await api.get("/auth/me/");
          setAuth(prev => ({
            ...prev,
            user: response.data,
          }));
        }
      } catch (err) {
        console.error("Auth init error:", err);
        localStorage.clear();
        setAuth({ access: null, refresh: null, role: null, user: null });
      } finally {
        setLoading(false);
      }
    };

    if (auth.access) {
      initAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      email: data.email,
      role: data.role,
    }));

    setAuth({
      access: data.access,
      refresh: data.refresh,
      role: data.role,
      user: {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
      },
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ access: null, refresh: null, role: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
