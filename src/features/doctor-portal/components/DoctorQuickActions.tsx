import Link from "next/link";

const actions = [
  {
    href: "/doctor/calendar",
    title: "Open calendar",
    description: "Day, week and month views of your schedule.",
  },
  {
    href: "/doctor/appointments",
    title: "View all appointments",
    description: "See your full schedule with status filters.",
  },
  {
    href: "/doctor/prescriptions",
    title: "Manage prescriptions",
    description: "View, create, and edit prescriptions for completed visits.",
  },
  {
    href: "/doctor/profile",
    title: "Update profile & availability",
    description: "Edit your details and manage bookable slots.",
  },
];

export function DoctorQuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="rounded-xl border border-[var(--line)] bg-white p-5 hover:border-[var(--brand)]"
        >
          <p className="font-semibold">{action.title}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}
