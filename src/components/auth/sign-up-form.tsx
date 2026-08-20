"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signUp, type AuthState } from "@/server/actions/auth";

const INITIAL: AuthState = { status: "idle" };

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, INITIAL);

  if (state.status === "success") {
    return (
      <div className="border-success-500/40 bg-success-50 dark:bg-success-900/20 flex items-start gap-3 rounded-xl border p-4">
        <CheckCircle2 className="text-success-500 mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{state.message}</p>
          <p className="text-muted-foreground mt-1.5 text-sm">
            <Link href="/sign-in" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Field label="Your name" htmlFor="name" error={state.errors?.name?.[0]}>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>

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

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 10 characters. Length protects you far more than symbols do."
        error={state.errors?.password?.[0]}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>

      <div>
        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="acceptedTerms"
            required
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span className="text-muted-foreground">
            I accept the{" "}
            <Link href="/legal/terms" className="text-primary hover:underline">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {state.errors?.acceptedTerms?.[0] && (
          <p
            role="alert"
            className="text-danger-600 dark:text-danger-500 mt-1.5 text-sm"
          >
            {state.errors.acceptedTerms[0]}
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
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
