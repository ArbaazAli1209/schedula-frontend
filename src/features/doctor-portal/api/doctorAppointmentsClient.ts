import type { Appointment } from "@/types/appointment";

export async function getDoctorAppointments(clinicianName: string): Promise<Appointment[]> {
  const response = await fetch(`/api/appointments?clinician=${encodeURIComponent(clinicianName)}`);
  if (!response.ok) throw new Error("Unable to load appointments.");
  const body: { data: Appointment[] } = await response.json();
  return body.data;
}
