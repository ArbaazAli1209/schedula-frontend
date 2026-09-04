import { doctors } from "@/lib/mock-data/doctors";
import { onlyAvailableSlots, withBookedFlag } from "@/lib/utils/availability";
import { SPECIALTIES } from "@/lib/constants/specialties";
import type { Doctor } from "@/types/doctor";

type RouteContext = { params: Promise<{ doctorId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  // The Doctor Portal's own profile view passes ?includeBooked=1 so a
  // doctor can see their full schedule (with a booked/unbooked flag on
  // each slot). Every other caller — the patient-facing directory and
  // booking flow — gets unbooked slots only, same as before.
  const { searchParams } = new URL(request.url);
  const includeBooked = searchParams.get("includeBooked") === "1";

  const slots = includeBooked
    ? withBookedFlag(doctorId, doctor.slots)
    : onlyAvailableSlots(doctorId, doctor.slots);

  return Response.json({ data: { ...doctor, slots } });
}

type ProfileUpdateBody = Partial<Pick<Doctor, "bio" | "location" | "specialty" | "experienceYears">>;

export async function PATCH(request: Request, context: RouteContext) {
  const { doctorId } = await context.params;
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return Response.json({ error: "Doctor not found." }, { status: 404 });
  }

  let body: ProfileUpdateBody;
  try {
    body = (await request.json()) as ProfileUpdateBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.bio !== undefined) {
    if (!body.bio.trim()) {
      return Response.json({ error: "Bio cannot be empty." }, { status: 400 });
    }
    doctor.bio = body.bio.trim();
  }

  if (body.location !== undefined) {
    if (!body.location.trim()) {
      return Response.json({ error: "Location cannot be empty." }, { status: 400 });
    }
    doctor.location = body.location.trim();
  }

  if (body.specialty !== undefined) {
    if (!SPECIALTIES.includes(body.specialty as (typeof SPECIALTIES)[number])) {
      return Response.json({ error: "Please select a valid specialty." }, { status: 400 });
    }
    doctor.specialty = body.specialty;
  }

  if (body.experienceYears !== undefined) {
    const years = Number(body.experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      return Response.json(
        { error: "Years of experience must be between 0 and 60." },
        { status: 400 },
      );
    }
    doctor.experienceYears = years;
  }

  return Response.json({ data: doctor });
}
