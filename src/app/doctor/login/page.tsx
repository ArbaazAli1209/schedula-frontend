import { Suspense } from "react";
import Link from "next/link";
import { DoctorLoginForm } from "@/features/doctor-portal/components/DoctorLoginForm";

export default function DoctorLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--brand)] font-serif text-xl text-white">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Doctor Portal sign in</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Manage your schedule and appointments.</p>
          </div>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-stone-100" />}>
          <DoctorLoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          New to Schedula?{" "}
          <Link href="/doctor/register" className="font-semibold text-[var(--brand)] hover:underline">
            Create a doctor account
          </Link>
        </p>
      </div>
    </main>
  );
}
