"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verdictDescription, verdictLabel } from "@/domain/eligibility/engine";
import type {
  EligibilityReport,
  RouteAssessment,
  Verdict,
} from "@/domain/eligibility/types";
import { getService } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";
import { SaveReportForm } from "./save-report-form";

const VERDICT_TONE: Record<Verdict, "success" | "brand" | "warning" | "danger"> = {
  strong: "success",
  possible: "brand",
  "not-yet": "warning",
  ineligible: "danger",
};

export function EligibilityResult({
  report,
  onRestart,
  initialService,
}: {
  report: EligibilityReport;
  onRestart: () => void;
  initialService?: string;
}) {
  const [top, ...rest] = report.routes;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Badge tone="neutral">Rules version {report.rulesVersion}</Badge>
        <Button type="button" variant="ghost" size="sm" onClick={onRestart}>
          <RotateCcw className="size-4" />
          Start over
        </Button>
      </div>

      <h1 className="text-h1 mt-5">Here&apos;s where you stand</h1>
      <p className="text-lead text-muted-foreground mt-4">
        We assessed your answers against {report.routes.length} route
        {report.routes.length === 1 ? "" : "s"}. This is a readiness assessment against
        published criteria — not an approval, and not a prediction of one.
      </p>

      {top && <RouteCard assessment={top} featured />}

      {rest.length > 0 && (
        <>
          <h2 className="text-h2 mt-12">Other routes we checked</h2>
          <div className="mt-6 space-y-4">
            {rest.map((assessment) => (
              <RouteCard key={assessment.routeId} assessment={assessment} />
            ))}
          </div>
        </>
      )}

      <div className="mt-12">
        <SaveReportForm report={report} initialService={initialService} />
      </div>

      <div className="rounded-card border-border bg-surface text-muted-foreground mt-8 border p-5 text-sm">
        <p>
          <strong className="text-foreground">How to read this.</strong> Scores reflect
          how much of each route&apos;s published criteria your answers satisfy. Some
          criteria can&apos;t be judged from a questionnaire — passport validity, an
          Ejari tenancy, a mortgage ratio — and those are shown as “needs checking”
          rather than counted for or against you.
        </p>
        <p className="mt-3">
          No consultancy, including us, can guarantee a visa outcome. Decisions rest
          with the UAE authorities.
        </p>
      </div>
    </div>
  );
}

function RouteCard({
  assessment,
  featured = false,
}: {
  assessment: RouteAssessment;
  featured?: boolean;
}) {
  const service = getService(assessment.serviceSlug);
  const quote = service ? buildQuote(service) : null;
  const unknowns = assessment.outcomes.filter((o) => o.status === "unknown");

  return (
    <Card className={featured ? "border-accent/50 mt-8 shadow-md" : undefined}>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone={VERDICT_TONE[assessment.verdict]}>
              {verdictLabel(assessment.verdict)}
            </Badge>
            <h3 className="font-display text-h2 mt-3">{assessment.name}</h3>
            <p className="text-muted-foreground mt-2">{assessment.summary}</p>
          </div>

          <div className="text-right">
            <p
              className="font-display text-4xl font-semibold tabular-nums"
              aria-label={`${assessment.score} out of 100 criteria met`}
            >
              {assessment.score}
              <span className="text-muted-foreground text-lg">/100</span>
            </p>
            <p className="text-muted-foreground text-xs">criteria met</p>
          </div>
        </div>

        <p className="mt-4 text-sm">{verdictDescription(assessment.verdict)}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold">What you already meet</h4>
            {assessment.met.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Nothing confirmed yet from your answers.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {assessment.met.map((outcome) => (
                  <li key={outcome.id} className="flex gap-2 text-sm">
                    <CheckCircle2 className="text-success-500 mt-0.5 size-4 shrink-0" />
                    {outcome.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold">What&apos;s missing</h4>
            {assessment.unmet.length === 0 && unknowns.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Nothing — you&apos;re clear.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {assessment.unmet.map((outcome) => (
                  <li key={outcome.id} className="flex gap-2 text-sm">
                    {outcome.blocker ? (
                      <XCircle className="text-danger-500 mt-0.5 size-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="text-warning-600 mt-0.5 size-4 shrink-0" />
                    )}
                    <span>
                      {outcome.label}
                      {outcome.blocker && (
                        <span className="text-danger-600 dark:text-danger-500 ml-1.5 text-xs">
                          (required)
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {unknowns.map((outcome) => (
                  <li
                    key={outcome.id}
                    className="text-muted-foreground flex gap-2 text-sm"
                  >
                    <CircleDashed className="mt-0.5 size-4 shrink-0" />
                    {outcome.label} — needs checking
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {assessment.nextSteps.length > 0 && (
          <div className="border-border bg-surface mt-6 rounded-xl border p-4">
            <h4 className="text-sm font-semibold">What to do next</h4>
            <ol className="mt-2.5 space-y-2">
              {assessment.nextSteps.slice(0, 4).map((step, index) => (
                <li key={step} className="flex gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {service && quote && (
          <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <div>
              <p className="text-muted-foreground text-sm">
                If you proceed with {service.name}
              </p>
              <p className="font-display text-xl font-semibold tabular-nums">
                {formatAed(quote.total)}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  all in, including VAT
                </span>
              </p>
            </div>
            <div className="flex gap-2.5">
              <ButtonLink
                href={`/services/${service.slug}`}
                variant="outline"
                size="sm"
              >
                Full breakdown
              </ButtonLink>
              {featured && (
                <ButtonLink
                  href={`/portal/start/${service.slug}`}
                  variant="primary"
                  size="sm"
                >
                  Start this application
                  <ArrowRight className="size-4" />
                </ButtonLink>
              )}
            </div>
          </div>
        )}

        {!service && (
          <Link
            href="/services"
            className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            Browse services
            <ArrowRight className="size-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
