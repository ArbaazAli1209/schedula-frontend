export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "missed";

/** Client-side-only derived state: a confirmed appointment whose time hasn't passed yet. */
export type AppointmentDisplayStatus = AppointmentStatus | "upcoming";

export type AppointmentType = "in-person" | "video";

export type Appointment = {
  id: string;
  /** Links to `Doctor.id` in `@/types/doctor` — used for slot lookups, reschedule and rebook. */
  doctorId: string;
  patient: { name: string; initials: string; age: number; email?: string };
  clinician: string;
  specialty: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  room: string;
  createdAt: string;
  updatedAt: string;
  /** Previous `startsAt`, set when the doctor reschedules this appointment. */
  rescheduledFrom?: string;
  prescription?: import("./prescription").Prescription;
  review?: import("./review").Review;
};
