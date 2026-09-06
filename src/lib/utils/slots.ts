import type { DoctorSlot } from "@/types/doctor";

/**
 * Builds a short run of upcoming slots for mock/demo doctor data.
 * Skips weekends and starts from tomorrow so slots are always bookable.
 */
export function buildUpcomingSlots(
  /** Local hour of day for each slot, e.g. 9 for 9:00 or 9.5 for 9:30. */
  hours: number[],
  durationMinutes = 30,
  daysAhead = 5,
): DoctorSlot[] {
  const slots: DoctorSlot[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  let daysAdded = 0;
  while (daysAdded < daysAhead) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      for (const hour of hours) {
        const wholeHour = Math.trunc(hour);
        const minute = Math.round((hour - wholeHour) * 60);
        const startsAt = new Date(cursor);
        startsAt.setHours(wholeHour, minute, 0, 0);
        slots.push({ startsAt: startsAt.toISOString(), durationMinutes });
      }
      daysAdded += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}
