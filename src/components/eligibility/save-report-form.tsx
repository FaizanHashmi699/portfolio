"use client";

import { useActionState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { saveEligibilityReport, type ActionState } from "@/server/actions/leads";
import type { EligibilityReport } from "@/domain/eligibility/types";

const INITIAL: ActionState = { status: "idle" };

/**
 * Optional email capture, deliberately placed *after* the result.
 *
 * The visitor already has their answer at this point. Offering to save it is a genuine
 * convenience rather than a toll gate — which is the entire difference between our funnel
 * and every competitor's.
 */
export function SaveReportForm({
  report,
  initialService,
}: {
  report: EligibilityReport;
  initialService?: string;
}) {
  const [state, action, pending] = useActionState(saveEligibilityReport, INITIAL);

  if (state.status === "success") {
    return (
      <Card className="border-success-500/40">
        <CardContent className="flex items-start gap-3 pt-6">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-500" />
          <div>
            <p className="font-medium">{state.message}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your report stays valid against rules version {report.rulesVersion}. If the
              criteria change, run the check again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const serviceSlug = initialService ?? report.recommended?.serviceSlug;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="flex items-center gap-2.5 font-display text-h3">
          <Mail className="size-5 text-primary" />
          Want a copy of this?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional. You already have your result — this just emails it to you so you
          don&apos;t have to answer the questions again.
        </p>

        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="serviceSlug" value={serviceSlug ?? ""} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="save-name" error={state.errors?.name?.[0]}>
              <Input id="save-name" name="name" autoComplete="name" placeholder="Optional" />
            </Field>
            <Field label="Email" htmlFor="save-email" error={state.errors?.email?.[0]}>
              <Input
                id="save-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </Field>
          </div>

          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              name="marketingConsent"
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span className="text-muted-foreground">
              You may also send me occasional updates about UAE visa rule changes. We
              won&apos;t call unless you ask us to.
            </span>
          </label>

          {state.status === "error" && state.message && (
            <p role="alert" className="text-sm text-danger-600 dark:text-danger-500">
              {state.message}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Sending…" : "Email me my report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
