export type Gender = "female" | "male" | "other" | "prefer-not-to-say";

/**
 * A registered Doctor Portal account. This is distinct from the
 * patient-facing `Doctor` profile in `@/types/doctor` (the one shown in the
 * booking directory) — the two will be linked once the doctor sets up their
 * public profile from the Doctor Portal.
 */
export type DoctorAccount = {
  id: string;
  // Personal details
  fullName: string;
  gender: Gender;
  /** ISO date, e.g. "1988-04-12". */
  dateOfBirth: string;
  // Professional details
  specialty: string;
  qualification: string;
  registrationNumber: string;
  experienceYears: number;
  // Contact details
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
};

/** Payload for POST /api/auth/doctor-register. */
export type DoctorRegistrationInput = Omit<DoctorAccount, "id" | "createdAt"> & {
  password: string;
};
