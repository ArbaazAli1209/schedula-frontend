import { notifications } from "@/lib/mock-data/notifications";
import type { NotificationAudience } from "@/types/notification";

type Body = { audience?: NotificationAudience; recipient?: string };

export async function PATCH(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { audience, recipient } = body;
  if (!audience || !recipient) {
    return Response.json({ error: "audience and recipient are required." }, { status: 400 });
  }

  let updated = 0;
  for (const item of notifications) {
    if (item.audience === audience && item.recipient === recipient && !item.read) {
      item.read = true;
      updated += 1;
    }
  }

  return Response.json({ data: { updated } });
}
