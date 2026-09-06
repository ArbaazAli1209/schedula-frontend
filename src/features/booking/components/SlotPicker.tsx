"use client";

import { useMemo, useState } from "react";
import type { DoctorSlot } from "@/types/doctor";

const dateFormatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });

type Props = {
  slots: DoctorSlot[];
  selected: DoctorSlot | null;
  onSelect: (slot: DoctorSlot) => void;
};

export function SlotPicker({ slots, selected, onSelect }: Props) {
  const groups = useMemo(() => {
    const byDate = new Map<string, DoctorSlot[]>();
    for (const slot of slots) {
      const dateKey = slot.startsAt.slice(0, 10);
      const existing = byDate.get(dateKey) ?? [];
      existing.push(slot);
      byDate.set(dateKey, existing);
    }
    return Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const [activeDate, setActiveDate] = useState(groups[0]?.[0]);
  const activeGroup = groups.find(([date]) => date === activeDate) ?? groups[0];

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center">
        <p className="font-medium">No open slots right now.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Please check back soon or choose another doctor.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a date">
        {groups.map(([date, dateSlots]) => (
          <button
            key={date}
            type="button"
            role="tab"
            aria-selected={activeDate === date}
            onClick={() => setActiveDate(date)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
              activeDate === date
                ? "border-[var(--brand)] bg-emerald-50 text-[var(--brand-deep)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {dateFormatter.format(new Date(dateSlots[0].startsAt))}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a time">
        {activeGroup?.[1].map((slot) => (
          <button
            key={slot.startsAt}
            type="button"
            onClick={() => onSelect(slot)}
            aria-pressed={selected?.startsAt === slot.startsAt}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
              selected?.startsAt === slot.startsAt
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            }`}
          >
            {timeFormatter.format(new Date(slot.startsAt))}
          </button>
        ))}
      </div>
    </div>
  );
}
