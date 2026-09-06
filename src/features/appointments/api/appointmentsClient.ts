import type { Appointment, AppointmentDisplayStatus, AppointmentType } from "@/types/appointment";
import type { Prescription, PrescriptionMedication } from "@/types/prescription";
import type { Review } from "@/types/review";

export type AppointmentQuery = {
  clinician?: string;
  patientEmail?: string;
  status?: AppointmentDisplayStatus | "all";
  search?: string;
  date?: string;
};

function buildQuery(query: AppointmentQuery): string {
  const params = new URLSearchParams();
  if (query.clinician) params.set("clinician", query.clinician);
  if (query.patientEmail) params.set("patientEmail", query.patientEmail);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.search) params.set("search", query.search);
  if (query.date) params.set("date", query.date);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getAppointments(query: AppointmentQuery): Promise<Appointment[]> {
  const response = await fetch(`/api/appointments${buildQuery(query)}`);
  if (!response.ok) throw new Error("Unable to load appointments.");
  const body: { data: Appointment[] } = await response.json();
  return body.data;
}

export type CreateAppointmentInput = {
  doctorId: string;
  startsAt: string;
  patientName: string;
  patientEmail: string;
  reason?: string;
  type?: AppointmentType;
};

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to book this appointment.");
  return body.data as Appointment;
}

async function transition(id: string, action: string, extra?: Record<string, unknown>): Promise<Appointment> {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "That update couldn't be completed.");
  return body.data as Appointment;
}

export const confirmAppointment = (id: string) => transition(id, "confirm");
export const declineAppointment = (id: string) => transition(id, "decline");
export const cancelAppointment = (id: string) => transition(id, "cancel");
export const rescheduleAppointment = (id: string, startsAt: string) => transition(id, "reschedule", { startsAt });
export const markCompleted = (id: string) => transition(id, "complete");
export const markMissed = (id: string) => transition(id, "missed");

export async function getPrescription(appointmentId: string): Promise<Prescription | null> {
  const response = await fetch(`/api/appointments/${appointmentId}/prescription`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load the prescription.");
  const body: { data: Prescription } = await response.json();
  return body.data;
}

export async function issuePrescription(
  appointmentId: string,
  input: { diagnosis: string; notes: string; medications: PrescriptionMedication[] },
): Promise<Prescription> {
  const response = await fetch(`/api/appointments/${appointmentId}/prescription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to save the prescription.");
  return body.data as Prescription;
}

export async function submitReview(appointmentId: string, input: { rating: number; comment: string }): Promise<Review> {
  const response = await fetch(`/api/appointments/${appointmentId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to submit your review.");
  return body.data as Review;
}
