"use client";

import { useMemo, useState } from "react";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { DoctorCard } from "@/features/doctors/components/DoctorCard";

const ALL = "all";

export function DoctorList() {
  const { doctors, status } = useDoctors();
  const [specialty, setSpecialty] = useState<string>(ALL);

  const specialties = useMemo(
    () => [ALL, ...Array.from(new Set(doctors.map((doctor) => doctor.specialty)))],
    [doctors],
  );
  const visible = useMemo(
    () => (specialty === ALL ? doctors : doctors.filter((doctor) => doctor.specialty === specialty)),
    [doctors, specialty],
  );

  return (
    <section aria-labelledby="doctors-title">
      {status === "ready" && specialties.length > 2 && (
        <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Filter by specialty">
          {specialties.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSpecialty(item)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                specialty === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {item === ALL ? "All specialties" : item}
            </button>
          ))}
        </div>
      )}

      {status === "loading" && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading doctors">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl bg-stone-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center" role="alert">
          <p className="font-medium">We couldn&apos;t load the doctor directory.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-semibold text-[var(--brand)] underline"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <ul className="flex flex-col gap-4" role="list">
          {visible.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </ul>
      )}

      {status === "ready" && visible.length === 0 && (
        <div className="rounded-xl border border-[var(--line)] bg-white p-10 text-center">
          <p className="font-medium">No doctors match this specialty.</p>
          <button type="button" onClick={() => setSpecialty(ALL)} className="mt-2 text-sm font-semibold text-[var(--brand)]">
            Show all doctors
          </button>
        </div>
      )}
    </section>
  );
}
