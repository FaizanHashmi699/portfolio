"use client";

import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { FeeTable } from "@/components/marketing/fee-table";
import { startApplication, type PortalState } from "@/server/actions/portal";
import { buildQuote } from "@/domain/pricing/quote";
import type { ProcessingSpeed, ServiceDefinition } from "@/domain/catalog/types";
import { formatAed } from "@/lib/utils";

const INITIAL: PortalState = { status: "idle" };

/**
 * The quote shown here is recomputed on the server before the application is created —
 * these inputs drive a preview, never the stored price.
 */
export function StartApplicationForm({ service }: { service: ServiceDefinition }) {
  const [state, action, pending] = useActionState(startApplication, INITIAL);
  const [speed, setSpeed] = useState<ProcessingSpeed>("standard");
  const [applicants, setApplicants] = useState(1);

  const quote = buildQuote(service, { speed, applicants });

  return (
    <form
      action={action}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
    >
      <input type="hidden" name="serviceSlug" value={service.slug} />

      <div className="space-y-6">
        <Field
          label="Applicant's full name"
          htmlFor="applicantName"
          hint="Exactly as it appears on the passport. A mismatch here is one of the most common causes of rejection, and it is expensive to fix later."
          error={state.errors?.applicantName?.[0]}
        >
          <Input id="applicantName" name="applicantName" required autoComplete="name" />
        </Field>

        <Field
          label="Applicant's email"
          htmlFor="applicantEmail"
          hint="Where confirmations and the e-visa are sent."
          error={state.errors?.applicantEmail?.[0]}
        >
          <Input
            id="applicantEmail"
            name="applicantEmail"
            type="email"
            required
            autoComplete="email"
          />
        </Field>

        <Field
          label="How many applicants?"
          htmlFor="applicants"
          hint="Government and third-party costs are per person. Our fee is discounted for two or more."
        >
          <Input
            id="applicants"
            name="applicants"
            type="number"
            min={1}
            max={50}
            value={applicants}
            onChange={(event) =>
              setApplicants(
                Math.min(50, Math.max(1, Math.floor(Number(event.target.value) || 1))),
              )
            }
          />
        </Field>

        {service.expressSurcharge && (
          <Field label="Processing speed" htmlFor="speed">
            <Select
              id="speed"
              name="speed"
              value={speed}
              onChange={(event) => setSpeed(event.target.value as ProcessingSpeed)}
            >
              <option value="standard">
                Standard — {service.processingDays.min}–{service.processingDays.max}{" "}
                working days
              </option>
              <option value="express">
                Express — {service.expressDays?.min}–{service.expressDays?.max} working
                days
              </option>
            </Select>
          </Field>
        )}

        {state.status === "error" && state.message && (
          <p role="alert" className="text-danger-600 dark:text-danger-500 text-sm">
            {state.message}
          </p>
        )}

        <div className="border-border border-t pt-6">
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending
              ? "Creating…"
              : `Start this application — ${formatAed(quote.total)}`}
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-muted-foreground mt-3 text-sm">
            Nothing is charged now. You upload documents next, and we check them before
            any fee is due.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-24">
        <h2 className="font-display text-h3 mb-4">Your quote</h2>
        <FeeTable quote={quote} />
      </div>
    </form>
  );
}
