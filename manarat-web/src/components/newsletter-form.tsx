"use client";

import { useActionState } from "react";
import { subscribe } from "@/actions/public";

export function NewsletterForm({ onNavy = false }: { onNavy?: boolean }) {
  const [state, action, pending] = useActionState(subscribe, null);

  if (state?.ok) {
    return (
      <p
        className={`flex items-center gap-2.5 rounded-card px-4 py-3.5 text-sm font-semibold ${
          onNavy ? "bg-white/10 text-blue-300" : "bg-brand-wash text-brand-deep"
        }`}
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 8.5 6 12l7.5-8" />
        </svg>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div
        className={`flex gap-2 rounded-chip p-1.5 ${
          onNavy ? "border border-white/18 bg-white/[0.07]" : "border border-rule bg-surface"
        }`}
      >
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={`min-w-0 flex-1 bg-transparent px-4 text-[0.92rem] outline-none ${
            onNavy ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-ink-mute"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-chip bg-brand px-6 py-3 text-[0.88rem] font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state && !state.ok && (
        <p className={`mt-2.5 px-2 text-sm ${onNavy ? "text-blue-300" : "text-brand-deep"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
