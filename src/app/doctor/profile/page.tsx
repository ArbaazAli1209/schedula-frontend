"use client";

import { RequireDoctorAuth } from "@/features/doctor-portal/components/RequireDoctorAuth";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { useDoctorProfile } from "@/features/doctor-portal/hooks/useDoctorProfile";
import { DoctorProfileDetailsForm } from "@/features/doctor-portal/components/DoctorProfileDetailsForm";
import { DoctorSlotsManager } from "@/features/doctor-portal/components/DoctorSlotsManager";

function ProfileContent() {
  const { doctor } = useDoctorAuth();
  const { profile, status, actionError, refetch, saveDetails, addSlots, removeSlot } = useDoctorProfile(doctor?.id);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-[var(--line)] pb-7">
          <p className="text-sm font-medium text-[var(--brand)]">Doctor Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Profile &amp; availability</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            This is what patients see in the doctor directory, plus the times they can book you for.
          </p>
        </header>

        {status === "loading" && (
          <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading profile">
            <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
            <p className="font-medium">We couldn&apos;t load your profile.</p>
            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && profile && (
          <div className="mt-8 space-y-8">
            {actionError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200"
              >
                {actionError}
              </p>
            )}

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Profile details</h2>
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-5">
                <DoctorProfileDetailsForm profile={profile} onSave={saveDetails} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Availability</h2>
              <div className="mt-4">
                <DoctorSlotsManager slots={profile.slots} onAddSlots={addSlots} onRemoveSlot={removeSlot} />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DoctorProfilePage() {
  return (
    <RequireDoctorAuth>
      <ProfileContent />
    </RequireDoctorAuth>
  );
}
