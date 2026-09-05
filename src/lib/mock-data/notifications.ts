import type { Notification } from "@/types/notification";

/**
 * In-memory mock store. Resets whenever the dev server restarts, same as
 * `@/lib/mock-data/appointments`. Notifications are created by
 * `@/lib/utils/notifications` whenever an appointment transitions state.
 */
export const notifications: Notification[] = [
  {
    id: "ntf-seed-1",
    audience: "user",
    recipient: "maya@schedula.dev",
    kind: "prescription",
    title: "Prescription available",
    message: "Dr. Leah Fischer added a prescription for your Aug 15 visit.",
    appointmentId: "apt-1049",
    createdAt: "2026-08-15T10:05:00.000Z",
    read: false,
  },
  {
    id: "ntf-seed-2",
    audience: "doctor",
    recipient: "Dr. Leah Fischer",
    kind: "booking",
    title: "New booking request",
    message: "Marcus Webb requested a new patient intake appointment.",
    appointmentId: "apt-1047",
    createdAt: "2026-09-01T10:00:00.000Z",
    read: false,
  },
];
