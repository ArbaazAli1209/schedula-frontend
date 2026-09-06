"use client";

import { RequireDoctorAuth } from "@/features/doctor-portal/components/RequireDoctorAuth";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { DoctorQuickActions } from "@/features/doctor-portal/components/DoctorQuickActions";
import { DoctorAppointmentsPanel } from "@/features/doctor-portal/components/DoctorAppointmentsPanel";

function DashboardContent() {
  const { doctor } = useDoctorAuth();

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[var(--line)] pb-7">
          <p className="text-sm font-medium text-[var(--brand)]">Doctor Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {doctor?.fullName}
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            {doctor?.specialty} · {doctor?.experienceYears} yrs experience
          </p>
        </header>

        <section className="py-8">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <div className="mt-4">
            <DoctorQuickActions />
          </div>
        </section>

        <section className="pb-10">
          <DoctorAppointmentsPanel clinicianName={doctor?.fullName} />
        </section>
      </div>
    </main>
  );
}

export default function DoctorDashboardPage() {
  return (
    <RequireDoctorAuth>
      <DashboardContent />
    </RequireDoctorAuth>
  );
}
