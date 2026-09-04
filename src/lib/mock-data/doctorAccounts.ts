import type { DoctorAccount } from "@/types/doctorAccount";

type MockDoctorAccount = DoctorAccount & { password: string };

/**
 * Demo-only Doctor Portal accounts for the mock registration/auth
 * endpoints. There is no real password hashing/storage here — this stands
 * in for a backend doctors table until one exists. Resets whenever the dev
 * server restarts, same as `@/lib/mock-data/bookings`.
 *
 * Seeded with one demo account so the upcoming Doctor Login feature has
 * something to sign in with.
 */
export const doctorAccounts: MockDoctorAccount[] = [
  {
    id: "doc-acct-1",
    fullName: "Dr. Leah Fischer",
    gender: "female",
    dateOfBirth: "1985-03-19",
    specialty: "General medicine",
    qualification: "MBBS, MD (Internal Medicine)",
    registrationNumber: "MCI-88213",
    experienceYears: 12,
    email: "leah.fischer@schedula.dev",
    phone: "+1 555-0142",
    address: "221 Cedar Street",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    password: "schedula123",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
];

/** Strips the password before an account leaves the mock-data layer. */
export function toSafeDoctorAccount(account: MockDoctorAccount): DoctorAccount {
  return {
    id: account.id,
    fullName: account.fullName,
    gender: account.gender,
    dateOfBirth: account.dateOfBirth,
    specialty: account.specialty,
    qualification: account.qualification,
    registrationNumber: account.registrationNumber,
    experienceYears: account.experienceYears,
    email: account.email,
    phone: account.phone,
    address: account.address,
    city: account.city,
    state: account.state,
    postalCode: account.postalCode,
    createdAt: account.createdAt,
  };
}
