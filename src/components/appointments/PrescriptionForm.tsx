"use client";

import { useState } from "react";
import type { Appointment } from "@/types/appointment";
import type { Prescription, PrescriptionMedication } from "@/types/prescription";
import { issuePrescription } from "@/features/appointments/api/appointmentsClient";
import { Modal } from "@/components/ui/Modal";

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onSaved: (prescription: Prescription) => void;
};

const EMPTY_MED: PrescriptionMedication = { name: "", dosage: "", duration: "", instructions: "" };

/** Doctor-side form for issuing/editing a prescription on a completed visit. */
export function PrescriptionForm({ appointment, onClose, onSaved }: Props) {
  const [diagnosis, setDiagnosis] = useState(appointment.prescription?.diagnosis ?? "");
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    appointment.prescription?.medications.length ? appointment.prescription.medications : [{ ...EMPTY_MED }],
  );
  const [notes, setNotes] = useState(appointment.prescription?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMed(index: number, field: keyof PrescriptionMedication, value: string) {
    setMedications((prev) => prev.map((med, i) => (i === index ? { ...med, [field]: value } : med)));
  }

  async function handleSubmit() {
    if (!diagnosis.trim()) {
      setError("Diagnosis is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const cleaned = medications.filter((med) => med.name.trim());
      const prescription = await issuePrescription(appointment.id, {
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        medications: cleaned,
      });
      onSaved(prescription);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this prescription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={appointment.prescription ? "Edit prescription" : "Add prescription"} onClose={onClose}>
      <p className="text-sm text-[var(--muted)]">For {appointment.patient.name}&apos;s visit.</p>

      <div className="mt-4">
        <label htmlFor="rx-diagnosis" className="text-sm font-medium text-[var(--ink)]">
          Diagnosis
        </label>
        <input
          id="rx-diagnosis"
          value={diagnosis}
          onChange={(event) => setDiagnosis(event.target.value)}
          placeholder="e.g. Acute bronchitis"
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div className="mt-4 space-y-3">
        {medications.map((med, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--line)] p-3">
            <input
              value={med.name}
              onChange={(event) => updateMed(index, "name", event.target.value)}
              placeholder="Medication"
              className="col-span-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <input
              value={med.dosage}
              onChange={(event) => updateMed(index, "dosage", event.target.value)}
              placeholder="Dosage"
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <input
              value={med.duration}
              onChange={(event) => updateMed(index, "duration", event.target.value)}
              placeholder="Duration"
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <input
              value={med.instructions}
              onChange={(event) => updateMed(index, "instructions", event.target.value)}
              placeholder="Instructions"
              className="col-span-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setMedications((prev) => [...prev, { ...EMPTY_MED }])}
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          + Add another medication
        </button>
      </div>

      <div className="mt-4">
        <label htmlFor="rx-notes" className="text-sm font-medium text-[var(--ink)]">
          Notes
        </label>
        <textarea
          id="rx-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="Care instructions, follow-up, etc."
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
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
          disabled={submitting}
          onClick={handleSubmit}
          className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save prescription"}
        </button>
      </div>
    </Modal>
  );
}
