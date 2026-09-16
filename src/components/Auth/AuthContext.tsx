import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "../../api/supabase";
interface AuthContextType {
 isAuthenticated: boolean;
 loading: boolean;
 error: string;
 login: (email: string, password: string) => Promise<boolean>;
 signup: (email: string, password: string) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>;
 logout: () => Promise<void>;
 user: string | null;
 userId: string | null;
 role: "user" | "admin";
 isAdmin: boolean;
}
const AuthContext = createContext<AuthContextType>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
 const [account, setAccount] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 useEffect(() => {
  let active = true;
  try {
   const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    setAccount(session?.user ?? null); setLoading(false);
   });
   return () => { active = false; subscription.unsubscribe(); };
  } catch (err) { setError(err instanceof Error ? err.message : "Unable to connect to Supabase."); setLoading(false); }
 }, []);
 const login = async (email: string, password: string) => {
  setError("");
  try {
   const { data, error: authError } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
   if (authError) throw authError;
   setAccount(data.user); return true;
  } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); return false; }
 };
 const signup = async (email: string, password: string) => {
  setError("");
  try {
   const { data, error: authError } = await getSupabase().auth.signUp({ email: email.trim(), password });
   if (authError) throw authError;
   setAccount(data.session?.user ?? null);
   return { success: true, needsConfirmation: !data.session, message: !data.session ? "Check your email to confirm your account, then sign in." : undefined };
  } catch (err) { return { success: false, message: err instanceof Error ? err.message : "Unable to create account." }; }
 };
 const logout = async () => {
  const { error: authError } = await getSupabase().auth.signOut();
  if (authError) { setError(authError.message); throw authError; }
  setAccount(null);
  for (const key of ["isAuthenticated", "user", "role", "ytui_active_mode"]) localStorage.removeItem(key);
 };
 const role = account?.app_metadata?.role === "admin" ? "admin" : "user";
 return <AuthContext.Provider value={{ isAuthenticated: !!account, loading, error, login, signup, logout, user: account?.email ?? null, userId: account?.id ?? null, role, isAdmin: role === "admin" }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
