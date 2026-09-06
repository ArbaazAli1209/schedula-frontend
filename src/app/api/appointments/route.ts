import { appointments } from "@/lib/mock-data/appointments";
import { doctors } from "@/lib/mock-data/doctors";
import { onlyAvailableSlots } from "@/lib/utils/availability";
import { hasConflict, matchesDisplayStatus, matchesSearch } from "@/lib/utils/appointments";
import { createNotification } from "@/lib/utils/notifications";
import type { Appointment, AppointmentDisplayStatus, AppointmentType } from "@/types/appointment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinician = searchParams.get("clinician");
  const patientEmail = searchParams.get("patientEmail");
  const status = searchParams.get("status") as AppointmentDisplayStatus | "all" | null;
  const search = searchParams.get("search");
  const date = searchParams.get("date"); // YYYY-MM-DD

  // Scopes the shared appointments list to one clinician's schedule (Doctor
  // Portal) or one patient's history (My Appointments) when present.
  // Omitting both keeps the original clinic-wide behavior.
  let data = appointments;
  if (clinician) data = data.filter((item) => item.clinician === clinician);
  if (patientEmail) data = data.filter((item) => item.patient.email === patientEmail);
  if (status) data = data.filter((item) => matchesDisplayStatus(item, status));
  if (search) data = data.filter((item) => matchesSearch(item, search));
  if (date) data = data.filter((item) => item.startsAt.slice(0, 10) === date);

  data = [...data].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return Response.json({ data, meta: { total: data.length } });
}

type CreateAppointmentBody = {
  doctorId?: string;
  startsAt?: string;
  patientName?: string;
  patientEmail?: string;
  patientAge?: number;
  reason?: string;
  type?: AppointmentType;
};

/** Creates a new appointment request (status "pending") — the "User Books" step of the flow. */
export async function POST(request: Request) {
  let body: CreateAppointmentBody;
  try {
    body = (await request.json()) as CreateAppointmentBody;
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
    return Response.json({ error: "That slot is not available." }, { status: 400 });
  }

  if (hasConflict(doctorId, startsAt)) {
    return Response.json({ error: "That slot was just booked. Please pick another." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const initials = patientName
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    doctorId: doctor.id,
    patient: {
      name: patientName.trim(),
      initials: initials || "PT",
      age: body.patientAge ?? 0,
      email: patientEmail.trim(),
    },
    clinician: doctor.name,
    specialty: doctor.specialty,
    startsAt: slot.startsAt,
    durationMinutes: slot.durationMinutes,
    status: "pending",
    type: body.type ?? "in-person",
    reason: body.reason?.trim() || "General consultation",
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
    message: `${appointment.patient.name} requested ${appointment.reason.toLowerCase()}.`,
    appointmentId: appointment.id,
  });

  return Response.json({ data: appointment }, { status: 201 });
}
