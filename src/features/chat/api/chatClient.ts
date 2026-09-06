import type { ChatAudience, ChatMessage } from "@/types/chat";

export async function sendChatMessage(
  messages: ChatMessage[],
  audience: ChatAudience,
  participantName?: string,
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience,
      participantName,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
    }),
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "The assistant is temporarily unavailable.");
  return body.reply as string;
}
