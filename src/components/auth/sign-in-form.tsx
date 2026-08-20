"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signIn, type AuthState } from "@/server/actions/auth";

const INITIAL: AuthState = { status: "idle" };

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={action} className="space-y-5">
      <Field label="Email" htmlFor="email" error={state.errors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Field>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor="password"
            className="text-foreground block text-sm font-medium"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-primary text-sm hover:underline"
          >
            Forgot it?
          </Link>
        </div>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.errors?.password?.[0] && (
          <p
            role="alert"
            className="text-danger-600 dark:text-danger-500 mt-1.5 text-sm"
          >
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-danger-600 dark:text-danger-500 text-sm">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
