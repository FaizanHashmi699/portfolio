import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff login" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 flex items-center gap-3">
        <span aria-hidden className="flex flex-col items-center">
          <span className="block h-2 w-2 bg-brand" />
          <span className="block h-6 w-[3px] bg-brand/35" />
        </span>
        <span className="font-display text-xl font-medium">Manarat admin</span>
      </div>
      <div className="rounded-sm border border-rule bg-surface p-7">
        <h1 className="font-display text-2xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-1.5 mb-6 text-sm text-ink-soft">
          For masjid staff and trustees.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
