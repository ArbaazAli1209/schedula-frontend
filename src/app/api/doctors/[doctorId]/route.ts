import { doctors } from "@/lib/mock-data/doctors";
import { bookings } from "@/lib/mock-data/bookings";

type RouteContext = { params: Promise<{ doctorId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  // Hide slots that already have a confirmed booking against this doctor.
  const bookedTimes = new Set(
    bookings
      .filter((item) => item.doctorId === doctorId)
      .map((item) => item.startsAt),
  );
  const availableSlots = doctor.slots.filter(
    (slot) => !bookedTimes.has(slot.startsAt),
  );

  return Response.json({ data: { ...doctor, slots: availableSlots } });
}
