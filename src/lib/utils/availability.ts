import { appointments } from "@/lib/mock-data/appointments";
import type { DoctorSlot } from "@/types/doctor";

/**
 * Active (pending/confirmed) appointments are what actually occupy a slot —
 * this is the single source of truth for availability across both portals
 * (booking, rescheduling, and the doctor's own slot manager/calendar).
 */
function getBookedSlotTimes(doctorId: string): Set<string> {
  return new Set(
    appointments
      .filter((item) => item.doctorId === doctorId && (item.status === "confirmed" || item.status === "pending"))
      .map((item) => item.startsAt),
  );
}

/** Returns only the slots that don't already have an active appointment — what patients should see. */
export function onlyAvailableSlots(doctorId: string, slots: DoctorSlot[]): DoctorSlot[] {
  const booked = getBookedSlotTimes(doctorId);
  return slots.filter((slot) => !booked.has(slot.startsAt));
}

/** Returns every slot annotated with whether it's booked — for the doctor's own view (profile + calendar). */
export function withBookedFlag(
  doctorId: string,
  slots: DoctorSlot[],
): (DoctorSlot & { isBooked: boolean })[] {
  const booked = getBookedSlotTimes(doctorId);
  return slots.map((slot) => ({ ...slot, isBooked: booked.has(slot.startsAt) }));
}

export { getBookedSlotTimes };
