import { bookings } from "@/lib/mock-data/bookings";
import type { DoctorSlot } from "@/types/doctor";

function getBookedSlotTimes(doctorId: string): Set<string> {
  return new Set(
    bookings.filter((item) => item.doctorId === doctorId).map((item) => item.startsAt),
  );
}

/** Returns only the slots that don't already have a booking — what patients should see. */
export function onlyAvailableSlots(doctorId: string, slots: DoctorSlot[]): DoctorSlot[] {
  const booked = getBookedSlotTimes(doctorId);
  return slots.filter((slot) => !booked.has(slot.startsAt));
}

/** Returns every slot annotated with whether it's booked — for the doctor's own view. */
export function withBookedFlag(
  doctorId: string,
  slots: DoctorSlot[],
): (DoctorSlot & { isBooked: boolean })[] {
  const booked = getBookedSlotTimes(doctorId);
  return slots.map((slot) => ({ ...slot, isBooked: booked.has(slot.startsAt) }));
}

export { getBookedSlotTimes };
