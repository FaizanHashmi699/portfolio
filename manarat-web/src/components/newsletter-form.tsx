"use client";

import { useActionState } from "react";
import { subscribe } from "@/actions/public";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, null);

  if (state?.ok) {
    return <p className="text-sm font-medium text-brand">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-sm border border-rule bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "…" : "Join"}
        </button>
      </div>
      {state && !state.ok && <p className="text-sm text-accent">{state.message}</p>}
    </form>
  );
}
