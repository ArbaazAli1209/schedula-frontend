"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequireDoctorAuth } from "@/features/doctor-portal/components/RequireDoctorAuth";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { DoctorCalendar } from "@/components/calendar/DoctorCalendar";

function CalendarContent() {
  const { doctor } = useDoctorAuth();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? undefined;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[var(--line)] pb-7">
          <p className="text-sm font-medium text-[var(--brand)]">Doctor Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Your appointments and open slots. Drag a confirmed visit onto an open slot to reschedule it.
          </p>
        </header>
        <div className="py-8">
          <DoctorCalendar doctorId={doctor?.id} clinicianName={doctor?.fullName} initialDate={initialDate} />
        </div>
      </div>
    </main>
  );
}

export default function DoctorCalendarPage() {
  return (
    <RequireDoctorAuth>
      <Suspense fallback={null}>
        <CalendarContent />
      </Suspense>
    </RequireDoctorAuth>
  );
}
