"use client";

import { useActionState } from "react";
import { signIn } from "@/actions/admin";
import { adminField, adminLabel, adminButton } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-5">
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
        <p
          role="alert"
          className="rounded-[10px] border border-brand/40 border-l-[3px] border-l-brand bg-brand-wash px-4 py-3 text-sm leading-[1.7] text-brand-deep"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${adminButton} w-full py-3.5`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
