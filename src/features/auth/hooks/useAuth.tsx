"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types/user";
import { login as loginRequest } from "@/features/auth/api/authClient";

const STORAGE_KEY = "schedula.auth";
type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type StoredSession = { user: User; token: string };

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Reading localStorage is synchronous, but we defer the resulting state
    // update by a microtask so it isn't a same-tick setState-in-effect call.
    Promise.resolve().then(() => {
      if (cancelled) return;
      let restoredUser: User | null = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const session = raw ? (JSON.parse(raw) as StoredSession) : null;
        restoredUser = session?.user ?? null;
      } catch {
        restoredUser = null;
      }
      setUser(restoredUser);
      setStatus(restoredUser ? "authenticated" : "unauthenticated");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await loginRequest(email, password);
      const session: StoredSession = { user: result.user, token: result.token };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(result.user);
      setStatus("authenticated");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, error, login, logout }),
    [user, status, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
