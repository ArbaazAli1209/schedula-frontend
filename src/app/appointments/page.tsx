"use client";

import { useState } from "react";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import type { StatusFilter } from "@/components/appointments/AppointmentFilters";

const TABS: StatusFilter[] = ["upcoming", "completed", "cancelled", "missed"];
const TAB_LABEL: Record<StatusFilter, string> = {
  all: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  missed: "Missed",
};

function MyAppointmentsContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<StatusFilter>("upcoming");
  const { appointments, status, refetch } = useAppointments({ patientEmail: user?.email, status: tab }, Boolean(user?.email));

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-[var(--line)] pb-7">
          <p className="text-sm font-medium text-[var(--brand)]">My Appointments</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your visits</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">Track upcoming visits and review what happened at past ones.</p>
        </header>

        <div className="py-8">
          <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter appointments">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  tab === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {TAB_LABEL[item]}
              </button>
            ))}
          </div>

          {status === "loading" && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading appointments">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl bg-stone-100" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
              <p className="font-medium">We couldn&apos;t load your appointments.</p>
              <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
                Try again
              </button>
            </div>
          )}

          {status === "ready" && appointments.length === 0 && (
            <div className="rounded-xl border border-[var(--line)] bg-white p-10 text-center">
              <p className="font-medium">No {TAB_LABEL[tab].toLowerCase()} appointments.</p>
            </div>
          )}

          {status === "ready" && appointments.length > 0 && (
            <ul className="flex flex-col gap-4" role="list">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MyAppointmentsPage() {
  return (
    <RequireAuth>
      <MyAppointmentsContent />
    </RequireAuth>
  );
}
