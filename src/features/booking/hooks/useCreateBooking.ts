"use client";

import { useCallback, useState } from "react";
import type { Booking } from "@/types/booking";
import { createBooking, type CreateBookingInput } from "@/features/booking/api/bookingClient";

export function useCreateBooking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (input: CreateBookingInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBooking(input);
      setBooking(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book this appointment.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, booking, submitting, error };
}
