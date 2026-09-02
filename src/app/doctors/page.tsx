import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { DoctorList } from "@/features/doctors/components/DoctorList";

export default function DoctorsPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <header className="border-b border-[var(--line)] pb-7">
            <p className="text-sm font-medium text-[var(--brand)]">Find a doctor</p>
            <h1 id="doctors-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Book an appointment
            </h1>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              Browse available doctors and pick a time that works for you.
            </p>
          </header>
          <div className="py-8">
            <DoctorList />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
