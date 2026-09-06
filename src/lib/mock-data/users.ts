import type { User, UserProfile } from "@/types/user";

type MockAccount = UserProfile & { password: string };

/**
 * Demo-only accounts for the mock authentication endpoint.
 * There is no real password hashing/storage here — this stands in for a
 * backend user table until one exists.
 */
export const accounts: MockAccount[] = [
  {
    id: "usr-1",
    name: "Maya Patel",
    email: "maya@schedula.dev",
    password: "schedula123",
    phone: "+1 555-0142",
    dateOfBirth: "1992-04-18",
    gender: "female",
    address: "18 Birchwood Ave, Portland, OR",
    heightCm: 165,
    weightKg: 60,
    bloodGroup: "O+",
    medicalConditions: ["Asthma"],
    allergies: ["Penicillin"],
    currentMedications: ["Albuterol inhaler"],
    insurance: { provider: "Cascade Health", policyNumber: "CH-88213" },
    emergencyContact: { name: "Ravi Patel", relationship: "Spouse", phone: "+1 555-0198" },
  },
  {
    id: "usr-2",
    name: "Ethan Brooks",
    email: "ethan@schedula.dev",
    password: "schedula123",
    phone: "+1 555-0177",
    dateOfBirth: "1985-11-02",
    gender: "male",
    address: "402 Fremont St, Portland, OR",
    heightCm: 178,
    weightKg: 82,
    bloodGroup: "A+",
    medicalConditions: [],
    allergies: [],
    currentMedications: [],
    insurance: { provider: "", policyNumber: "" },
    emergencyContact: { name: "", relationship: "", phone: "" },
  },
];

export function toPublicUser(account: MockAccount): User {
  return { id: account.id, name: account.name, email: account.email };
}
