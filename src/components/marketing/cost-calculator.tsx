"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { FeeTable } from "@/components/marketing/fee-table";
import { pillars } from "@/domain/catalog/pillars";
import { services } from "@/domain/catalog/services";
import { buildQuote, processingWindow, volumeDiscount } from "@/domain/pricing/quote";
import type { ProcessingSpeed } from "@/domain/catalog/types";
import { formatAed } from "@/lib/utils";

/**
 * The public cost calculator.
 *
 * Competitors put one of these behind a lead form and have it output a range ending in
 * "your advisor will confirm". Ours runs the exact pricing engine that produces the
 * invoice, and outputs the itemised total with no gate in front of it.
 */
export function CostCalculator({ initialSlug }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug ?? services[0].slug);
  const [speed, setSpeed] = useState<ProcessingSpeed>("standard");
  const [applicants, setApplicants] = useState(1);

  const service = useMemo(
    () => services.find((s) => s.slug === slug) ?? services[0],
    [slug],
  );

  const quote = useMemo(
    () => buildQuote(service, { speed, applicants }),
    [service, speed, applicants],
  );

  const window = processingWindow(service, speed);
  const discount = volumeDiscount(applicants);

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardContent className="space-y-5 pt-6">
          <Field label="Service" htmlFor="calc-service">
            <Select
              id="calc-service"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            >
              {pillars.map((pillar) => (
                <optgroup key={pillar.slug} label={pillar.name}>
                  {services
                    .filter((s) => s.pillar === pillar.slug)
                    .map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          <Field
            label="How many applicants?"
            htmlFor="calc-applicants"
            hint="Government and third-party costs scale per person. Our fee gets a discount."
          >
            <Input
              id="calc-applicants"
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
            <Field label="Processing speed" htmlFor="calc-speed">
              <Select
                id="calc-speed"
                value={speed}
                onChange={(event) => setSpeed(event.target.value as ProcessingSpeed)}
              >
                <option value="standard">
                  Standard — {service.processingDays.min}–{service.processingDays.max} days
                </option>
                <option value="express">
                  Express — {service.expressDays?.min}–{service.expressDays?.max} days
                </option>
              </Select>
            </Field>
          )}

          {discount > 0 && (
            <Badge tone="success">
              {Math.round(discount * 100)}% multi-applicant discount applied to our fee
            </Badge>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-h2">{service.name}</h2>
            <p className="mt-1.5 text-muted-foreground">
              {window.min}–{window.max} working days
              {applicants > 1 ? ` · ${applicants} applicants` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">All-in total</p>
            <p
              className="font-display text-4xl font-semibold tabular-nums"
              aria-live="polite"
            >
              {formatAed(quote.total)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <FeeTable quote={quote} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/eligibility?service=${service.slug}`} variant="primary">
            Check if I qualify
            <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href={`/services/${service.slug}`} variant="outline">
            What&apos;s involved
          </ButtonLink>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Government fees are set by the authorities and can change without notice. Lines
          marked as an estimate genuinely vary — health insurance by age and cover, free
          zone licences by activity and zone. Before you pay anything we confirm the
          final figure in writing, and we honour it.{" "}
          <Link href="/legal/disclaimer" className="underline underline-offset-4">
            Read the full terms
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
