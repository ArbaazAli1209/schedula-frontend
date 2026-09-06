"use client";

import { useState } from "react";
import Link from "next/link";
import type { Appointment } from "@/types/appointment";
import { computeDisplayStatus } from "@/lib/utils/appointments";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { PrescriptionView } from "@/components/appointments/PrescriptionView";
import { ReviewForm } from "@/components/appointments/ReviewForm";
import { buildPrescriptionPdf } from "@/lib/utils/prescriptionPdf";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Patient-facing appointment card for "My Appointments" — shows doctor/date/type/status, plus Completed-only actions. */
export function AppointmentCard({ appointment, onChanged }: { appointment: Appointment; onChanged?: (appointment: Appointment) => void }) {
  const [showPrescription, setShowPrescription] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [current, setCurrent] = useState(appointment);

  const isCompleted = current.status === "completed";

  function handleDownload() {
    if (!current.prescription) return;
    const blob = buildPrescriptionPdf(current, current.prescription);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescription-${current.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <li className="rounded-xl border border-[var(--line)] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{current.clinician}</p>
          <p className="text-sm text-[var(--muted)]">{current.specialty}</p>
          <p className="mt-1 text-sm">
            {dateTimeFormatter.format(new Date(current.startsAt))} · {current.type === "video" ? "Video" : "In-person"}
          </p>
        </div>
        <StatusBadge status={computeDisplayStatus(current)} />
      </div>

      {isCompleted && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
          <span
            className={`text-xs font-medium ${current.prescription ? "text-emerald-700" : "text-[var(--muted)]"}`}
          >
            {current.prescription ? "Prescription available" : "Prescription not available"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {current.prescription && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPrescription(true)}
                  className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  View prescription
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  Download PDF
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {current.review ? "Edit review" : "Review doctor"}
            </button>
            <Link
              href={`/doctors/${current.doctorId}/book`}
              className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
            >
              Rebook
            </Link>
          </div>
        </div>
      )}

      {showPrescription && current.prescription && (
        <PrescriptionView appointment={current} prescription={current.prescription} onClose={() => setShowPrescription(false)} />
      )}
      {showReview && (
        <ReviewForm
          appointment={current}
          onClose={() => setShowReview(false)}
          onSubmitted={(review) => {
            const updated = { ...current, review };
            setCurrent(updated);
            onChanged?.(updated);
          }}
        />
      )}
    </li>
  );
}
