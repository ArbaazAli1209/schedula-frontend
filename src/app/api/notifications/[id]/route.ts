import { findNotification } from "@/lib/utils/notifications";

type RouteContext = { params: Promise<{ id: string }> };

/** Marks a single notification as read. */
export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const notification = findNotification(id);
  if (!notification) return Response.json({ error: "Notification not found." }, { status: 404 });
  notification.read = true;
  return Response.json({ data: notification });
}
