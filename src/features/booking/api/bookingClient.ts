import type { Booking } from "@/types/booking";

export type CreateBookingInput = {
  doctorId: string;
  startsAt: string;
  patientName: string;
  patientEmail: string;
};

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error ?? "Unable to book this appointment.");
  }

  return body.data as Booking;
}
