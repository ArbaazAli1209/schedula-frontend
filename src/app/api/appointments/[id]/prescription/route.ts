import { appointments } from "@/lib/mock-data/appointments";
import { createNotification } from "@/lib/utils/notifications";
import type { Prescription, PrescriptionMedication } from "@/types/prescription";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return Response.json({ error: "Appointment not found." }, { status: 404 });
  if (!appointment.prescription) return Response.json({ error: "No prescription for this appointment." }, { status: 404 });
  return Response.json({ data: appointment.prescription });
}

type PrescriptionBody = { notes?: string; medications?: PrescriptionMedication[] };

/** Doctor-side integration point for issuing a prescription on a completed visit. */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return Response.json({ error: "Appointment not found." }, { status: 404 });
  if (appointment.status !== "completed") {
    return Response.json({ error: "Prescriptions can only be added to completed appointments." }, { status: 409 });
  }

  let body: PrescriptionBody;
  try {
    body = (await request.json()) as PrescriptionBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prescription: Prescription = {
    id: `rx-${Date.now()}`,
    appointmentId: appointment.id,
    issuedAt: new Date().toISOString(),
    notes: body.notes?.trim() ?? "",
    medications: Array.isArray(body.medications) ? body.medications : [],
  };
  appointment.prescription = prescription;
  appointment.updatedAt = prescription.issuedAt;

  if (appointment.patient.email) {
    createNotification({
      audience: "user",
      recipient: appointment.patient.email,
      kind: "prescription",
      title: "Prescription available",
      message: `${appointment.clinician} added a prescription for your visit.`,
      appointmentId: appointment.id,
    });
  }

  return Response.json({ data: prescription }, { status: 201 });
}
