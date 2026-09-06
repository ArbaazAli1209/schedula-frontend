import { doctors } from "@/lib/mock-data/doctors";
import { onlyAvailableSlots } from "@/lib/utils/availability";

export async function GET() {
  // Each doctor's slots are scoped to unbooked ones only, same as the
  // single-doctor route, so the directory never advertises a time that's
  // already taken.
  const data = doctors.map((doctor) => ({
    ...doctor,
    slots: onlyAvailableSlots(doctor.id, doctor.slots),
  }));

  return Response.json({ data, meta: { total: data.length } });
}
