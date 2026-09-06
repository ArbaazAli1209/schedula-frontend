"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChat } from "@/features/chat/hooks/useChat";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

/** AI assistant for the User Portal. Hidden on Doctor Portal routes and the login screen. */
export function UserChatWidget() {
  const pathname = usePathname();
  const { user, status } = useAuth();
  const { messages, sending, error, sendMessage } = useChat("user", user?.name);

  if (pathname === "/login" || pathname === "/doctor" || pathname.startsWith("/doctor/")) return null;
  if (status !== "authenticated" || !user) return null;

  return (
    <ChatPanel
      title="Schedula Assistant"
      subtitle="Ask about booking, prescriptions, or your profile"
      placeholder="Hi! Ask me anything about booking appointments, your prescriptions, or your profile."
      messages={messages}
      sending={sending}
      error={error}
      onSend={sendMessage}
    />
  );
}
