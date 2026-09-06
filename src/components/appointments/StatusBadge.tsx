import type { AppointmentDisplayStatus } from "@/types/appointment";

const STATUS_STYLES: Record<AppointmentDisplayStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  upcoming: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-violet-50 text-violet-800 ring-violet-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  missed: "bg-red-50 text-red-700 ring-red-200",
};

const STATUS_LABEL: Record<AppointmentDisplayStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  missed: "Missed",
};

export function StatusBadge({ status, className = "" }: { status: AppointmentDisplayStatus; className?: string }) {
  return (
    <span
      className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
