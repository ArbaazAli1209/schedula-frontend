"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DoctorAccount } from "@/types/doctorAccount";
import { loginDoctor } from "@/features/doctor-portal/api/doctorAuthClient";

const STORAGE_KEY = "schedula.doctorAuth";
type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type StoredSession = { doctor: DoctorAccount; token: string };

type DoctorAuthContextValue = {
  doctor: DoctorAccount | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const DoctorAuthContext = createContext<DoctorAuthContextValue | null>(null);

export function DoctorAuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorAccount | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Reading localStorage is synchronous, but we defer the resulting state
    // update by a microtask so it isn't a same-tick setState-in-effect call.
    Promise.resolve().then(() => {
      if (cancelled) return;
      let restoredDoctor: DoctorAccount | null = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const session = raw ? (JSON.parse(raw) as StoredSession) : null;
        restoredDoctor = session?.doctor ?? null;
      } catch {
        restoredDoctor = null;
      }
      setDoctor(restoredDoctor);
      setStatus(restoredDoctor ? "authenticated" : "unauthenticated");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await loginDoctor(email, password);
      const session: StoredSession = { doctor: result.doctor, token: result.token };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setDoctor(result.doctor);
      setStatus("authenticated");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDoctor(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ doctor, status, error, login, logout }),
    [doctor, status, error, login, logout],
  );

  return <DoctorAuthContext.Provider value={value}>{children}</DoctorAuthContext.Provider>;
}

export function useDoctorAuth() {
  const context = useContext(DoctorAuthContext);
  if (!context) {
    throw new Error("useDoctorAuth must be used within a DoctorAuthProvider.");
  }
  return context;
}
