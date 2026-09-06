export type User = {
  id: string;
  name: string;
  email: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type Insurance = {
  provider: string;
  policyNumber: string;
};

/**
 * Full patient profile shown/edited in the User Portal's Profile page.
 * Separate from `User` (the auth-session shape) since most callers only
 * need the lightweight identity fields.
 */
export type UserProfile = User & {
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  heightCm: number | null;
  weightKg: number | null;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  currentMedications: string[];
  insurance: Insurance;
  emergencyContact: EmergencyContact;
};
