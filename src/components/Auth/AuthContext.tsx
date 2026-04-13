// components/Auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    password: string,
    role?: "user" | "admin",
    adminCode?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  user: string | null;
  role: "user" | "admin";
  isAdmin: boolean;
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
  const [role, setRole] = useState<"user" | "admin">(() => {
    const stored = localStorage.getItem("role");
    return stored === "admin" ? "admin" : "user";
  });

  useEffect(() => {
    const syncUserRole = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/auth/user?username=${encodeURIComponent(user)}`,
        );
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          user?: { role?: "user" | "admin"; username?: string };
        };

        if (data.user?.role) {
          const nextRole = data.user.role === "admin" ? "admin" : "user";
          setRole(nextRole);
          localStorage.setItem("role", nextRole);
        }

        if (data.user?.username) {
          setUser(data.user.username);
          localStorage.setItem("user", data.user.username);
        }
      } catch {
        // Keep existing local values if sync fails.
      }
    };

    void syncUserRole();
  }, [API_BASE, isAuthenticated, user]);

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

      const data = (await response.json()) as {
        user?: { username: string; role?: "user" | "admin" };
      };
      if (data.user) {
        const nextRole = data.user.role === "admin" ? "admin" : "user";
        setIsAuthenticated(true);
        setUser(data.user.username);
        setRole(nextRole);
        // Store in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", data.user.username);
        localStorage.setItem("role", nextRole);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (
    username: string,
    password: string,
    signupRole: "user" | "admin" = "user",
    adminCode?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: signupRole, adminCode }),
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
    setRole("user");
    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  const value = {
    isAuthenticated,
    login,
    signup,
    logout,
    user,
    role,
    isAdmin: role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
