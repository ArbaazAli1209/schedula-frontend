import { notifications } from "@/lib/mock-data/notifications";
import type { Notification, NotificationAudience, NotificationKind } from "@/types/notification";

type CreateNotificationInput = {
  audience: NotificationAudience;
  recipient: string;
  kind: NotificationKind;
  title: string;
  message: string;
  appointmentId?: string;
};

/** Pushes a new notification for either portal. Called from route handlers on any appointment state change. */
export function createNotification(input: CreateNotificationInput): Notification {
  const notification: Notification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  };
  notifications.unshift(notification);
  return notification;
}

export function listNotifications(audience: NotificationAudience, recipient: string): Notification[] {
  return notifications
    .filter((item) => item.audience === audience && item.recipient === recipient)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function findNotification(id: string): Notification | undefined {
  return notifications.find((item) => item.id === id);
}
