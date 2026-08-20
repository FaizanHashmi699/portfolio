import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FeeTable } from "@/components/marketing/fee-table";
import {
  freeZoneEntryCost,
  freeZones,
  getFreeZone,
} from "@/domain/geography/free-zones";
import { getService } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { breadcrumbJsonLd } from "@/lib/seo";
import { formatAed } from "@/lib/utils";

export function generateStaticParams() {
  return freeZones.map((zone) => ({ slug: zone.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const zone = getFreeZone(slug);
  if (!zone) return {};

  return {
    title: `${zone.name} — Costs, Activities and What It's Bad At`,
    description: `${zone.name} in ${zone.emirate}: entry cost from ${formatAed(freeZoneEntryCost(zone))}, ${zone.visaQuotaBase} visa allocation, ${zone.setupDays.min}–${zone.setupDays.max} day setup. Strengths and limitations, both published.`,
    alternates: { canonical: `/free-zones/${zone.slug}` },
  };
}

const OFFICE_LABEL = {
  none: "No office required",
  "flexi-desk": "Flexi-desk included",
  physical: "Physical office required",
} as const;

export default async function FreeZonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const zone = getFreeZone(slug);
  if (!zone) notFound();

  const setupService = getService("free-zone-company-setup");
  const quote = setupService ? buildQuote(setupService) : null;
  const alternatives = freeZones
    .filter((other) => other.slug !== zone.slug && other.tier === zone.tier)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Free zones", path: "/free-zones" },
              { name: zone.name, path: `/free-zones/${zone.slug}` },
            ]),
          ),
        }}
      />

      <Section className="pb-8">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link href="/free-zones" className="hover:text-foreground">
            ← All free zones
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{zone.emirate}</Badge>
              <Badge
                tone={
                  zone.tier === "budget"
                    ? "success"
                    : zone.tier === "premium"
                      ? "accent"
                      : "neutral"
                }
              >
                {zone.tier}
              </Badge>
            </div>
            <h1 className="text-h1 mt-4">{zone.name}</h1>
            <p className="text-lead text-muted-foreground mt-4">{zone.bestFor}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {zone.activityFocus.map((activity) => (
                <span
                  key={activity}
                  className="border-border rounded-pill border px-3 py-1.5 text-sm"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          <Card className="lg:sticky lg:top-24">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Entry cost, year one</p>
              <p className="font-display text-3xl font-semibold tabular-nums">
                {formatAed(freeZoneEntryCost(zone))}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Licence and establishment card, excluding visas
              </p>

              <dl className="border-border mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Licence from</dt>
                  <dd className="tabular-nums">{formatAed(zone.licenceFromAed)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Establishment card</dt>
                  <dd className="tabular-nums">
                    {formatAed(zone.establishmentCardAed)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Visas included</dt>
                  <dd>{zone.visaQuotaBase === 0 ? "None" : zone.visaQuotaBase}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Premises</dt>
                  <dd>{OFFICE_LABEL[zone.officeRequirement]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Setup time</dt>
                  <dd>
                    {zone.setupDays.min}–{zone.setupDays.max} days
                  </dd>
                </div>
              </dl>

              <ButtonLink
                href="/portal/start/free-zone-company-setup"
                variant="primary"
                className="mt-6 w-full"
              >
                Set up here
                <ArrowRight className="size-4" />
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3 text-success-600">
                What it&apos;s genuinely good at
              </h2>
              <ul className="mt-4 space-y-3">
                {zone.strengths.map((strength) => (
                  <li key={strength} className="flex gap-2.5">
                    <Check className="text-success-500 mt-0.5 size-4 shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/*
            Publishing limitations on a page we would profit from is the whole point.
            A consultant who only lists strengths is describing their commission, not
            the zone.
          */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3 text-danger-600 dark:text-danger-500">
                Where it isn&apos;t the right choice
              </h2>
              <ul className="mt-4 space-y-3">
                {zone.limitations.map((limitation) => (
                  <li key={limitation} className="flex gap-2.5">
                    <X className="text-danger-500 mt-0.5 size-4 shrink-0" />
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>

      {setupService && quote && (
        <Section className="py-8">
          <h2 className="text-h2">What our help costs</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            The zone&apos;s own fees are above and are paid to the zone, not to us. This
            is what we charge to handle the setup, itemised as always.
          </p>
          <div className="mt-6 max-w-3xl">
            <FeeTable quote={quote} />
          </div>
        </Section>
      )}

      {alternatives.length > 0 && (
        <Section className="py-8">
          <h2 className="text-h2">Worth comparing against</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {alternatives.map((other) => (
              <li key={other.slug}>
                <Card className="relative h-full">
                  <CardContent className="pt-6">
                    <h3 className="font-display text-h3">
                      <Link
                        href={`/free-zones/${other.slug}`}
                        className="hover:text-primary after:absolute after:inset-0"
                      >
                        {other.shortName ?? other.name}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {other.bestFor}
                    </p>
                    <p className="mt-3 font-medium tabular-nums">
                      {formatAed(freeZoneEntryCost(other))}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
