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

/**
 * Builds `occurrences` future slots that repeat weekly on the given weekday
 * and local time (e.g. every Tuesday at 10:30), starting from the next
 * matching date. Used by the Doctor Portal's recurring-availability form.
 */
export function buildRecurringSlots(
  /** 0 (Sunday) through 6 (Saturday). */
  dayOfWeek: number,
  /** Local hour of day, e.g. 9 for 9:00 or 9.5 for 9:30. */
  hour: number,
  durationMinutes: number,
  occurrences: number,
): DoctorSlot[] {
  const slots: DoctorSlot[] = [];
  const wholeHour = Math.trunc(hour);
  const minute = Math.round((hour - wholeHour) * 60);

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor.getDay() !== dayOfWeek) {
    cursor.setDate(cursor.getDate() + 1);
  }

  for (let i = 0; i < occurrences; i += 1) {
    const startsAt = new Date(cursor);
    startsAt.setHours(wholeHour, minute, 0, 0);
    slots.push({ startsAt: startsAt.toISOString(), durationMinutes });
    cursor.setDate(cursor.getDate() + 7);
  }

  return slots;
}
