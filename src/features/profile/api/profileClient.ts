import type { UserProfile } from "@/types/user";
import type { TestReport } from "@/lib/mock-data/testReports";

export async function getProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error("Unable to load your profile.");
  const body: { data: UserProfile } = await response.json();
  return body.data;
}

export type ProfilePatch = Partial<Omit<UserProfile, "id" | "email">>;

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to update your profile.");
  return body.data as UserProfile;
}

export async function getTestReports(patientEmail: string): Promise<TestReport[]> {
  const response = await fetch(`/api/test-reports?patientEmail=${encodeURIComponent(patientEmail)}`);
  if (!response.ok) throw new Error("Unable to load test reports.");
  const body: { data: TestReport[] } = await response.json();
  return body.data;
}
