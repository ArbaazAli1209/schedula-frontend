"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/useDoctorAppointments";
import { computeDisplayStatus } from "@/lib/utils/appointments";
import { AppointmentFilters, type StatusFilter } from "@/components/appointments/AppointmentFilters";
import { AppointmentDetailsPanel } from "@/components/appointments/AppointmentDetailsPanel";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { PatientDetailsDialog } from "@/components/appointments/PatientDetailsDialog";

const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const ALL_TABS: StatusFilter[] = ["all", "pending", "confirmed", "upcoming", "completed", "cancelled", "missed"];

export function DoctorAppointmentsPanel({
  clinicianName,
  tabs = ALL_TABS,
}: {
  clinicianName: string | undefined;
  tabs?: StatusFilter[];
}) {
  const [filter, setFilter] = useState<StatusFilter>(tabs[0] ?? "all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const { appointments, status, refetch } = useDoctorAppointments(clinicianName, { status: filter, search, date });
  const [selectedId, setSelectedId] = useState<string>();
  const [patientDialogId, setPatientDialogId] = useState<string>();

  useEffect(() => {
    if (!selectedId && appointments.length > 0) setSelectedId(appointments[0].id);
  }, [appointments, selectedId]);

  const selected = appointments.find((item) => item.id === selectedId);
  const patientDialogAppointment = appointments.find((item) => item.id === patientDialogId);

  // Counts always reflect the unfiltered clinician list so tab badges don't
  // shift as the doctor narrows the view with search/date.
  const { appointments: allForCounts } = useDoctorAppointments(clinicianName);
  const counts = useMemo(() => {
    const base: Partial<Record<StatusFilter, number>> = { all: allForCounts.length };
    for (const item of allForCounts) {
      const key = computeDisplayStatus(item) as StatusFilter;
      base[key] = (base[key] ?? 0) + 1;
    }
    return base;
  }, [allForCounts]);

  function handleUpdated(updated: Appointment) {
    setSelectedId(updated.id);
    refetch();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white" aria-labelledby="doctor-schedule-title">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 id="doctor-schedule-title" className="font-semibold">
            Your appointments
          </h2>
        </div>
        <AppointmentFilters
          tabs={tabs}
          active={filter}
          onChange={setFilter}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
          date={date}
          onDateChange={setDate}
        />

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
            {appointments.map((item) => (
              <li key={item.id}>
                <div
                  className={`grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-5 py-4 hover:bg-emerald-50/40 ${
                    selectedId === item.id ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <button type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selectedId === item.id} className="text-left">
                    <time className="pt-1 text-sm font-medium text-[var(--muted)]">{timeFormatter.format(new Date(item.startsAt))}</time>
                  </button>
                  <button type="button" onClick={() => setSelectedId(item.id)} className="flex min-w-0 flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {item.patient.name} <span className="font-normal text-[var(--muted)]">· {item.durationMinutes} min</span>
                      </p>
                      <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                        {item.reason} · {item.type === "video" ? "Video" : "In-person"}
                      </p>
                    </div>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={computeDisplayStatus(item)} />
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`View patient details for ${item.patient.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPatientDialogId(item.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            setPatientDialogId(item.id);
                          }
                        }}
                        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-base hover:bg-stone-100"
                        title="Patient details"
                      >
                        👤
                      </span>
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {status === "ready" && appointments.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-medium">No appointments match this view.</p>
            {(filter !== "all" || search || date) && (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                  setDate("");
                }}
                className="mt-2 text-sm font-semibold text-[var(--brand)]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-[var(--line)] bg-white p-5" aria-live="polite">
        <p className="text-sm font-medium text-[var(--muted)]">Appointment details</p>
        {selected ? (
          <div className="mt-5">
            <AppointmentDetailsPanel appointment={selected} onUpdated={handleUpdated} />
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted)]">Select an appointment to see visit details.</p>
        )}
      </aside>

      {patientDialogAppointment && (
        <PatientDetailsDialog appointment={patientDialogAppointment} onClose={() => setPatientDialogId(undefined)} />
      )}
    </div>
  );
}
