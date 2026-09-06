import Link from "next/link";
import type { Doctor } from "@/types/doctor";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const nextSlot = doctor.slots[0];
  const nextSlotLabel = nextSlot
    ? new Intl.DateTimeFormat("en", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(nextSlot.startsAt))
    : null;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-[var(--brand-deep)]">
          {doctor.initials}
        </span>
        <div>
          <p className="font-semibold">{doctor.name}</p>
          <p className="text-sm text-[var(--muted)]">
            {doctor.specialty} · {doctor.experienceYears} yrs experience · ★ {doctor.rating.toFixed(1)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{doctor.location}</p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        {nextSlotLabel ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
            Next slot {nextSlotLabel}
          </span>
        ) : (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200">
            No slots open
          </span>
        )}
        <Link
          href={`/doctors/${doctor.id}/book`}
          aria-disabled={!nextSlot}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
            nextSlot
              ? "bg-[var(--brand)] hover:bg-[var(--brand-deep)]"
              : "pointer-events-none bg-stone-300"
          }`}
        >
          Book appointment
        </Link>
      </div>
    </li>
  );
}
