import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../Utils/api"; // 1. Import your central api client

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // 2. Use 'api' and a relative path. 'withCredentials' is now handled automatically.
        const res = await api.get("/auth/me");

        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.log("No valid session found. Logging out.");
        setUser(null);
        sessionStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // 3. Use 'api' for the logout request
      await api.post("/auth/logout", {});
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      sessionStorage.removeItem("user");
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
