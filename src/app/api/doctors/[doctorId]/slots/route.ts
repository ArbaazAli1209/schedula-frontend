import { doctors } from "@/lib/mock-data/doctors";
import { getBookedSlotTimes } from "@/lib/utils/availability";
import type { DoctorSlot } from "@/types/doctor";

type RouteContext = { params: Promise<{ doctorId: string }> };
type SlotInput = { startsAt?: string; durationMinutes?: number };

export async function POST(request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  let body: { slots?: SlotInput[] };
  try {
    body = (await request.json()) as { slots?: SlotInput[] };
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body.slots;
  if (!Array.isArray(input) || input.length === 0) {
    return Response.json({ error: "At least one slot is required." }, { status: 400 });
  }

  const existingTimes = new Set(doctor.slots.map((slot) => slot.startsAt));
  const added: DoctorSlot[] = [];

  for (const item of input) {
    const startsAt = item.startsAt;
    const durationMinutes = Number(item.durationMinutes);
    const date = startsAt ? new Date(startsAt) : null;

    if (!startsAt || !date || Number.isNaN(date.getTime())) {
      return Response.json({ error: "Each slot needs a valid date and time." }, { status: 400 });
    }
    if (date.getTime() <= Date.now()) {
      return Response.json({ error: "Slots must be in the future." }, { status: 400 });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 180) {
      return Response.json(
        { error: "Duration must be between 15 and 180 minutes." },
        { status: 400 },
      );
    }

    // Silently skip a slot that already exists rather than failing an
    // otherwise-valid batch (recurring slots can legitimately overlap
    // with ones added earlier).
    if (existingTimes.has(startsAt)) continue;

    existingTimes.add(startsAt);
    added.push({ startsAt, durationMinutes });
  }

  doctor.slots = [...doctor.slots, ...added].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return Response.json({ data: doctor.slots }, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  let body: { startsAt?: string };
  try {
    body = (await request.json()) as { startsAt?: string };
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const startsAt = body.startsAt;
  if (!startsAt) {
    return Response.json({ error: "startsAt is required." }, { status: 400 });
  }

  const exists = doctor.slots.some((slot) => slot.startsAt === startsAt);
  if (!exists) {
    return Response.json({ error: "Slot not found." }, { status: 404 });
  }

  const bookedTimes = getBookedSlotTimes(doctorId);
  if (bookedTimes.has(startsAt)) {
    return Response.json(
      { error: "Cannot remove a slot that already has a booking." },
      { status: 409 },
    );
  }

  doctor.slots = doctor.slots.filter((slot) => slot.startsAt !== startsAt);

  return Response.json({ data: doctor.slots });
}
