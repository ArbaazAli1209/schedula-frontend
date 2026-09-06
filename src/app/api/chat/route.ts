import type { ChatAudience } from "@/types/chat";

type IncomingMessage = { role: "user" | "assistant"; content: string };

type ChatRequestBody = {
  audience?: ChatAudience;
  participantName?: string;
  messages?: IncomingMessage[];
};

const SYSTEM_PROMPTS: Record<ChatAudience, string> = {
  user:
    "You are the Schedula assistant, embedded in a patient's appointment-booking portal. " +
    "Help with using the app: finding and booking doctors, understanding appointment statuses, " +
    "viewing/downloading prescriptions, reviews, rebooking, and managing their profile. " +
    "You are not a medical professional — never diagnose, prescribe, or give specific treatment advice. " +
    "For medical questions, give general, cautious information and encourage booking or contacting a doctor. " +
    "Keep answers short and friendly.",
  doctor:
    "You are the Schedula assistant, embedded in a clinician's Doctor Portal. " +
    "Help with using the app: managing the appointment queue, adding or editing patient prescriptions " +
    "(diagnosis, medications, dosage, duration, instructions), and updating their profile and availability. " +
    "You are assisting with the software, not offering clinical judgment on patient care. " +
    "Keep answers short and practical.",
};

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_HISTORY_MESSAGES = 20;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The assistant isn't configured yet. Set GROQ_API_KEY on the server." },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const audience: ChatAudience = body.audience === "doctor" ? "doctor" : "user";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "No message provided." }, { status: 400 });
  }

  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content,
  }));

  const system = body.participantName
    ? `${SYSTEM_PROMPTS[audience]} The person you're talking to is named ${body.participantName}.`
    : SYSTEM_PROMPTS[audience];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        max_tokens: 500,
        messages: [{ role: "system", content: system }, ...trimmed],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Groq API error:", response.status, details);
      return Response.json({ error: "The assistant is temporarily unavailable." }, { status: 502 });
    }

    const data = await response.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "";

    if (!reply) {
      return Response.json({ error: "The assistant is temporarily unavailable." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (err) {
    console.error("Chat request failed:", err);
    return Response.json({ error: "The assistant is temporarily unavailable." }, { status: 502 });
  }
}
