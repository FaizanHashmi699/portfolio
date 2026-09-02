import type { Metadata } from "next";
import { KhatimPattern } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff login" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-6 py-16">
      <span aria-hidden className="absolute inset-0 text-blue-300">
        <KhatimPattern id="login-khatim" opacity={0.07} size={72} />
      </span>
      <span
        aria-hidden
        className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(21,145,220,.3), transparent 68%)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span
            aria-hidden
            className="grid h-11 w-11 place-items-center rounded-[13px] bg-gradient-to-br from-brand to-navy-800 shadow-[0_8px_22px_-10px_rgba(21,145,220,.95)]"
          >
            <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
              <path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
              <circle cx="16" cy="16" r="2.6" className="fill-navy-950" />
            </svg>
          </span>
          <span className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">
            Manarat admin
          </span>
        </div>

        <div className="rounded-panel border border-rule bg-surface p-8 shadow-lg sm:p-9">
          <h1 className="font-display text-[1.6rem] font-extrabold tracking-tight text-brand-deep">
            Sign in
          </h1>
          <p className="mb-7 mt-2 text-[0.95rem] leading-[1.7] text-ink-soft">
            For masjid staff and trustees.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Manarat Foundation &middot; Registered charity 1148223
        </p>
      </div>
    </main>
  );
}
