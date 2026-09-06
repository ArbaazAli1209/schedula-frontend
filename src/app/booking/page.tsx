"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy standalone booking flow — superseded by the doctor-scoped flow at
 * `/doctors/[doctorId]/book` (see `@/features/booking`). Kept as a redirect
 * so any old links still land somewhere useful instead of a broken page.
 */
export default function LegacyBookingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/doctors");
  }, [router]);
  return null;
}
