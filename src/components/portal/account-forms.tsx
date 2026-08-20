"use client";

import { useActionState } from "react";
import { Bell, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import {
  updateNotificationPreferences,
  updateProfile,
  type AuthState,
} from "@/server/actions/auth";

const INITIAL: AuthState = { status: "idle" };

function StatusLine({ state }: { state: AuthState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "text-danger-600 dark:text-danger-500 text-sm"
          : "text-success-600 text-sm"
      }
    >
      {state.message}
    </p>
  );
}

export function AccountForms({
  initialName,
  initialEmail,
  isDemo,
}: {
  initialName: string;
  initialEmail: string;
  isDemo: boolean;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    INITIAL,
  );
  const [notifyState, notifyAction, notifyPending] = useActionState(
    updateNotificationPreferences,
    INITIAL,
  );

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-h3 flex items-center gap-2.5">
            <UserCog className="text-primary size-5" />
            Your details
          </h2>

          <form action={profileAction} className="mt-5 space-y-5">
            <Field
              label="Full name"
              htmlFor="name"
              hint="This must match your passport exactly — a mismatch is one of the most common causes of rejection."
              error={profileState.errors?.name?.[0]}
            >
              <Input
                id="name"
                name="name"
                defaultValue={initialName}
                autoComplete="name"
                required
              />
            </Field>

            <Field
              label="Email"
              htmlFor="email"
              hint={
                isDemo
                  ? "Demo mode — this is seeded and cannot be changed."
                  : "Contact us to change the email on your account."
              }
            >
              <Input id="email" defaultValue={initialEmail} disabled readOnly />
            </Field>

            <StatusLine state={profileState} />

            <Button type="submit" variant="primary" disabled={profilePending}>
              {profilePending ? "Saving…" : "Save details"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-h3 flex items-center gap-2.5">
            <Bell className="text-primary size-5" />
            Notifications
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Status updates are on by default because the whole point of this portal is
            that you never have to ask for one.
          </p>

          <form action={notifyAction} className="mt-5 space-y-4">
            {[
              {
                name: "emailStatusUpdates",
                label: "Application status updates",
                hint: "Every time an application moves stage.",
                defaultChecked: true,
              },
              {
                name: "emailExpiryReminders",
                label: "Visa expiry reminders",
                hint: "90, 60 and 30 days before a residence visa expires.",
                defaultChecked: true,
              },
              {
                name: "emailProductUpdates",
                label: "UAE rule changes",
                hint: "Occasional. Only when something actually changes.",
                defaultChecked: false,
              },
            ].map((option) => (
              <label key={option.name} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name={option.name}
                  defaultChecked={option.defaultChecked}
                  className="mt-0.5 size-4 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  <span className="text-muted-foreground block">{option.hint}</span>
                </span>
              </label>
            ))}

            <StatusLine state={notifyState} />

            <Button type="submit" variant="outline" disabled={notifyPending}>
              {notifyPending ? "Saving…" : "Save preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
