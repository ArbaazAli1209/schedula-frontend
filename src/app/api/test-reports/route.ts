import { testReports } from "@/lib/mock-data/testReports";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientEmail = searchParams.get("patientEmail");

  const data = patientEmail ? testReports.filter((item) => item.patientEmail === patientEmail) : testReports;

  return Response.json({ data, meta: { total: data.length } });
}
