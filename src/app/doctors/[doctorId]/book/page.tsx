"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { DoctorSlot } from "@/types/doctor";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDoctor } from "@/features/doctors/hooks/useDoctor";
import { useCreateBooking } from "@/features/booking/hooks/useCreateBooking";
import { SlotPicker } from "@/features/booking/components/SlotPicker";
import { BookingSummary } from "@/features/booking/components/BookingSummary";
import { BookingConfirmation } from "@/features/booking/components/BookingConfirmation";

type Step = "select" | "confirm" | "done";

function BookingFlow() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = params.doctorId;
  const { user } = useAuth();
  const { doctor, status, refetch } = useDoctor(doctorId);
  const { submit, booking, submitting, error } = useCreateBooking();

  const [step, setStep] = useState<Step>("select");
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);

  async function handleConfirm(patientName: string, patientEmail: string) {
    if (!doctor || !selectedSlot) return;
    const result = await submit({
      doctorId: doctor.id,
      startsAt: selectedSlot.startsAt,
      patientName,
      patientEmail,
    });
    if (result) {
      setStep("done");
    } else {
      // The slot may have just been taken by someone else — refresh availability.
      refetch();
      setSelectedSlot(null);
      setStep("select");
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/doctors" className="text-sm font-semibold text-[var(--brand)] hover:underline">
            ← Back to doctors
          </Link>
          {step !== "done" && doctor && (
            <ol className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <li className={step === "select" ? "text-[var(--brand-deep)]" : ""}>1. Slot</li>
              <li aria-hidden="true">·</li>
              <li className={step === "confirm" ? "text-[var(--brand-deep)]" : ""}>2. Confirm</li>
            </ol>
          )}
        </div>

        {status === "loading" && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading doctor">
            <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
            <p className="font-medium">We couldn&apos;t load this doctor.</p>
            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && doctor && step === "select" && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-[var(--brand-deep)]">
                {doctor.initials}
              </span>
              <div>
                <p className="font-semibold">{doctor.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {doctor.specialty} · {doctor.experienceYears} yrs experience
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">{doctor.bio}</p>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Choose an available time</p>
              <SlotPicker slots={doctor.slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            </div>

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep("confirm")}
              className="mt-6 w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        )}

        {status === "ready" && doctor && selectedSlot && step === "confirm" && (
          <BookingSummary
            doctor={doctor}
            slot={selectedSlot}
            initialName={user?.name ?? ""}
            initialEmail={user?.email ?? ""}
            submitting={submitting}
            submitError={error}
            onBack={() => setStep("select")}
            onConfirm={handleConfirm}
          />
        )}

        {step === "done" && booking && <BookingConfirmation booking={booking} />}
      </div>
    </main>
  );
}

export default function BookAppointmentPage() {
  return (
    <RequireAuth>
      <BookingFlow />
    </RequireAuth>
  );
}
