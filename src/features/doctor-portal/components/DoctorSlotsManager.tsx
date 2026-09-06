"use client";

import { useState, type FormEvent } from "react";
import type { DoctorSlot } from "@/types/doctor";
import { buildRecurringSlots } from "@/lib/utils/slots";
import type { OwnerSlot } from "@/features/doctor-portal/api/doctorProfileClient";

const DURATIONS = [15, 30, 45, 60];
const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Props = {
  slots: OwnerSlot[];
  onAddSlots: (slots: DoctorSlot[]) => Promise<boolean>;
  onRemoveSlot: (startsAt: string) => Promise<boolean>;
};

export function DoctorSlotsManager({ slots, onAddSlots, onRemoveSlot }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [singleError, setSingleError] = useState<string | null>(null);
  const [addingSingle, setAddingSingle] = useState(false);

  const [weekday, setWeekday] = useState("1");
  const [recurringTime, setRecurringTime] = useState("");
  const [recurringDuration, setRecurringDuration] = useState("30");
  const [occurrences, setOccurrences] = useState("4");
  const [recurringError, setRecurringError] = useState<string | null>(null);
  const [addingRecurring, setAddingRecurring] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAddSingle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSingleError(null);

    if (!date || !time) {
      setSingleError("Pick a date and time.");
      return;
    }
    const startsAt = new Date(`${date}T${time}`);
    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      setSingleError("Pick a time in the future.");
      return;
    }

    setAddingSingle(true);
    const ok = await onAddSlots([{ startsAt: startsAt.toISOString(), durationMinutes: Number(duration) }]);
    setAddingSingle(false);

    if (ok) {
      setDate("");
      setTime("");
    } else {
      setSingleError("That slot could not be added.");
    }
  }

  async function handleAddRecurring(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecurringError(null);

    if (!recurringTime) {
      setRecurringError("Pick a time.");
      return;
    }
    const [hourPart, minutePart] = recurringTime.split(":").map(Number);
    const hour = hourPart + minutePart / 60;
    const count = Number(occurrences);
    if (!Number.isFinite(count) || count < 1 || count > 12) {
      setRecurringError("Choose between 1 and 12 weeks.");
      return;
    }

    const generated = buildRecurringSlots(Number(weekday), hour, Number(recurringDuration), count);
    setAddingRecurring(true);
    const ok = await onAddSlots(generated);
    setAddingRecurring(false);
    if (!ok) setRecurringError("Those slots could not be added.");
  }

  async function handleRemove(startsAt: string) {
    setRemovingId(startsAt);
    await onRemoveSlot(startsAt);
    setRemovingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <form onSubmit={handleAddSingle} className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-4">
          <p className="font-medium">Add a single slot</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="slot-date" className="text-xs font-medium text-[var(--muted)]">
                Date
              </label>
              <input
                id="slot-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
            <div>
              <label htmlFor="slot-time" className="text-xs font-medium text-[var(--muted)]">
                Time
              </label>
              <input
                id="slot-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>
          <div>
            <label htmlFor="slot-duration" className="text-xs font-medium text-[var(--muted)]">
              Duration (minutes)
            </label>
            <select
              id="slot-duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            >
              {DURATIONS.map((item) => (
                <option key={item} value={item}>
                  {item} min
                </option>
              ))}
            </select>
          </div>
          {singleError && <p className="text-sm text-red-600">{singleError}</p>}
          <button
            type="submit"
            disabled={addingSingle}
            className="w-full rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingSingle ? "Adding…" : "Add slot"}
          </button>
        </form>

        <form onSubmit={handleAddRecurring} className="space-y-3 rounded-xl border border-[var(--line)] bg-white p-4">
          <p className="font-medium">Add a recurring slot</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="recurring-weekday" className="text-xs font-medium text-[var(--muted)]">
                Day of week
              </label>
              <select
                id="recurring-weekday"
                value={weekday}
                onChange={(event) => setWeekday(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              >
                {WEEKDAYS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="recurring-time" className="text-xs font-medium text-[var(--muted)]">
                Time
              </label>
              <input
                id="recurring-time"
                type="time"
                value={recurringTime}
                onChange={(event) => setRecurringTime(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="recurring-duration" className="text-xs font-medium text-[var(--muted)]">
                Duration (minutes)
              </label>
              <select
                id="recurring-duration"
                value={recurringDuration}
                onChange={(event) => setRecurringDuration(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              >
                {DURATIONS.map((item) => (
                  <option key={item} value={item}>
                    {item} min
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="recurring-weeks" className="text-xs font-medium text-[var(--muted)]">
                Repeat for (weeks)
              </label>
              <input
                id="recurring-weeks"
                type="number"
                min={1}
                max={12}
                value={occurrences}
                onChange={(event) => setOccurrences(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
            </div>
          </div>
          {recurringError && <p className="text-sm text-red-600">{recurringError}</p>}
          <button
            type="submit"
            disabled={addingRecurring}
            className="w-full rounded-lg border border-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-[var(--brand)] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingRecurring ? "Adding…" : "Add weekly slots"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-white">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <p className="font-semibold">Upcoming slots</p>
        </div>
        {slots.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted)]">No slots yet. Add one above so patients can book you.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)]" role="list">
            {slots.map((slot) => (
              <li key={slot.startsAt} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{dateTimeFormatter.format(new Date(slot.startsAt))}</p>
                  <p className="text-xs text-[var(--muted)]">{slot.durationMinutes} min</p>
                </div>
                {slot.isBooked ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
                    Booked
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={removingId === slot.startsAt}
                    onClick={() => handleRemove(slot.startsAt)}
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
                  >
                    {removingId === slot.startsAt ? "Removing…" : "Remove"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
