"use client";

import type { Appointment } from "@/types/appointment";
import type { Prescription } from "@/types/prescription";
import { buildPrescriptionPdf } from "@/lib/utils/prescriptionPdf";
import { Modal } from "@/components/ui/Modal";

type Props = {
  appointment: Appointment;
  prescription: Prescription;
  onClose: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function PrescriptionView({ appointment, prescription, onClose }: Props) {
  function handleDownload() {
    const blob = buildPrescriptionPdf(appointment, prescription);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescription-${appointment.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal title="Prescription" onClose={onClose}>
      <p className="text-sm text-[var(--muted)]">
        {appointment.clinician} · {dateFormatter.format(new Date(prescription.issuedAt))}
      </p>

      {prescription.diagnosis && (
        <div className="mt-4">
          <p className="text-sm font-medium">Diagnosis</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{prescription.diagnosis}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm font-medium">Medications</p>
        {prescription.medications.length === 0 ? (
          <p className="mt-1 text-sm text-[var(--muted)]">No medications listed.</p>
        ) : (
          <ul className="mt-2 space-y-2" role="list">
            {prescription.medications.map((med, index) => (
              <li key={index} className="rounded-lg border border-[var(--line)] p-3 text-sm">
                <p className="font-semibold">
                  {med.name} <span className="font-normal text-[var(--muted)]">· {med.dosage}{med.duration ? ` · ${med.duration}` : ""}</span>
                </p>
                <p className="mt-0.5 text-[var(--muted)]">{med.instructions}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {prescription.notes && (
        <div className="mt-4">
          <p className="text-sm font-medium">Notes</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{prescription.notes}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
        >
          Download PDF
        </button>
      </div>
    </Modal>
  );
}
