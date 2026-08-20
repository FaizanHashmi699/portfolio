import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/i18n";
import { isLocale, prefixedLocales } from "@/i18n/config";
import { popularServices } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export default async function LocalisedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const featured = popularServices();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-slate-950 text-slate-50">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,oklch(0.417_0.129_257)_0%,oklch(0.186_0.048_259)_45%,oklch(0.146_0.010_260)_100%)]"
        />
        <HeroCanvas />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/80"
        />

        <div className="container-page relative py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="rounded-pill inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="text-sand-400 size-4" />
              <span>
                {t.hero.badge}{" "}
                <span className="text-slate-300">{t.hero.badgeMuted}</span>
              </span>
            </p>

            <h1 className="text-display mt-6 font-semibold">
              {t.hero.titleLine1}
              <br />
              <span className="text-gradient">{t.hero.titleLine2}</span>
            </h1>

            <p className="text-lead mt-6 max-w-xl text-slate-300">{t.hero.subtitle}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/eligibility" variant="primary" size="lg">
                {t.hero.primaryCta}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </ButtonLink>
              <ButtonLink
                href="/pricing"
                size="lg"
                className="border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
              >
                {t.hero.secondaryCta}
              </ButtonLink>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <ShieldCheck className="text-success-500 size-4 shrink-0" />
              {t.hero.reassurance}{" "}
              <Link
                href="/legal/disclaimer"
                className="underline underline-offset-4 hover:text-slate-200"
              >
                {t.hero.disclaimer}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading title={t.nav.pricing} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((service) => {
            const quote = buildQuote(service);
            return (
              <Card key={service.slug} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <Badge tone="brand" className="self-start">
                    {service.processingDays.min}–{service.processingDays.max}{" "}
                    {t.common.workingDays}
                  </Badge>
                  {/* Service names stay in English: they are the legal names of the
                      permits themselves, and translating them would make the customer
                      unable to match what we say against the authority's own wording. */}
                  <h3 className="font-display text-h3 mt-4" lang="en" dir="ltr">
                    {service.name}
                  </h3>

                  <dl className="border-border mt-5 flex-1 space-y-1.5 border-t pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {t.common.governmentAndThirdParty}
                      </dt>
                      <dd className="tabular-nums" dir="ltr">
                        {formatAed(quote.passThrough)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{t.common.ourFee}</dt>
                      <dd className="tabular-nums" dir="ltr">
                        {formatAed(quote.serviceFee)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{t.common.vat}</dt>
                      <dd className="tabular-nums" dir="ltr">
                        {formatAed(quote.vat)}
                      </dd>
                    </div>
                    <div className="border-border flex justify-between gap-3 border-t pt-2 font-semibold">
                      <dt>{t.common.total}</dt>
                      <dd className="tabular-nums" dir="ltr">
                        {formatAed(quote.total)}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/services/${service.slug}`}
                    hrefLang="en"
                    className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    {t.common.fullBreakdown}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
