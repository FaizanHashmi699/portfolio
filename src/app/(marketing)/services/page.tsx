import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { pillars } from "@/domain/catalog/pillars";
import { services, servicesByPillar } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Services",
  description:
    "Every UAE visa, business setup, outbound visa and attestation service we offer — each with its complete fee breakdown, realistic processing window and common rejection reasons.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string }>;
}) {
  const { pillar } = await searchParams;
  const active = pillars.find((p) => p.slug === pillar);
  const list = active ? servicesByPillar(active.slug) : services;

  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          as="h1"
          eyebrow="Services"
          title={active ? active.headline : "Everything we do, priced in the open."}
          description={
            active
              ? active.description
              : "Fourteen services across four pillars. Every one publishes its full cost breakdown, the stages it moves through, and the reasons applications like yours get rejected."
          }
        />

        <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/services"
            aria-current={!active ? "true" : undefined}
            className={cn(
              "rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
              !active
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border hover:bg-surface",
            )}
          >
            All services
          </Link>
          {pillars.map((p) => (
            <Link
              key={p.slug}
              href={`/services?pillar=${p.slug}`}
              aria-current={active?.slug === p.slug ? "true" : undefined}
              className={cn(
                "rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
                active?.slug === p.slug
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border hover:bg-surface",
              )}
            >
              {p.name}
            </Link>
          ))}
        </nav>
      </Section>

      <Section className="pt-4">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((service) => {
            const quote = buildQuote(service);
            return (
              <li key={service.slug}>
                <Card className="relative flex h-full flex-col transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-1 flex-col pt-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="brand">
                        {service.processingDays.min}–{service.processingDays.max} days
                      </Badge>
                      {service.popular && <Badge tone="accent">Popular</Badge>}
                    </div>

                    <h2 className="font-display text-h3 mt-4">
                      <Link
                        href={`/services/${service.slug}`}
                        className="hover:text-primary after:absolute after:inset-0"
                      >
                        {service.name}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground mt-2 flex-1 text-sm">
                      {service.summary}
                    </p>

                    <div className="border-border mt-5 flex items-end justify-between border-t pt-4">
                      <div>
                        <p className="text-muted-foreground text-xs">All-in total</p>
                        <p className="font-display text-xl font-semibold tabular-nums">
                          {formatAed(quote.total)}
                        </p>
                      </div>
                      <ArrowRight className="text-muted-foreground size-5" />
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
