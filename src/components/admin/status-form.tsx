"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  updateApplicationStatus,
  type AdminActionState,
} from "@/server/actions/applications";
import type { ApplicationStatus } from "@/server/repositories/types";

const INITIAL: AdminActionState = { status: "idle" };

const OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "documents-pending", label: "Waiting on customer" },
  { value: "in-review", label: "We're reviewing" },
  { value: "submitted", label: "Submitted" },
  { value: "with-authority", label: "With the authority" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Refused" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * Status changes require a title and description because the customer sees them. Making
 * the explanation mandatory is what stops the timeline decaying into a series of opaque
 * state transitions — which is the thing this product exists to fix.
 */
export function StatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [state, action, pending] = useActionState(updateApplicationStatus, INITIAL);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />

      <Field label="New status" htmlFor="status">
        <Select id="status" name="status" defaultValue={currentStatus} required>
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Whose action is this?" htmlFor="actor">
        <Select id="actor" name="actor" defaultValue="maqam">
          <option value="maqam">Maqam</option>
          <option value="government">Authority</option>
          <option value="customer">Customer</option>
          <option value="system">Automated check</option>
        </Select>
      </Field>

      <Field
        label="Headline"
        htmlFor="title"
        hint="The customer sees this on their timeline."
      >
        <Input id="title" name="title" required minLength={3} maxLength={160} />
      </Field>

      <Field
        label="What happened"
        htmlFor="description"
        hint="Plain language. Say what it means for them and whether they need to do anything."
      >
        <Textarea id="description" name="description" required minLength={3} rows={4} />
      </Field>

      {state.message && (
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
      )}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}
