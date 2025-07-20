// components/Auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      const response = await fetch("/users.json");
      const users = await response.json();

      const validUser = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (validUser) {
        setIsAuthenticated(true);
        setUser(username);
        // Store in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", username);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  const value = { isAuthenticated, login, logout, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
