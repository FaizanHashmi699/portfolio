import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { FreeZoneFinder } from "@/components/marketing/free-zone-finder";
import { freeZoneEntryCost, freeZones } from "@/domain/geography/free-zones";
import { formatAed } from "@/lib/utils";

export const metadata: Metadata = {
  title: "UAE Free Zone Comparison — Honest, With the Downsides",
  description:
    "Twelve UAE free zones compared on cost, visa quota, office requirements and activities — including what each one is bad at. We publish limitations because free zones pay consultants referral commissions.",
  alternates: { canonical: "/free-zones" },
};

const OFFICE_LABEL = {
  none: "No office needed",
  "flexi-desk": "Flexi-desk",
  physical: "Physical office required",
} as const;

export default function FreeZonesPage() {
  const sorted = [...freeZones].sort(
    (a, b) => freeZoneEntryCost(a) - freeZoneEntryCost(b),
  );

  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="Free zones"
          title="Compared honestly, downsides included."
          description="Free zones pay consultants referral commissions, which is exactly why almost no published comparison is neutral. Every zone below lists what it is bad at alongside what it is good at — including the ones it would pay us most to recommend."
        />

        <Card className="border-warning-500/50 mt-8 max-w-3xl">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="text-warning-600 mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Choose on your activity, not on price.</p>
              <p className="text-muted-foreground mt-1.5">
                The question that actually decides this is whether you will invoice
                customers inside the UAE local market. If you will, you need a mainland
                licence, not a free zone — and no amount of comparing free zone prices
                changes that. Everything below assumes a free zone is right for you.
              </p>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Find zones that fit</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Filters your actual constraints. There is no commission field in our data, so
          there is nothing for the ranking to be biased by.
        </p>
        <div className="mt-8">
          <FreeZoneFinder />
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">All twelve, cheapest first</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-sm">
            <caption className="sr-only">
              UAE free zones compared by entry cost, emirate, visa quota and office
              requirement
            </caption>
            <thead>
              <tr className="border-border-strong border-b text-left">
                <th scope="col" className="py-3 pr-4 font-medium">
                  Zone
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Emirate
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  Entry cost
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  Visas
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Office
                </th>
                <th scope="col" className="py-3 font-medium">
                  Setup
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sorted.map((zone) => (
                <tr key={zone.slug} className="hover:bg-surface">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/free-zones/${zone.slug}`}
                      className="hover:text-primary font-medium"
                    >
                      {zone.shortName ?? zone.name}
                    </Link>
                    <Badge
                      tone={
                        zone.tier === "budget"
                          ? "success"
                          : zone.tier === "premium"
                            ? "accent"
                            : "neutral"
                      }
                      className="ms-2"
                    >
                      {zone.tier}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground py-3 pr-4">{zone.emirate}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatAed(freeZoneEntryCost(zone))}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {zone.visaQuotaBase === 0 ? (
                      <span className="text-muted-foreground">None</span>
                    ) : (
                      zone.visaQuotaBase
                    )}
                  </td>
                  <td className="text-muted-foreground py-3 pr-4">
                    {OFFICE_LABEL[zone.officeRequirement]}
                  </td>
                  <td className="text-muted-foreground py-3">
                    {zone.setupDays.min}–{zone.setupDays.max} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          Entry cost is the licence plus establishment card for year one, excluding
          visas. Figures are indicative and must be confirmed with the zone before you
          commit.
        </p>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Strengths and limitations side by side</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {sorted.map((zone) => (
            <li key={zone.slug}>
              <Card className="relative h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-h3">
                      <Link
                        href={`/free-zones/${zone.slug}`}
                        className="hover:text-primary after:absolute after:inset-0"
                      >
                        {zone.name}
                      </Link>
                    </h3>
                    <span className="font-display shrink-0 text-lg font-semibold tabular-nums">
                      {formatAed(freeZoneEntryCost(zone))}
                    </span>
                  </div>

                  <p className="text-muted-foreground mt-2 text-sm">{zone.bestFor}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-success-600 text-xs font-semibold tracking-wide uppercase">
                        Good at
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {zone.strengths.slice(0, 3).map((strength) => (
                          <li key={strength} className="flex gap-2 text-sm">
                            <Check className="text-success-500 mt-0.5 size-3.5 shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-danger-600 dark:text-danger-500 text-xs font-semibold tracking-wide uppercase">
                        Not good at
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {zone.limitations.slice(0, 3).map((limitation) => (
                          <li key={limitation} className="flex gap-2 text-sm">
                            <X className="text-danger-500 mt-0.5 size-3.5 shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
