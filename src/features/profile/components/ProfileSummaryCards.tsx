"use client";

import { useEffect, useState } from "react";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { getTestReports } from "@/features/profile/api/profileClient";

type CardStatus = "loading" | "ready" | "error";

function SummaryCard({ label, value, status }: { label: string; value: number; status: CardStatus }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {status === "loading" ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-stone-100 align-middle" /> : status === "error" ? "—" : value}
      </p>
    </div>
  );
}

/** Summary cards for the User Portal profile page: Total Prescriptions, Completed Appointments, Test Reports. */
export function ProfileSummaryCards({ patientEmail }: { patientEmail: string | undefined }) {
  const { appointments, status: appointmentsStatus } = useAppointments(
    { patientEmail, status: "completed" },
    Boolean(patientEmail),
  );

  const [reportsCount, setReportsCount] = useState(0);
  const [reportsStatus, setReportsStatus] = useState<CardStatus>("loading");

  useEffect(() => {
    if (!patientEmail) return;
    let cancelled = false;
    setReportsStatus("loading");
    getTestReports(patientEmail)
      .then((data) => {
        if (cancelled) return;
        setReportsCount(data.length);
        setReportsStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setReportsStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [patientEmail]);

  const prescriptionsCount = appointments.filter((item) => item.prescription).length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="Total Prescriptions" value={prescriptionsCount} status={appointmentsStatus} />
      <SummaryCard label="Completed Appointments" value={appointments.length} status={appointmentsStatus} />
      <SummaryCard label="Test Reports" value={reportsCount} status={reportsStatus} />
    </div>
  );
}
