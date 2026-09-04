"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppointmentStatus } from "@/types/appointment";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/useDoctorAppointments";

type Filter = "all" | AppointmentStatus;

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
};

const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });

export function DoctorAppointmentsPanel({
  clinicianName,
  filters = ["all", "confirmed", "pending"],
}: {
  clinicianName: string | undefined;
  filters?: Filter[];
}) {
  const { appointments, status, refetch } = useDoctorAppointments(clinicianName);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>();

  // Default to the first appointment once the list loads, without
  // clobbering a selection the doctor already made.
  useEffect(() => {
    if (!selectedId && appointments.length > 0) setSelectedId(appointments[0].id);
  }, [appointments, selectedId]);

  const visible = useMemo(
    () => (filter === "all" ? appointments : appointments.filter((item) => item.status === filter)),
    [appointments, filter],
  );

  const selected = appointments.find((item) => item.id === selectedId);

  const counts = appointments.reduce<Record<Filter, number>>(
    (total, item) => ({ ...total, all: total.all + 1, [item.status]: total[item.status] + 1 }),
    { all: 0, confirmed: 0, pending: 0, cancelled: 0 },
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section
        className="overflow-hidden rounded-xl border border-[var(--line)] bg-white"
        aria-labelledby="doctor-schedule-title"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="doctor-schedule-title" className="font-semibold">
            Your appointments
          </h2>
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  filter === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item} <span className="ml-1 text-xs">{counts[item]}</span>
              </button>
            ))}
          </div>
        </div>

        {status === "loading" && (
          <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading appointments">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-lg bg-stone-100" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="p-8 text-center" role="alert">
            <p className="font-medium">We couldn&apos;t load your appointments.</p>
            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && (
          <ul className="divide-y divide-[var(--line)]" role="list">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selectedId === item.id}
                  className={`grid w-full grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-5 py-4 text-left hover:bg-emerald-50/40 ${
                    selectedId === item.id ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <time className="pt-1 text-sm font-medium text-[var(--muted)]">
                    {timeFormatter.format(new Date(item.startsAt))}
                  </time>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        {item.patient.name}{" "}
                        <span className="font-normal text-[var(--muted)]">· {item.durationMinutes} min</span>
                      </p>
                      <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{item.reason}</p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-medium">
              {appointments.length === 0 ? "No appointments yet." : "No appointments match this filter."}
            </p>
            {appointments.length > 0 && (
              <button type="button" onClick={() => setFilter("all")} className="mt-2 text-sm font-semibold text-[var(--brand)]">
                Show all appointments
              </button>
            )}
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-[var(--line)] bg-white p-5" aria-live="polite">
        <p className="text-sm font-medium text-[var(--muted)]">Appointment details</p>
        {selected ? (
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-[var(--brand-deep)]">
                {selected.patient.initials}
              </span>
              <div>
                <h3 className="font-semibold">{selected.patient.name}</h3>
                <p className="text-sm text-[var(--muted)]">{selected.patient.age} years old</p>
              </div>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Visit</dt>
                <dd className="mt-1 font-medium">{selected.reason}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Time &amp; room</dt>
                <dd className="mt-1 font-medium">
                  {timeFormatter.format(new Date(selected.startsAt))} · {selected.room}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted)]">Select an appointment to see visit details.</p>
        )}
      </aside>
    </div>
  );
}
