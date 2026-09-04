/**
 * Shared specialty list for Doctor Portal forms (registration, and later
 * profile editing). Includes the specialties already used in the demo
 * doctor directory (`@/lib/mock-data/doctors`) so newly registered doctors
 * line up with the existing patient-facing specialty filters.
 */
export const SPECIALTIES = [
  "General medicine",
  "Dermatology",
  "Pediatrics",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Psychiatry",
  "Gynecology",
  "ENT (Otolaryngology)",
  "Ophthalmology",
  "Dentistry",
  "Endocrinology",
] as const;
