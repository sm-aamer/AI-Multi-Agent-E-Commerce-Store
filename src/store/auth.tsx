// Client-side session holder. In mock mode this is NOT real authentication.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@/types";
import { tokenStore } from "@/services/http";

const KEY = "trendora.session";
type Ctx = { session: Session | null; ready: boolean; signIn: (s: Session) => void; signOut: () => void };
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setSession(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, []);
  const signIn = (s: Session) => { setSession(s); localStorage.setItem(KEY, JSON.stringify(s)); tokenStore.set(s.token); };
  const signOut = () => { setSession(null); localStorage.removeItem(KEY); tokenStore.set(null); };
  return <AuthContext.Provider value={{ session, ready, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
