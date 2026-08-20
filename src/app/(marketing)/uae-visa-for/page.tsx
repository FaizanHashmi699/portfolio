import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { countries } from "@/domain/geography/countries";
import type { Country } from "@/domain/geography/types";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "UAE Visa Requirements by Nationality",
  description:
    "Entry rules and document attestation requirements for UAE visas, by passport. Both differ materially by country — including whether you qualify for a visa on arrival at all.",
  alternates: { canonical: "/uae-visa-for" },
};

const ENTRY_LABEL: Record<Country["entry"], string> = {
  gcc: "No visa needed",
  "visa-free": "Visa-free",
  "voa-90": "90-day visa on arrival",
  "voa-30": "30-day visa on arrival",
  "voa-conditional": "Conditional visa on arrival",
  "pre-approval": "Entry permit required",
};

const ENTRY_TONE: Record<Country["entry"], "success" | "brand" | "warning"> = {
  gcc: "success",
  "visa-free": "success",
  "voa-90": "success",
  "voa-30": "success",
  "voa-conditional": "warning",
  "pre-approval": "brand",
};

export default function NationalitiesPage() {
  const byRegion = countries.reduce<Record<string, Country[]>>((groups, country) => {
    (groups[country.region] ??= []).push(country);
    return groups;
  }, {});

  const regions = Object.keys(byRegion).sort();

  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="By nationality"
          title="Your passport changes two things."
          description="Whether you can get a visa on arrival, and how your documents must be legalised. Everything else is the same — but those two differences decide your timeline and a good part of your cost."
        />

        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-base font-semibold">
                Apostille or embassy legalisation?
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                The UAE joined the Hague Apostille Convention in 2022. For member states
                that replaced the old four-step embassy chain with a shorter route. A
                great deal of published guidance still describes only the old process,
                which sends people through steps they no longer need.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-base font-semibold">
                &ldquo;Conditional&rdquo; visa on arrival
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                For several nationalities the visa on arrival depends on holding a
                residence permit from an approved country — not on the passport alone.
                This is the single most misunderstood rule in UAE entry, and it strands
                people at check-in.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="pt-4">
        {regions.map((region) => (
          <section key={region} className="mb-12">
            <h2 className="text-h2">{region}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {byRegion[region]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((country) => (
                  <li key={country.code}>
                    <Card className="relative h-full transition-shadow hover:shadow-md">
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium">
                            <Link
                              href={`/uae-visa-for/${slugify(country.name)}`}
                              className="hover:text-primary after:absolute after:inset-0"
                            >
                              {country.name}
                            </Link>
                          </h3>
                          <Badge
                            tone={
                              country.attestation === "apostille"
                                ? "success"
                                : "neutral"
                            }
                          >
                            {country.attestation === "apostille"
                              ? "Apostille"
                              : "Embassy"}
                          </Badge>
                        </div>
                        <p className="mt-2">
                          <Badge tone={ENTRY_TONE[country.entry]}>
                            {ENTRY_LABEL[country.entry]}
                          </Badge>
                        </p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </Section>
    </>
  );
}
