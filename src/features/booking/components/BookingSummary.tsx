"use client";

import { useState, type FormEvent } from "react";
import type { Doctor, DoctorSlot } from "@/types/doctor";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Props = {
  doctor: Doctor;
  slot: DoctorSlot;
  initialName: string;
  initialEmail: string;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onConfirm: (patientName: string, patientEmail: string) => void;
};

export function BookingSummary({
  doctor,
  slot,
  initialName,
  initialEmail,
  submitting,
  submitError,
  onBack,
  onConfirm,
}: Props) {
  const [patientName, setPatientName] = useState(initialName);
  const [patientEmail, setPatientEmail] = useState(initialEmail);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: { name?: string; email?: string } = {};
    if (!patientName.trim()) errors.name = "Your name is required.";
    if (!patientEmail.trim()) errors.email = "Your email is required.";
    else if (!EMAIL_PATTERN.test(patientEmail.trim())) errors.email = "Enter a valid email address.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onConfirm(patientName.trim(), patientEmail.trim());
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-6">
      <p className="text-sm font-medium text-[var(--muted)]">Confirm appointment</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-[var(--brand-deep)]">
          {doctor.initials}
        </span>
        <div>
          <p className="font-semibold">{doctor.name}</p>
          <p className="text-sm text-[var(--muted)]">{doctor.specialty}</p>
        </div>
      </div>
      <p className="mt-4 text-sm">
        <span className="font-medium">{dateTimeFormatter.format(new Date(slot.startsAt))}</span>{" "}
        <span className="text-[var(--muted)]">· {slot.durationMinutes} min · {doctor.location}</span>
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="patientName" className="text-sm font-medium text-[var(--ink)]">
            Your name
          </label>
          <input
            id="patientName"
            value={patientName}
            onChange={(event) => setPatientName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="Full name"
          />
          {fieldErrors.name && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="patientEmail" className="text-sm font-medium text-[var(--ink)]">
            Your email
          </label>
          <input
            id="patientEmail"
            type="email"
            value={patientEmail}
            onChange={(event) => setPatientEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="you@example.com"
          />
          {fieldErrors.email && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {submitError}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Booking…" : "Confirm appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
