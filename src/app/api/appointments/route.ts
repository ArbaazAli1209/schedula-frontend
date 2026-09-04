import { appointments } from "@/lib/mock-data/appointments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clinician = searchParams.get("clinician");

  // Scopes the shared appointments list to one clinician's schedule (used
  // by the Doctor Portal dashboard) when the query param is present.
  // Omitting it keeps the original clinic-wide behavior.
  const data = clinician
    ? appointments.filter((item) => item.clinician === clinician)
    : appointments;

  return Response.json({ data, meta: { total: data.length } });
}
