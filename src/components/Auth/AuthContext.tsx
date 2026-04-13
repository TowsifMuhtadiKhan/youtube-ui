// components/Auth/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const API_BASE =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [user, setUser] = useState<string | null>(() => {
    // Initialize from localStorage
    return localStorage.getItem("user") || null;
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { user?: { username: string } };
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user.username);
        // Store in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", data.user.username);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        return { success: false, message: data.error || "Signup failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, message: "Unable to create account" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  const value = { isAuthenticated, login, signup, logout, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
