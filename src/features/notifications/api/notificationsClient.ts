import type { Notification, NotificationAudience } from "@/types/notification";

export async function getNotifications(audience: NotificationAudience, recipient: string): Promise<{ data: Notification[]; unread: number }> {
  const response = await fetch(
    `/api/notifications?audience=${audience}&recipient=${encodeURIComponent(recipient)}`,
  );
  if (!response.ok) throw new Error("Unable to load notifications.");
  const body: { data: Notification[]; meta: { unread: number } } = await response.json();
  return { data: body.data, unread: body.meta.unread };
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`/api/notifications/${id}`, { method: "PATCH" });
}

export async function markAllNotificationsRead(audience: NotificationAudience, recipient: string): Promise<void> {
  await fetch("/api/notifications/read-all", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audience, recipient }),
  });
}
