import { appointments } from "@/lib/mock-data/appointments";
import type { Review } from "@/types/review";

type RouteContext = { params: Promise<{ id: string }> };
type ReviewBody = { rating?: number; comment?: string };

/** User-side integration point for reviewing a doctor after a completed visit. */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment) return Response.json({ error: "Appointment not found." }, { status: 404 });
  if (appointment.status !== "completed") {
    return Response.json({ error: "Only completed appointments can be reviewed." }, { status: 409 });
  }

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const review: Review = {
    rating,
    comment: body.comment?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  appointment.review = review;
  appointment.updatedAt = review.createdAt;

  return Response.json({ data: review }, { status: 201 });
}
