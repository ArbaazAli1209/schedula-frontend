"use client";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { ProfileDetailsForm } from "@/features/profile/components/ProfileDetailsForm";
import { ProfileSummaryCards } from "@/features/profile/components/ProfileSummaryCards";

function ProfileContent() {
  const { user } = useAuth();
  const { profile, status, actionError, refetch, save } = useProfile(user?.id);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-[var(--line)] pb-7">
          <p className="text-sm font-medium text-[var(--brand)]">My Profile</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your details</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Keep your personal, medical, and insurance details up to date.
          </p>
        </header>

        <div className="py-8">
          <ProfileSummaryCards patientEmail={user?.email} />
        </div>

        {status === "loading" && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
            <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-40 animate-pulse rounded-xl bg-stone-100" />
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
            <p className="font-medium">We couldn&apos;t load your profile.</p>
            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[var(--brand)] underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && profile && (
          <div className="space-y-4">
            {actionError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                {actionError}
              </p>
            )}
            <div className="rounded-xl border border-[var(--line)] bg-white p-5">
              <ProfileDetailsForm profile={profile} onSave={save} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
