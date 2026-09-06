"use client";

import { useState } from "react";
import type { Appointment } from "@/types/appointment";
import { computeDisplayStatus, isPast } from "@/lib/utils/appointments";
import { confirmAppointment, declineAppointment, cancelAppointment, markCompleted, markMissed } from "@/features/appointments/api/appointmentsClient";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { ConfirmDialog } from "@/components/appointments/ConfirmDialog";
import { RescheduleDialog } from "@/components/appointments/RescheduleDialog";
import { PrescriptionForm } from "@/components/appointments/PrescriptionForm";
import { PrescriptionView } from "@/components/appointments/PrescriptionView";

const timeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type DialogState =
  | { kind: "none" }
  | { kind: "decline" }
  | { kind: "cancel" }
  | { kind: "reschedule" }
  | { kind: "complete" }
  | { kind: "missed" }
  | { kind: "prescription" }
  | { kind: "view-prescription" };

/** Doctor Portal appointment details + status-specific actions (Confirm/Decline, Reschedule/Cancel, Mark Completed/Missed). */
export function AppointmentDetailsPanel({
  appointment,
  onUpdated,
}: {
  appointment: Appointment;
  onUpdated: (appointment: Appointment) => void;
}) {
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  const [busy, setBusy] = useState(false);
  const displayStatus = computeDisplayStatus(appointment);
  const canMarkOutcome = appointment.status === "confirmed" && isPast(appointment);

  async function runQuick(action: () => Promise<Appointment>) {
    setBusy(true);
    try {
      const updated = await action();
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-[var(--brand-deep)]">
          {appointment.patient.initials}
        </span>
        <div>
          <h3 className="font-semibold">{appointment.patient.name}</h3>
          <p className="text-sm text-[var(--muted)]">{appointment.patient.age > 0 ? `${appointment.patient.age} years old` : "—"}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Visit</dt>
          <dd className="mt-1 font-medium">{appointment.reason}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Time &amp; room</dt>
          <dd className="mt-1 font-medium">
            {timeFormatter.format(new Date(appointment.startsAt))} · {appointment.room}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Type</dt>
          <dd className="mt-1 font-medium capitalize">{appointment.type}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={displayStatus} />
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2">
        {appointment.status === "pending" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => runQuick(() => confirmAppointment(appointment.id))}
              className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"
            >
              Confirm appointment
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDialog({ kind: "decline" })}
              className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Decline
            </button>
          </>
        )}

        {appointment.status === "confirmed" && !canMarkOutcome && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDialog({ kind: "reschedule" })}
              className="w-full rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDialog({ kind: "cancel" })}
              className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        )}

        {canMarkOutcome && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDialog({ kind: "complete" })}
              className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"
            >
              Mark as completed
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDialog({ kind: "missed" })}
              className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Mark as missed
            </button>
          </>
        )}

        {appointment.status === "completed" && (
          <button
            type="button"
            onClick={() => setDialog({ kind: appointment.prescription ? "view-prescription" : "prescription" })}
            className="w-full rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            {appointment.prescription ? "View prescription" : "Add prescription"}
          </button>
        )}

        {(appointment.status === "cancelled" || appointment.status === "missed") && (
          <p className="rounded-lg bg-stone-50 px-4 py-2.5 text-center text-sm text-[var(--muted)]">Read-only</p>
        )}
      </div>

      {dialog.kind === "decline" && (
        <ConfirmDialog
          title="Decline this request?"
          description={`${appointment.patient.name} will be notified so they can pick another time.`}
          confirmLabel="Decline request"
          onConfirm={async () => onUpdated(await declineAppointment(appointment.id))}
          onClose={() => setDialog({ kind: "none" })}
        />
      )}
      {dialog.kind === "cancel" && (
        <ConfirmDialog
          title="Cancel this appointment?"
          description={`${appointment.patient.name} will be notified that this visit is cancelled.`}
          confirmLabel="Cancel appointment"
          onConfirm={async () => onUpdated(await cancelAppointment(appointment.id))}
          onClose={() => setDialog({ kind: "none" })}
        />
      )}
      {dialog.kind === "complete" && (
        <ConfirmDialog
          title="Mark as completed?"
          description="This visit becomes read-only and the patient can view it in Completed appointments."
          confirmLabel="Mark completed"
          destructive={false}
          onConfirm={async () => onUpdated(await markCompleted(appointment.id))}
          onClose={() => setDialog({ kind: "none" })}
        />
      )}
      {dialog.kind === "missed" && (
        <ConfirmDialog
          title="Mark as missed?"
          description={`${appointment.patient.name} will be notified that this appointment was missed.`}
          confirmLabel="Mark missed"
          onConfirm={async () => onUpdated(await markMissed(appointment.id))}
          onClose={() => setDialog({ kind: "none" })}
        />
      )}
      {dialog.kind === "reschedule" && (
        <RescheduleDialog appointment={appointment} onClose={() => setDialog({ kind: "none" })} onRescheduled={onUpdated} />
      )}
      {dialog.kind === "prescription" && (
        <PrescriptionForm
          appointment={appointment}
          onClose={() => setDialog({ kind: "none" })}
          onSaved={(prescription) => onUpdated({ ...appointment, prescription })}
        />
      )}
      {dialog.kind === "view-prescription" && appointment.prescription && (
        <PrescriptionView
          appointment={appointment}
          prescription={appointment.prescription}
          onClose={() => setDialog({ kind: "none" })}
        />
      )}
    </div>
  );
}
