"use client";

import type { Appointment } from "@/types/appointment";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { computeDisplayStatus } from "@/lib/utils/appointments";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function PatientDetailsDialog({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  return (
    <Modal title="Patient details" onClose={onClose}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-base font-semibold text-[var(--brand-deep)]">
          {appointment.patient.initials}
        </span>
        <div>
          <h3 className="font-semibold">{appointment.patient.name}</h3>
          <p className="text-sm text-[var(--muted)]">
            {appointment.patient.age > 0 ? `${appointment.patient.age} years old` : "Age not provided"}
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        {appointment.patient.email && (
          <div>
            <dt className="text-[var(--muted)]">Contact</dt>
            <dd className="mt-1 font-medium">{appointment.patient.email}</dd>
          </div>
        )}
        <div>
          <dt className="text-[var(--muted)]">Visit reason</dt>
          <dd className="mt-1 font-medium">{appointment.reason}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Appointment</dt>
          <dd className="mt-1 font-medium">
            {dateTimeFormatter.format(new Date(appointment.startsAt))} · {appointment.type === "video" ? "Video" : "In-person"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={computeDisplayStatus(appointment)} />
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
