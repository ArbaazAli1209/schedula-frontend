import { doctors } from "@/lib/mock-data/doctors";
import { bookings } from "@/lib/mock-data/bookings";
import { appointments } from "@/lib/mock-data/appointments";
import { onlyAvailableSlots } from "@/lib/utils/availability";
import { hasConflict } from "@/lib/utils/appointments";
import { createNotification } from "@/lib/utils/notifications";
import type { Booking } from "@/types/booking";
import type { Appointment } from "@/types/appointment";

type BookingRequestBody = {
  doctorId?: string;
  startsAt?: string;
  patientName?: string;
  patientEmail?: string;
};

export async function POST(request: Request) {
  let body: BookingRequestBody;
  try {
    body = (await request.json()) as BookingRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { doctorId, startsAt, patientName, patientEmail } = body;

  if (!doctorId || !startsAt || !patientName?.trim() || !patientEmail?.trim()) {
    return Response.json(
      { error: "doctorId, startsAt, patientName, and patientEmail are required." },
      { status: 400 },
    );
  }

  const doctor = doctors.find((item) => item.id === doctorId);
  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  const slot = onlyAvailableSlots(doctorId, doctor.slots).find((item) => item.startsAt === startsAt);
  if (!slot) {
    return Response.json(
      { error: "That slot is not offered by this doctor." },
      { status: 400 },
    );
  }

  const alreadyTaken = hasConflict(doctorId, startsAt);
  if (alreadyTaken) {
    return Response.json(
      { error: "That slot was just booked. Please pick another." },
      { status: 409 },
    );
  }

  const booking: Booking = {
    id: `bkg-${Date.now()}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    patientName: patientName.trim(),
    patientEmail: patientEmail.trim(),
    startsAt: slot.startsAt,
    durationMinutes: slot.durationMinutes,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);

  // Also record this as an appointment request (status "pending") so it
  // flows into both portals: Doctor Availability → User Books → Doctor
  // Confirms. The `Booking` record above is kept only for this route's own
  // confirmation screen (`BookingConfirmation`) — `Appointment` is now the
  // source of truth doctors and patients actually see.
  const now = new Date().toISOString();
  const initials = booking.patientName
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    doctorId: doctor.id,
    patient: { name: booking.patientName, initials: initials || "PT", age: 0, email: booking.patientEmail },
    clinician: doctor.name,
    specialty: doctor.specialty,
    startsAt: booking.startsAt,
    durationMinutes: booking.durationMinutes,
    status: "pending",
    type: "in-person",
    reason: "General consultation",
    room: doctor.location,
    createdAt: now,
    updatedAt: now,
  };
  appointments.push(appointment);

  createNotification({
    audience: "doctor",
    recipient: doctor.name,
    kind: "booking",
    title: "New appointment request",
    message: `${appointment.patient.name} requested an appointment.`,
    appointmentId: appointment.id,
  });

  return Response.json({ data: booking }, { status: 201 });
}
