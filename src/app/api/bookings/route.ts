import { doctors } from "@/lib/mock-data/doctors";
import { bookings } from "@/lib/mock-data/bookings";
import type { Booking } from "@/types/booking";

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

  const slot = doctor.slots.find((item) => item.startsAt === startsAt);
  if (!slot) {
    return Response.json(
      { error: "That slot is not offered by this doctor." },
      { status: 400 },
    );
  }

  const alreadyTaken = bookings.some(
    (item) => item.doctorId === doctorId && item.startsAt === startsAt,
  );
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

  return Response.json({ data: booking }, { status: 201 });
}
