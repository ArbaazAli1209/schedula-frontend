import Link from "next/link";
import type { Booking } from "@/types/booking";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function BookingConfirmation({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-6 text-center" role="status">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-2xl text-[var(--brand-deep)]">
        ✓
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">Appointment requested</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We&apos;ve sent your request to {booking.doctorName}. You&apos;ll get a notification as soon as it&apos;s confirmed, and
        a copy has been sent to {booking.patientEmail}.
      </p>

      <dl className="mt-6 space-y-3 rounded-lg bg-stone-50 p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">Doctor</dt>
          <dd className="font-medium">{booking.doctorName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">Specialty</dt>
          <dd className="font-medium">{booking.specialty}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">When</dt>
          <dd className="font-medium">{dateTimeFormatter.format(new Date(booking.startsAt))}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">Duration</dt>
          <dd className="font-medium">{booking.durationMinutes} min</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--muted)]">Confirmation ID</dt>
          <dd className="font-medium">{booking.id}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/doctors"
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          Book another
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
