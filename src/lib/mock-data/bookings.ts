import type { Booking } from "@/types/booking";

/**
 * In-memory mock store. Resets whenever the dev server restarts — a real
 * backend would replace this module with a database-backed repository
 * behind the same route handler contract.
 */
export const bookings: Booking[] = [];
