"use client";

import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { StatusFilter } from "@/components/appointments/AppointmentFilters";

/** Thin doctor-portal wrapper around the shared appointments hook, scoped to one clinician. */
export function useDoctorAppointments(
  clinicianName: string | undefined,
  filters: { status?: StatusFilter; search?: string; date?: string } = {},
) {
  return useAppointments(
    { clinician: clinicianName, status: filters.status, search: filters.search, date: filters.date },
    Boolean(clinicianName),
  );
}
