"use client";

import { useCallback, useState } from "react";
import type { DoctorAccount, DoctorRegistrationInput } from "@/types/doctorAccount";
import { registerDoctor } from "@/features/doctor-portal/api/doctorRegistrationClient";

export function useDoctorRegistration() {
  const [account, setAccount] = useState<DoctorAccount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (input: DoctorRegistrationInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await registerDoctor(input);
      setAccount(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete registration.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, account, submitting, error };
}
