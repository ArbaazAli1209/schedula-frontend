"use client";

import { useCallback, useEffect, useState } from "react";
import type { Notification, NotificationAudience } from "@/types/notification";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notificationsClient";

/** Polls the mock notification store so both portals feel live without a real push channel. */
const POLL_MS = 15000;

export function useNotifications(audience: NotificationAudience, recipient: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(() => {
    if (!recipient) return;
    getNotifications(audience, recipient)
      .then(({ data, unread: unreadCount }) => {
        setNotifications(data);
        setUnread(unreadCount);
      })
      .catch(() => {
        /* silent — the bell just stays as-is until the next poll */
      });
  }, [audience, recipient]);

  useEffect(() => {
    load();
    if (!recipient) return;
    const interval = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(interval);
  }, [load, recipient]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      setUnread((prev) => Math.max(0, prev - 1));
      await markNotificationRead(id);
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!recipient) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnread(0);
    await markAllNotificationsRead(audience, recipient);
  }, [audience, recipient]);

  return { notifications, unread, refetch: load, markRead, markAllRead };
}
