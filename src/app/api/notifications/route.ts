import { listNotifications } from "@/lib/utils/notifications";
import type { NotificationAudience } from "@/types/notification";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audience = searchParams.get("audience") as NotificationAudience | null;
  const recipient = searchParams.get("recipient");

  if (!audience || !recipient) {
    return Response.json({ error: "audience and recipient are required." }, { status: 400 });
  }

  const data = listNotifications(audience, recipient);
  return Response.json({ data, meta: { total: data.length, unread: data.filter((item) => !item.read).length } });
}
