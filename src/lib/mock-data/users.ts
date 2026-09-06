import type { User } from "@/types/user";

type MockAccount = User & { password: string };

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
  },
  {
    id: "usr-2",
    name: "Ethan Brooks",
    email: "ethan@schedula.dev",
    password: "schedula123",
  },
];
