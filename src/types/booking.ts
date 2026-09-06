export type BookingStatus = "confirmed";

export type Booking = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientEmail: string;
  startsAt: string;
  durationMinutes: number;
  status: BookingStatus;
  createdAt: string;
};
