"use client";

import type { AppointmentDisplayStatus } from "@/types/appointment";

export type StatusFilter = "all" | AppointmentDisplayStatus;

const TAB_LABEL: Record<StatusFilter, string> = {
  all: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  missed: "Missed",
};

type Props = {
  tabs: StatusFilter[];
  active: StatusFilter;
  onChange: (tab: StatusFilter) => void;
  counts: Partial<Record<StatusFilter, number>>;
  search: string;
  onSearchChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
};

/** Shared tab bar + search + date filter for the doctor's Appointments list. */
export function AppointmentFilters({ tabs, active, onChange, counts, search, onSearchChange, date, onDateChange }: Props) {
  return (
    <div className="space-y-3 border-b border-[var(--line)] px-5 py-4">
      <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              active === tab ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {TAB_LABEL[tab]} <span className="ml-1 text-xs">{counts[tab] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search patient, reason…"
          aria-label="Search appointments"
          className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm outline-none focus:border-[var(--brand)] sm:max-w-xs"
        />
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          aria-label="Filter by date"
          className="rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        {date && (
          <button type="button" onClick={() => onDateChange("")} className="text-sm font-semibold text-[var(--brand)]">
            Clear date
          </button>
        )}
      </div>
    </div>
  );
}
