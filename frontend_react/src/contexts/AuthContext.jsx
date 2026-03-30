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

  const fetchCurrentUser = async (roleOverride = localStorage.getItem("role")) => {
    const response = await api.get("/auth/me/");
    let userData = response.data;

    if (roleOverride === "student") {
      try {
        const studentRes = await api.get("/students/me/");
        userData = { ...userData, ...studentRes.data };
      } catch (err) {
        console.error("Failed to fetch student details:", err);
      }
    }

    if (roleOverride === "company") {
      try {
        const companyRes = await api.get("/companies/me/");
        userData = { ...userData, ...companyRes.data };
      } catch (err) {
        console.error("Failed to fetch company details:", err);
      }
    }

    localStorage.setItem("user", JSON.stringify(userData));
    setAuth((prev) => ({
      ...prev,
      user: userData,
    }));
    return userData;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          await fetchCurrentUser(localStorage.getItem("role"));
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

  const login = async (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("role", data.role);
    setAuth({
      access: data.access,
      refresh: data.refresh,
      role: data.role,
      user: null,
    });

    await fetchCurrentUser(data.role);
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ access: null, refresh: null, role: null, user: null });
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ auth, loading, error, login, logout, refreshUser: fetchCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
