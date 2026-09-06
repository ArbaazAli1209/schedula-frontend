"use client";

import { usePathname } from "next/navigation";
import { useDoctorAuth } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { useChat } from "@/features/chat/hooks/useChat";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

/** AI assistant for the Doctor Portal. Hidden on the doctor sign-in/register screens. */
export function DoctorChatWidget() {
  const pathname = usePathname();
  const { doctor, status } = useDoctorAuth();
  const { messages, sending, error, sendMessage } = useChat("doctor", doctor?.fullName);

  if (pathname === "/doctor/login" || pathname === "/doctor/register") return null;
  if (status !== "authenticated" || !doctor) return null;

  return (
    <ChatPanel
      title="Schedula Assistant"
      subtitle="Ask about appointments, prescriptions, or your profile"
      placeholder="Hi Doctor! Ask me anything about managing appointments, prescriptions, or your profile."
      messages={messages}
      sending={sending}
      error={error}
      onSend={sendMessage}
    />
  );
}
