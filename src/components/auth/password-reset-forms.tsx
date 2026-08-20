"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  requestPasswordReset,
  resetPassword,
  type AuthState,
} from "@/server/actions/auth";

const INITIAL: AuthState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, INITIAL);

  if (state.status === "success") {
    return (
      <div className="border-success-500/40 bg-success-50 dark:bg-success-900/20 flex items-start gap-3 rounded-xl border p-4">
        <CheckCircle2 className="text-success-500 mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{state.message}</p>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Didn&apos;t arrive? Check spam, then{" "}
            <Link href="/contact" className="text-primary hover:underline">
              tell us
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

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
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, INITIAL);

  if (state.status === "success") {
    return (
      <div className="border-success-500/40 bg-success-50 dark:bg-success-900/20 flex items-start gap-3 rounded-xl border p-4">
        <CheckCircle2 className="text-success-500 mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">{state.message}</p>
          <p className="mt-1.5 text-sm">
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Field
        label="New password"
        htmlFor="password"
        hint="At least 10 characters."
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

      <Field
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={state.errors?.confirmPassword?.[0]}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

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
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
