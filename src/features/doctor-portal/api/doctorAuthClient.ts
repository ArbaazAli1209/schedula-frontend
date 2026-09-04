import type { DoctorAccount } from "@/types/doctorAccount";

export type DoctorLoginResult = { doctor: DoctorAccount; token: string };

export async function loginDoctor(
  email: string,
  password: string,
): Promise<DoctorLoginResult> {
  const response = await fetch("/api/auth/doctor-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error ?? "Unable to sign in.");
  }

  return body.data as DoctorLoginResult;
}
