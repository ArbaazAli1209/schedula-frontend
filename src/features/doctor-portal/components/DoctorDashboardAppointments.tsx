"use client";

import { useState } from "react";
import Link from "next/link";
import type { Appointment } from "@/types/appointment";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/useDoctorAppointments";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { computeDisplayStatus } from "@/lib/utils/appointments";
import { PatientDetailsDialog } from "@/components/appointments/PatientDetailsDialog";
import { AppointmentDetailsPanel } from "@/components/appointments/AppointmentDetailsPanel";
import { Modal } from "@/components/ui/Modal";

const dateTimeFormatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Doctor Dashboard: upcoming (confirmed, future) appointments only — per the spec, nothing else shows here. */
export function DoctorDashboardAppointments({ clinicianName }: { clinicianName: string | undefined }) {
  const { appointments, status, refetch } = useDoctorAppointments(clinicianName, { status: "upcoming" });
  const [patientDialogId, setPatientDialogId] = useState<string>();
  const [detailsId, setDetailsId] = useState<string>();

  const patientDialogAppointment = appointments.find((item) => item.id === patientDialogId);
  const detailsAppointment = appointments.find((item) => item.id === detailsId);

  function handleUpdated(updated: Appointment) {
    void updated;
    refetch();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <h2 className="font-semibold">Upcoming appointments</h2>
        <Link href="/doctor/calendar" className="text-sm font-semibold text-[var(--brand)] hover:underline">
          🗓 View calendar
        </Link>
      </div>

      {status === "loading" && (
        <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading appointments">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="p-8 text-center" role="alert">
          <p className="font-medium">We couldn&apos;t load your upcoming appointments.</p>
          <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && appointments.length === 0 && (
        <p className="p-10 text-center text-sm text-[var(--muted)]">No upcoming appointments right now.</p>
      )}

      {status === "ready" && appointments.length > 0 && (
        <ul className="divide-y divide-[var(--line)]" role="list">
          {appointments.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{item.patient.name}</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {dateTimeFormatter.format(new Date(item.startsAt))} · {item.type === "video" ? "Video" : "In-person"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={computeDisplayStatus(item)} />
                <button
                  type="button"
                  onClick={() => setPatientDialogId(item.id)}
                  aria-label={`Patient details for ${item.patient.name}`}
                  title="Patient details"
                  className="grid size-8 place-items-center rounded-lg hover:bg-stone-100"
                >
                  👤
                </button>
                <Link
                  href={`/doctor/calendar?date=${item.startsAt.slice(0, 10)}`}
                  aria-label="Open in calendar"
                  title="Open in calendar"
                  className="grid size-8 place-items-center rounded-lg hover:bg-stone-100"
                >
                  🗓
                </Link>
                <button
                  type="button"
                  onClick={() => setDetailsId(item.id)}
                  className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  View details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {patientDialogAppointment && (
        <PatientDetailsDialog appointment={patientDialogAppointment} onClose={() => setPatientDialogId(undefined)} />
      )}

      {detailsAppointment && (
        <Modal title="Appointment details" onClose={() => setDetailsId(undefined)}>
          <AppointmentDetailsPanel appointment={detailsAppointment} onUpdated={handleUpdated} />
        </Modal>
      )}
    </div>
  );
}
