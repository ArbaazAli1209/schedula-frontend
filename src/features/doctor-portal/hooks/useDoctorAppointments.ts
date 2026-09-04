"use client";

import { useCallback, useEffect, useState } from "react";
import type { Appointment } from "@/types/appointment";
import { getDoctorAppointments } from "@/features/doctor-portal/api/doctorAppointmentsClient";

type Status = "loading" | "ready" | "error";

export function useDoctorAppointments(clinicianName: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(() => {
    if (!clinicianName) return Promise.resolve();
    return getDoctorAppointments(clinicianName)
      .then((data) => {
        setAppointments(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [clinicianName]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setStatus("loading");
    load();
  }, [load]);

  return { appointments, status, refetch };
}
