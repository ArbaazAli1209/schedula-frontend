"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";

export function RequireDoctorAuth({ children }: { children: React.ReactNode }) {
  const { status } = useDoctorAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname);
      router.replace(`/doctor/login?next=${next}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8" aria-busy="true" aria-label="Checking session">
        <div className="h-24 animate-pulse rounded-lg bg-stone-100" />
      </div>
    );
  }

  return <>{children}</>;
}
