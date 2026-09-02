export type DoctorSlot = {
  /** ISO date-time for the start of the slot. */
  startsAt: string;
  durationMinutes: number;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  initials: string;
  location: string;
  bio: string;
  slots: DoctorSlot[];
};
