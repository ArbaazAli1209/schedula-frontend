import Link from "next/link";
import { DoctorRegistrationForm } from "@/features/doctor-portal/components/DoctorRegistrationForm";

export default function DoctorRegisterPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-[var(--line)] bg-white p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--brand)] font-serif text-xl text-white">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Join Schedula as a doctor</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Set up your Doctor Portal account to manage your schedule and appointments.
            </p>
          </div>
        </div>

        <DoctorRegistrationForm />

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have a doctor account?{" "}
          <Link href="/doctor/login" className="font-semibold text-[var(--brand)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
