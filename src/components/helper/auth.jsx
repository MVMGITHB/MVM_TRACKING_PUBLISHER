// components/helper/auth.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../baseurl/baseurl";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new state

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const rawToken = localStorage.getItem("token");

      if (rawUser && rawUser !== "undefined") {
        setUser(JSON.parse(rawUser));
      } else {
        localStorage.removeItem("user");
      }

      if (rawToken && rawToken !== "undefined") {
        setToken(rawToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${rawToken}`;
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Failed to load auth from storage", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false); // ✅ mark as finished
    }
  }, []);

  const login = (userData, jwt) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    if (jwt) {
      setToken(jwt);
      localStorage.setItem("token", jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
