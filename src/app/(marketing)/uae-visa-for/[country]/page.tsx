import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Clock, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  attestationSummary,
  countries,
  entryRuleSummary,
} from "@/domain/geography/countries";
import { getService } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { formatAed, slugify } from "@/lib/utils";

/**
 * Nationality landing pages.
 *
 * The largest organic opportunity we have. Attestation chains and entry rules genuinely
 * differ by country, so these are substantively distinct pages rather than the spun
 * near-duplicates our competitors publish — and they answer the question those pages
 * carefully avoid: what specifically applies to someone with *your* passport.
 */

export function generateStaticParams() {
  return countries.map((country) => ({ country: slugify(country.name) }));
}

function findCountry(slug: string) {
  return countries.find((country) => slugify(country.name) === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const country = findCountry(slug);
  if (!country) return {};

  return {
    title: `UAE Visa for ${country.demonym} Citizens — Requirements, Costs & Attestation`,
    description: `What ${country.demonym} passport holders need for a UAE visa in 2026: entry rules, the exact attestation chain for ${country.name} documents, real costs and processing times.`,
    alternates: { canonical: `/uae-visa-for/${slug}` },
    openGraph: {
      type: "article",
      title: `UAE Visa for ${country.demonym} Citizens`,
      description: `Entry rules, attestation chain and real costs for ${country.demonym} applicants.`,
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = await params;
  const country = findCountry(slug);
  if (!country) notFound();

  const relevantServices = [
    "tourist-visa-30-day",
    "employment-visa-mainland",
    "golden-visa",
    "degree-attestation",
  ]
    .map((serviceSlug) => getService(serviceSlug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  const faqs = [
    {
      question: `Do ${country.demonym} citizens need a visa for the UAE?`,
      answer: entryRuleSummary(country),
    },
    {
      question: `How are ${country.name} documents attested for the UAE?`,
      answer: `${attestationSummary(country)} In order: ${country.attestationSteps.join("; then ")}. Allow ${country.attestationDays.min}–${country.attestationDays.max} working days for the steps in ${country.name}.`,
    },
    {
      question: `How long does attestation take from ${country.name}?`,
      answer: `Typically ${country.attestationDays.min} to ${country.attestationDays.max} working days for the origin-country steps, plus two to three days for the final UAE MOFA attestation. Start it before you begin job hunting if you can — candidates lose offers waiting for a certificate that could have been attested months earlier.`,
    },
    ...(country.policeClearanceCommon
      ? [
          {
            question: `Do ${country.demonym} applicants need a police clearance certificate?`,
            answer: `It is commonly requested for employment applications from ${country.name}. It has its own validity period, so obtaining it too early is as much of a problem as obtaining it too late. Check the requirement for your specific route before applying.`,
          },
        ]
      : []),
    {
      question: "Can you guarantee my UAE visa will be approved?",
      answer:
        "No, and neither can anyone else. Decisions are made by UAE authorities, not by consultants. What we can do is check your file against the published criteria and the automated checks the government now applies, so you know your readiness before spending anything.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "By nationality", path: "/uae-visa-for" },
              { name: country.name, path: `/uae-visa-for/${slug}` },
            ]),
          ),
        }}
      />

      <Section className="pb-8">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link href="/uae-visa-for" className="hover:text-foreground">
            ← All nationalities
          </Link>
        </nav>

        <div className="mt-6 max-w-3xl">
          <Badge tone="brand">{country.region}</Badge>
          <h1 className="text-h1 mt-4">UAE visas for {country.demonym} citizens</h1>
          <p className="text-lead text-muted-foreground mt-5">
            Two things differ materially by passport: whether you can get a visa on
            arrival, and how your documents must be legalised. Both are below, with the
            actual costs.
          </p>
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3 flex items-center gap-2.5">
                <FileCheck className="text-primary size-5" />
                Entry rules
              </h2>
              <p className="text-muted-foreground mt-3">{entryRuleSummary(country)}</p>

              {country.entry === "voa-conditional" && (
                <div className="border-warning-500/40 bg-warning-50 dark:bg-warning-900/20 mt-4 flex gap-2.5 rounded-xl border p-4 text-sm">
                  <AlertTriangle className="text-warning-600 mt-0.5 size-4 shrink-0" />
                  <p>
                    This one catches people out constantly. The visa on arrival depends
                    on a residence permit you hold from another country — not on your
                    passport alone. Without one, you must arrange an entry permit before
                    travelling.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3 flex items-center gap-2.5">
                <Clock className="text-primary size-5" />
                Document attestation
              </h2>
              <Badge
                tone={country.attestation === "apostille" ? "success" : "warning"}
                className="mt-3"
              >
                {country.attestation === "apostille"
                  ? "Apostille route — shorter"
                  : "Full embassy legalisation"}
              </Badge>
              <p className="text-muted-foreground mt-3 text-sm">
                {attestationSummary(country)}
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="py-8">
        <SectionHeading
          eyebrow="Step by step"
          title={`Legalising ${country.name} documents for UAE use`}
          description={`In this order. Skipping a step invalidates every step after it. Allow ${country.attestationDays.min}–${country.attestationDays.max} working days for the ${country.name} stages.`}
        />

        <ol className="mt-8 max-w-3xl space-y-4">
          {country.attestationSteps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              <p className="pt-1">{step}</p>
            </li>
          ))}
        </ol>

        {country.notes && (
          <div className="border-border bg-surface rounded-card mt-8 max-w-3xl border p-5">
            <h3 className="font-display text-base font-semibold">
              Specific to {country.name}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">{country.notes}</p>
          </div>
        )}
      </Section>

      <Section className="py-8">
        <SectionHeading
          eyebrow="Costs"
          title="What these actually cost"
          description="Complete totals including government fees, third-party costs, our fee and VAT. The same figures as everywhere else on this site."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {relevantServices.map((service) => {
            const quote = buildQuote(service);
            return (
              <Card key={service.slug} className="relative flex flex-col">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <h3 className="font-display text-h3">
                    <Link
                      href={`/services/${service.slug}`}
                      className="hover:text-primary after:absolute after:inset-0"
                    >
                      {service.name}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mt-2 flex-1 text-sm">
                    {service.summary}
                  </p>
                  <p className="font-display mt-4 text-xl font-semibold tabular-nums">
                    {formatAed(quote.total)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {service.processingDays.min}–{service.processingDays.max} working
                    days
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section className="py-8">
        <div className="bg-surface rounded-card border-border border p-8">
          <h2 className="text-h2">Not sure which route applies to you?</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            The eligibility check ranks every UAE route against your circumstances in
            about two minutes. No sign-up, no phone number, and you keep the result.
          </p>
          <ButtonLink href="/eligibility" variant="primary" className="mt-6">
            Check my eligibility
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </Section>

      <FaqSection
        items={faqs}
        eyebrow="FAQ"
        title={`Questions from ${country.demonym} applicants`}
      />

      <Section className="py-8">
        <h2 className="text-h2">Other nationalities</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {countries
            .filter((other) => other.code !== country.code && other.landingPage)
            .map((other) => (
              <li key={other.code}>
                <Link
                  href={`/uae-visa-for/${slugify(other.name)}`}
                  className="border-border hover:bg-surface rounded-pill border px-4 py-2 text-sm"
                >
                  {other.demonym}
                </Link>
              </li>
            ))}
        </ul>
      </Section>
    </>
  );
}
