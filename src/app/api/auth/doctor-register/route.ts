import { doctorAccounts } from "@/lib/mock-data/doctorAccounts";
import { doctors } from "@/lib/mock-data/doctors";
import { SPECIALTIES } from "@/lib/constants/specialties";
import type { DoctorAccount, DoctorRegistrationInput, Gender } from "@/types/doctorAccount";

type RegisterBody = Partial<DoctorRegistrationInput>;

const REQUIRED_FIELDS: (keyof RegisterBody)[] = [
  "fullName",
  "gender",
  "dateOfBirth",
  "specialty",
  "qualification",
  "registrationNumber",
  "experienceYears",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "postalCode",
  "password",
];

const ALLOWED_GENDERS: Gender[] = ["female", "male", "other", "prefer-not-to-say"];

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      return Response.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }
  }

  if (!ALLOWED_GENDERS.includes(body.gender as Gender)) {
    return Response.json(
      { error: "Please select a valid gender option." },
      { status: 400 },
    );
  }

  if (!SPECIALTIES.includes(body.specialty as (typeof SPECIALTIES)[number])) {
    return Response.json(
      { error: "Please select a valid specialty." },
      { status: 400 },
    );
  }

  if (typeof body.password !== "string" || body.password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const experienceYears = Number(body.experienceYears);
  if (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 60) {
    return Response.json(
      { error: "Years of experience must be between 0 and 60." },
      { status: 400 },
    );
  }

  const email = body.email!.trim().toLowerCase();
  const alreadyRegistered = doctorAccounts.some(
    (account) => account.email.toLowerCase() === email,
  );
  if (alreadyRegistered) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const newAccount: DoctorAccount = {
    id: `doc-acct-${Date.now()}`,
    fullName: body.fullName!.trim(),
    gender: body.gender as Gender,
    dateOfBirth: body.dateOfBirth!,
    specialty: body.specialty!,
    qualification: body.qualification!.trim(),
    registrationNumber: body.registrationNumber!.trim(),
    experienceYears,
    email,
    phone: body.phone!.trim(),
    address: body.address!.trim(),
    city: body.city!.trim(),
    state: body.state!.trim(),
    postalCode: body.postalCode!.trim(),
    createdAt: new Date().toISOString(),
  };

  doctorAccounts.push({ ...newAccount, password: body.password });

  // Every registered doctor gets a matching entry in the patient-facing
  // directory right away (same id), so they're immediately findable —
  // just with no bookable times until they add availability from their
  // Doctor Portal profile.
  const initials = newAccount.fullName
    .replace(/^dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  doctors.push({
    id: newAccount.id,
    name: newAccount.fullName,
    specialty: newAccount.specialty,
    experienceYears: newAccount.experienceYears,
    rating: 4.8,
    initials: initials || "DR",
    location: `${newAccount.city}, ${newAccount.state}`,
    bio: `${newAccount.qualification} · ${newAccount.experienceYears} years of experience in ${newAccount.specialty}.`,
    slots: [],
  });

  return Response.json({ data: newAccount }, { status: 201 });
}
