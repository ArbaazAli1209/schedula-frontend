import type { DoctorAccount, DoctorRegistrationInput } from "@/types/doctorAccount";

export async function registerDoctor(
  input: DoctorRegistrationInput,
): Promise<DoctorAccount> {
  const response = await fetch("/api/auth/doctor-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error ?? "Unable to complete registration.");
  }

  return body.data as DoctorAccount;
}
