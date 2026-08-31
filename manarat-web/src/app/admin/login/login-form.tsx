"use client";

import { useActionState } from "react";
import { signIn } from "@/actions/admin";
import { adminField, adminLabel } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={adminLabel} htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={adminField} />
      </div>
      <div>
        <label className={adminLabel} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={adminField}
        />
      </div>

      {state && !state.ok && (
        <p className="rounded-sm bg-accent-wash px-3 py-2 text-sm text-accent">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-brand px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
