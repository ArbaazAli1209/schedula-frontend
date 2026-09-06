import { accounts } from "@/lib/mock-data/users";
import type { UserProfile } from "@/types/user";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params;
  const account = accounts.find((item) => item.id === userId);
  if (!account) return Response.json({ error: "User not found." }, { status: 404 });

  const { password: _password, ...profile } = account;
  return Response.json({ data: profile satisfies UserProfile });
}

type ProfileUpdateBody = Partial<
  Omit<UserProfile, "id" | "email">
>;

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params;
  const account = accounts.find((item) => item.id === userId);
  if (!account) return Response.json({ error: "User not found." }, { status: 404 });

  let body: ProfileUpdateBody;
  try {
    body = (await request.json()) as ProfileUpdateBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.name !== undefined) {
    if (!body.name.trim()) return Response.json({ error: "Name cannot be empty." }, { status: 400 });
    account.name = body.name.trim();
  }
  if (body.phone !== undefined) account.phone = body.phone.trim();
  if (body.dateOfBirth !== undefined) account.dateOfBirth = body.dateOfBirth;
  if (body.gender !== undefined) account.gender = body.gender;
  if (body.address !== undefined) account.address = body.address.trim();
  if (body.heightCm !== undefined) {
    if (body.heightCm !== null && (!Number.isFinite(body.heightCm) || body.heightCm < 0 || body.heightCm > 300)) {
      return Response.json({ error: "Height must be between 0 and 300 cm." }, { status: 400 });
    }
    account.heightCm = body.heightCm;
  }
  if (body.weightKg !== undefined) {
    if (body.weightKg !== null && (!Number.isFinite(body.weightKg) || body.weightKg < 0 || body.weightKg > 500)) {
      return Response.json({ error: "Weight must be between 0 and 500 kg." }, { status: 400 });
    }
    account.weightKg = body.weightKg;
  }
  if (body.bloodGroup !== undefined) account.bloodGroup = body.bloodGroup;
  if (body.medicalConditions !== undefined) account.medicalConditions = body.medicalConditions;
  if (body.allergies !== undefined) account.allergies = body.allergies;
  if (body.currentMedications !== undefined) account.currentMedications = body.currentMedications;
  if (body.insurance !== undefined) account.insurance = body.insurance;
  if (body.emergencyContact !== undefined) account.emergencyContact = body.emergencyContact;

  const { password: _password, ...profile } = account;
  return Response.json({ data: profile satisfies UserProfile });
}
