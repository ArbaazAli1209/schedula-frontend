import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--brand)] font-serif text-xl text-white">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Sign in to Schedula</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Manage doctors, slots, and appointments.</p>
          </div>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-stone-100" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
