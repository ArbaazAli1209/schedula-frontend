"use client";

import { useCallback, useEffect, useState } from "react";
import type { Appointment } from "@/types/appointment";
import { getAppointments, type AppointmentQuery } from "@/features/appointments/api/appointmentsClient";

type Status = "loading" | "ready" | "error";

/**
 * Shared list-loading hook for both portals. Pass `clinician` for the
 * Doctor Portal or `patientEmail` for the user's "My Appointments" — the
 * API route scopes results accordingly.
 */
export function useAppointments(query: AppointmentQuery, enabled = true) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const queryKey = JSON.stringify(query);

  const load = useCallback(() => {
    if (!enabled) return Promise.resolve();
    return getAppointments(query)
      .then((data) => {
        setAppointments(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setStatus("loading");
    return load();
  }, [load]);

  return { appointments, status, refetch };
}
