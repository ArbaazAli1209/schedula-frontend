import Link from "next/link";

const actions = [
  {
    href: "/doctor/profile",
    title: "Update profile & availability",
    description: "Edit your details and manage bookable slots.",
  },
  {
    href: "/doctor/appointments",
    title: "View all appointments",
    description: "See your full schedule with status filters.",
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
