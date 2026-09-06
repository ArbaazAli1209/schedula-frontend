"use client";

import { useCallback, useState } from "react";
import type { ChatAudience, ChatMessage } from "@/types/chat";
import { sendChatMessage } from "@/features/chat/api/chatClient";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

export function useChat(audience: ChatAudience, participantName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || sending) return;

      const userMessage: ChatMessage = { id: nextId(), role: "user", content };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setSending(true);
      setError(null);

      try {
        const reply = await sendChatMessage(nextMessages, audience, participantName);
        setMessages((current) => [...current, { id: nextId(), role: "assistant", content: reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "The assistant is temporarily unavailable.");
      } finally {
        setSending(false);
      }
    },
    [messages, sending, audience, participantName],
  );

  return { messages, sending, error, sendMessage };
}
