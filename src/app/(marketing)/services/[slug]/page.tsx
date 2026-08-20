import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FeeTable } from "@/components/marketing/fee-table";
import { getService, services } from "@/domain/catalog/services";
import { getPillar } from "@/domain/catalog/pillars";
import { buildQuote } from "@/domain/pricing/quote";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { formatAed } from "@/lib/utils";

/**
 * The valid slugs are known at build time and the set is finite, so anything else is a
 * genuine 404 rather than a page to attempt. Without this Next renders the route on
 * demand, reaches notFound(), and can still serve the result with a 200 — which tells
 * search engines a nonexistent page exists.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const quote = buildQuote(service);
  return {
    title: service.name,
    description: `${service.summary} All-in cost ${formatAed(quote.total)}, itemised into government fees, third-party costs, our fee and VAT. Typical processing ${service.processingDays.min}–${service.processingDays.max} working days.`,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — full cost breakdown`,
      description: service.summary,
      type: "article",
    },
  };
}

const ACTOR_ICON = { customer: User, maqam: Building2, government: FileText } as const;
const ACTOR_LABEL = {
  customer: "Your turn",
  maqam: "We handle this",
  government: "With the authority",
} as const;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const pillar = getPillar(service.pillar);
  const quote = buildQuote(service);
  const expressQuote = service.expressSurcharge
    ? buildQuote(service, { speed: "express" })
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(service)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: service.name, path: `/services/${service.slug}` },
            ]),
          ),
        }}
      />

      <Section className="pb-8">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/services" className="hover:text-foreground">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">{service.name}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div>
            {pillar && <Badge tone="brand">{pillar.name}</Badge>}
            <h1 className="text-h1 mt-4">{service.name}</h1>
            <p className="text-lead text-muted-foreground mt-4">
              {service.description}
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              <strong className="text-foreground">Who this is for:</strong>{" "}
              {service.audience}
            </p>
          </div>

          {/* The price is the headline, not a thing you have to ask for. */}
          <Card className="lg:sticky lg:top-24">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">All-in total</p>
              <p className="font-display text-4xl font-semibold tabular-nums">
                {formatAed(quote.total)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Including all government fees, third-party costs and 5% VAT
              </p>

              <dl className="border-border mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Standard processing</dt>
                  <dd className="font-medium">
                    {service.processingDays.min}–{service.processingDays.max} days
                  </dd>
                </div>
                {expressQuote && service.expressDays && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Express</dt>
                    <dd className="font-medium">
                      {service.expressDays.min}–{service.expressDays.max} days ·{" "}
                      {formatAed(expressQuote.total)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Our fee</dt>
                  <dd className="font-medium">{formatAed(quote.serviceFee)}</dd>
                </div>
              </dl>

              <ButtonLink
                href={`/eligibility?service=${service.slug}`}
                variant="primary"
                className="mt-6 w-full"
              >
                Check if I qualify
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink
                href={`/portal/start/${service.slug}`}
                variant="outline"
                className="mt-2.5 w-full"
              >
                Start this application
              </ButtonLink>
              <Link
                href={`/contact?service=${service.slug}`}
                className="text-muted-foreground hover:text-foreground mt-4 block text-center text-sm"
              >
                Or ask a question first
              </Link>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Where every dirham goes</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Most consultancies show you one number. Here is the same total, split by who
          actually receives the money.
        </p>
        <div className="mt-6 max-w-4xl">
          <FeeTable quote={quote} />
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">How it runs</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          {service.stages.length} stages, typically {service.processingDays.min}–
          {service.processingDays.max} working days end to end. Your portal shows
          exactly which one you are on, and whose turn it is.
        </p>

        <ol className="mt-8 max-w-3xl space-y-0">
          {service.stages.map((stage, index) => {
            const Icon = ACTOR_ICON[stage.actor];
            const last = index === service.stages.length - 1;
            return (
              <li key={stage.title} className="relative flex gap-5 pb-8 last:pb-0">
                {!last && (
                  <span
                    aria-hidden="true"
                    className="bg-border absolute top-11 bottom-0 left-[1.375rem] w-px"
                  />
                )}
                <span className="border-border bg-surface-raised relative flex size-11 shrink-0 items-center justify-center rounded-full border">
                  <Icon className="text-primary size-5" />
                </span>
                <div className="pt-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-h3">{stage.title}</h3>
                    <Badge tone={stage.actor === "customer" ? "accent" : "neutral"}>
                      {ACTOR_LABEL[stage.actor]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-sm">
                    {stage.description}
                  </p>
                  {stage.days > 0 && (
                    <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
                      <Clock className="size-3.5" />
                      Typically {stage.days} working day{stage.days === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section className="py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-h2">What you&apos;ll need</h2>
            <ul className="mt-6 space-y-4">
              {service.documents.map((doc) => (
                <li key={doc.id} className="flex gap-3">
                  <CheckCircle2 className="text-success-500 mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {doc.label}
                      {doc.conditional && (
                        <Badge tone="neutral" className="ml-2">
                          Conditional
                        </Badge>
                      )}
                      {doc.attestationRequired && (
                        <Badge tone="warning" className="ml-2">
                          Attestation required
                        </Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {doc.description}
                    </p>
                    {doc.conditional && (
                      <p className="text-muted-foreground mt-1 text-sm italic">
                        {doc.conditional}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Publishing rejection reasons is counter-intuitive for a sales page and is
            exactly why it works: it is the most useful thing on the page, and no
            competitor does it.
          */}
          <div>
            <h2 className="text-h2">Why applications like this get refused</h2>
            <p className="text-muted-foreground mt-3">
              We publish these because knowing them in advance is worth more to you than
              a reassuring sales page. Each one is checked automatically when you
              upload.
            </p>
            <ul className="mt-6 space-y-3">
              {service.commonRejectionReasons.map((reason) => (
                <li
                  key={reason}
                  className="border-border bg-surface flex gap-3 rounded-xl border p-4"
                >
                  <AlertTriangle className="text-warning-600 mt-0.5 size-5 shrink-0" />
                  <span className="text-sm">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {service.related.length > 0 && (
        <Section className="py-8">
          <h2 className="text-h2">Often needed alongside this</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {service.related.map((relatedSlug) => {
              const related = getService(relatedSlug);
              if (!related) return null;
              return (
                <li key={relatedSlug}>
                  <Card className="relative h-full transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <h3 className="font-display text-h3">
                        <Link
                          href={`/services/${related.slug}`}
                          className="hover:text-primary after:absolute after:inset-0"
                        >
                          {related.name}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {related.summary}
                      </p>
                      <p className="mt-3 text-sm font-medium tabular-nums">
                        {formatAed(buildQuote(related).total)}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </>
  );
}
