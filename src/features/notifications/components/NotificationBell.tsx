"use client";

import { useEffect, useRef, useState } from "react";
import type { Notification, NotificationAudience, NotificationKind } from "@/types/notification";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

const KIND_ICON: Record<NotificationKind, string> = {
  booking: "\u{1F4C5}", // 📅
  confirmation: "\u2705", // ✅
  reschedule: "\u{1F504}", // 🔄
  cancellation: "\u{1F6AB}", // 🚫
  reminder: "\u23F0", // ⏰
  missed: "\u26A0\uFE0F", // ⚠️
  completed: "\u{1F44D}", // 👍
  prescription: "\u{1F48A}", // 💊
};

const relativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
};

export function NotificationBell({ audience, recipient }: { audience: NotificationAudience; recipient: string | undefined }) {
  const { notifications, unread, markRead, markAllRead } = useNotifications(audience, recipient);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!recipient) return null;

  function handleSelect(notification: Notification) {
    if (!notification.read) markRead(notification.id);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-[1.1rem] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-xl border border-[var(--line)] bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-[var(--brand)] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-[var(--line)] overflow-y-auto" role="list">
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">No notifications yet.</li>
            )}
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-emerald-50/40 ${
                    notification.read ? "" : "bg-emerald-50/60"
                  }`}
                >
                  <span aria-hidden="true" className="mt-0.5 text-base">
                    {KIND_ICON[notification.kind]}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{notification.title}</span>
                      {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{notification.message}</span>
                    <span className="mt-1 block text-[11px] text-[var(--muted)]">{relativeTime(notification.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
