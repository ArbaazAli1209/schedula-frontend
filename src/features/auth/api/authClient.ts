import type { User } from "@/types/user";

export type LoginResult = { user: User; token: string };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error ?? "Unable to sign in.");
  }

  return body.data as LoginResult;
}
