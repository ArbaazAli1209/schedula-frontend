import { appointments } from "@/lib/mock-data/appointments";
import type { Appointment, AppointmentDisplayStatus, AppointmentStatus } from "@/types/appointment";

export function findAppointment(id: string): Appointment | undefined {
  return appointments.find((item) => item.id === id);
}

export function isPast(appointment: Pick<Appointment, "startsAt">): boolean {
  return new Date(appointment.startsAt).getTime() < Date.now();
}

/**
 * "Upcoming" is not a stored status — it's a confirmed appointment whose
 * time hasn't passed yet. Everything else (pending/confirmed-past/
 * cancelled/completed/missed) is shown as its stored status.
 */
export function computeDisplayStatus(appointment: Appointment): AppointmentDisplayStatus {
  if (appointment.status === "confirmed" && !isPast(appointment)) return "upcoming";
  return appointment.status;
}

export function matchesDisplayStatus(appointment: Appointment, filter: AppointmentDisplayStatus | "all"): boolean {
  if (filter === "all") return true;
  return computeDisplayStatus(appointment) === filter;
}

/** True if another active (pending/confirmed) appointment already occupies this doctor + time. */
export function hasConflict(doctorId: string, startsAt: string, excludeId?: string): boolean {
  return appointments.some(
    (item) =>
      item.id !== excludeId &&
      item.doctorId === doctorId &&
      item.startsAt === startsAt &&
      (item.status === "confirmed" || item.status === "pending"),
  );
}

export function matchesSearch(appointment: Appointment, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    appointment.patient.name.toLowerCase().includes(needle) ||
    appointment.reason.toLowerCase().includes(needle) ||
    appointment.clinician.toLowerCase().includes(needle)
  );
}

export const ACTIONABLE_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];

/** Statuses that can never be edited again — read-only in both portals. */
export function isReadOnly(status: AppointmentStatus): boolean {
  return status === "completed" || status === "cancelled" || status === "missed";
}
