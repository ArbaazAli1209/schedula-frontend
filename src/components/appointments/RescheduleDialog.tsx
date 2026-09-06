"use client";

import { useEffect, useState } from "react";
import type { Appointment } from "@/types/appointment";
import type { Doctor, DoctorSlot } from "@/types/doctor";
import { getDoctor } from "@/features/doctors/api/doctorsClient";
import { rescheduleAppointment } from "@/features/appointments/api/appointmentsClient";
import { SlotPicker } from "@/features/booking/components/SlotPicker";
import { Modal } from "@/components/ui/Modal";

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onRescheduled: (appointment: Appointment) => void;
};

export function RescheduleDialog({ appointment, onClose, onRescheduled }: Props) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getDoctor(appointment.doctorId)
      .then(setDoctor)
      .catch(() => setLoadError("Couldn't load available slots for this doctor."));
  }, [appointment.doctorId]);

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await rescheduleAppointment(appointment.id, selectedSlot.startsAt);
      onRescheduled(updated);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to reschedule this appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Reschedule appointment" onClose={onClose}>
      <p className="text-sm text-[var(--muted)]">
        Moving {appointment.patient.name}&apos;s visit. Pick a new open slot below — the patient will be notified.
      </p>

      {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}

      {!doctor && !loadError && (
        <div className="mt-4 h-24 animate-pulse rounded-lg bg-stone-100" aria-busy="true" aria-label="Loading slots" />
      )}

      {doctor && (
        <div className="mt-4">
          <SlotPicker slots={doctor.slots} selected={selectedSlot} onSelect={setSelectedSlot} />
        </div>
      )}

      {submitError && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedSlot || submitting}
          onClick={handleConfirm}
          className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Confirm new time"}
        </button>
      </div>
    </Modal>
  );
}
