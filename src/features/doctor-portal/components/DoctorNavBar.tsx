"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";

const links = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/profile", label: "Profile" },
];

export function DoctorNavBar() {
  const { doctor, status, logout } = useDoctorAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/doctor/login");
  }

  if (pathname === "/doctor/login" || pathname === "/doctor/register") return null;

  return (
    <nav className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/doctor/dashboard" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--brand)] font-serif text-sm text-white">
              S
            </span>
            <span className="font-semibold tracking-tight">Schedula for doctors</span>
          </Link>
          <div className="hidden gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-emerald-50 text-[var(--brand-deep)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {status === "authenticated" && doctor ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">{doctor.fullName}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/doctor/login"
            className="rounded-lg bg-[var(--brand)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
