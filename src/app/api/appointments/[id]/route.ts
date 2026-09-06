import { appointments } from "@/lib/mock-data/appointments";
import { doctors } from "@/lib/mock-data/doctors";
import { findAppointment, hasConflict, isPast } from "@/lib/utils/appointments";
import { createNotification } from "@/lib/utils/notifications";
import type { Appointment } from "@/types/appointment";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const appointment = findAppointment(id);
  if (!appointment) return Response.json({ error: "Appointment not found." }, { status: 404 });
  return Response.json({ data: appointment });
}

type TransitionAction = "confirm" | "decline" | "cancel" | "reschedule" | "complete" | "missed";
type PatchBody = { action?: TransitionAction; startsAt?: string; reason?: string };

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return Response.json({ error: "Appointment not found." }, { status: 404 });

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action } = body;
  if (!action) return Response.json({ error: "An action is required." }, { status: 400 });

  const patientRecipient = appointment.patient.email;
  const notifyUser = (kind: Parameters<typeof createNotification>[0]["kind"], title: string, message: string) => {
    if (!patientRecipient) return;
    createNotification({ audience: "user", recipient: patientRecipient, kind, title, message, appointmentId: appointment.id });
  };
  const notifyDoctor = (kind: Parameters<typeof createNotification>[0]["kind"], title: string, message: string) => {
    createNotification({ audience: "doctor", recipient: appointment.clinician, kind, title, message, appointmentId: appointment.id });
  };

  switch (action) {
    case "confirm": {
      if (appointment.status !== "pending") {
        return Response.json({ error: "Only pending appointments can be confirmed." }, { status: 409 });
      }
      appointment.status = "confirmed";
      notifyUser(
        "confirmation",
        "Appointment confirmed",
        `${appointment.clinician} confirmed your visit on ${dateTimeFormatter.format(new Date(appointment.startsAt))}.`,
      );
      break;
    }
    case "decline": {
      if (appointment.status !== "pending") {
        return Response.json({ error: "Only pending appointments can be declined." }, { status: 409 });
      }
      appointment.status = "cancelled";
      notifyUser(
        "cancellation",
        "Appointment declined",
        `${appointment.clinician} declined your request for ${dateTimeFormatter.format(new Date(appointment.startsAt))}. Please pick another time.`,
      );
      break;
    }
    case "cancel": {
      if (appointment.status !== "confirmed" && appointment.status !== "pending") {
        return Response.json({ error: "Only pending or confirmed appointments can be cancelled." }, { status: 409 });
      }
      appointment.status = "cancelled";
      notifyUser(
        "cancellation",
        "Appointment cancelled",
        `Your visit with ${appointment.clinician} on ${dateTimeFormatter.format(new Date(appointment.startsAt))} was cancelled.`,
      );
      break;
    }
    case "reschedule": {
      if (appointment.status !== "confirmed" && appointment.status !== "pending") {
        return Response.json({ error: "Only pending or confirmed appointments can be rescheduled." }, { status: 409 });
      }
      const nextStartsAt = body.startsAt;
      if (!nextStartsAt) return Response.json({ error: "startsAt is required." }, { status: 400 });

      const doctor = doctors.find((item) => item.id === appointment.doctorId);
      const slotExists = doctor?.slots.some((slot) => slot.startsAt === nextStartsAt);
      if (!doctor || !slotExists) {
        return Response.json({ error: "That time isn't one of the doctor's available slots." }, { status: 400 });
      }
      if (hasConflict(appointment.doctorId, nextStartsAt, appointment.id)) {
        return Response.json({ error: "That slot is already booked." }, { status: 409 });
      }

      const previousStartsAt = appointment.startsAt;
      appointment.rescheduledFrom = previousStartsAt;
      appointment.startsAt = nextStartsAt;
      appointment.status = "confirmed";
      notifyUser(
        "reschedule",
        "Appointment rescheduled",
        `${appointment.clinician} moved your visit to ${dateTimeFormatter.format(new Date(nextStartsAt))}.`,
      );
      break;
    }
    case "complete": {
      if (appointment.status !== "confirmed") {
        return Response.json({ error: "Only confirmed appointments can be marked completed." }, { status: 409 });
      }
      if (!isPast(appointment)) {
        return Response.json({ error: "This appointment hasn't happened yet." }, { status: 409 });
      }
      appointment.status = "completed";
      notifyUser(
        "completed",
        "Appointment completed",
        `Your visit with ${appointment.clinician} is marked complete. Check for a prescription in My Appointments.`,
      );
      break;
    }
    case "missed": {
      if (appointment.status !== "confirmed") {
        return Response.json({ error: "Only confirmed appointments can be marked missed." }, { status: 409 });
      }
      if (!isPast(appointment)) {
        return Response.json({ error: "This appointment hasn't happened yet." }, { status: 409 });
      }
      appointment.status = "missed";
      notifyUser(
        "missed",
        "Missed appointment",
        `You missed your visit with ${appointment.clinician} on ${dateTimeFormatter.format(new Date(appointment.startsAt))}.`,
      );
      break;
    }
    default:
      return Response.json({ error: "Unknown action." }, { status: 400 });
  }

  appointment.updatedAt = new Date().toISOString();
  // Keep the doctor's own notification feed in sync for reschedules they
  // trigger from the calendar drag/drop, without duplicating on every action.
  if (action === "reschedule") {
    notifyDoctor(
      "reschedule",
      "Appointment rescheduled",
      `${appointment.patient.name}'s visit was moved to ${dateTimeFormatter.format(new Date(appointment.startsAt))}.`,
    );
  }

  return Response.json({ data: appointment as Appointment });
}
