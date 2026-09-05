export type NotificationAudience = "user" | "doctor";

export type NotificationKind =
  | "booking"
  | "confirmation"
  | "reschedule"
  | "cancellation"
  | "reminder"
  | "missed"
  | "completed"
  | "prescription";

export type Notification = {
  id: string;
  audience: NotificationAudience;
  /** Patient email for `audience: "user"`, clinician full name for `audience: "doctor"`. */
  recipient: string;
  kind: NotificationKind;
  title: string;
  message: string;
  appointmentId?: string;
  createdAt: string;
  read: boolean;
};
