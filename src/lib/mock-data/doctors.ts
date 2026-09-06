import type { Doctor } from "@/types/doctor";
import { buildUpcomingSlots } from "@/lib/utils/slots";

export const doctors: Doctor[] = [
  {
    id: "doc-anika-rao",
    name: "Dr. Anika Rao",
    specialty: "General medicine",
    experienceYears: 11,
    rating: 4.8,
    initials: "AR",
    location: "Room 04 · Main clinic",
    bio: "Focuses on preventive care, chronic condition management, and annual wellness visits.",
    slots: buildUpcomingSlots([9, 9.5, 10, 11, 14]),
  },
  {
    id: "doc-martin-cole",
    name: "Dr. Martin Cole",
    specialty: "Dermatology",
    experienceYears: 8,
    rating: 4.7,
    initials: "MC",
    location: "Room 12 · Main clinic",
    bio: "Treats skin, hair, and nail conditions, with a special interest in acne and eczema care.",
    slots: buildUpcomingSlots([10, 11.5, 13, 15]),
  },
  {
    id: "doc-priya-nair",
    name: "Dr. Priya Nair",
    specialty: "Pediatrics",
    experienceYears: 14,
    rating: 4.9,
    initials: "PN",
    location: "Room 07 · Main clinic",
    bio: "Cares for infants through teens, with a focus on growth checks and vaccinations.",
    slots: buildUpcomingSlots([9, 10, 12, 14.5]),
  },
  {
    id: "doc-james-okafor",
    name: "Dr. James Okafor",
    specialty: "Cardiology",
    experienceYears: 16,
    rating: 4.6,
    initials: "JO",
    location: "Room 15 · Main clinic",
    bio: "Specializes in heart health screening, hypertension, and post-cardiac-event follow-up.",
    slots: buildUpcomingSlots([8.5, 11, 13.5]),
  },
  // Linked to the seeded Doctor Portal account in
  // `@/lib/mock-data/doctorAccounts` (same id) so signing in as the demo
  // doctor and browsing the patient directory show the same person.
  {
    id: "doc-acct-1",
    name: "Dr. Leah Fischer",
    specialty: "General medicine",
    experienceYears: 12,
    rating: 4.8,
    initials: "LF",
    location: "Room 09 · Springfield Clinic",
    bio: "MBBS, MD (Internal Medicine) · 12 years of experience in general and preventive medicine.",
    slots: buildUpcomingSlots([9.5, 11, 15]),
  },
];
