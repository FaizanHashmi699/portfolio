import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { getGuide, guides } from "@/content/guides";
import { getService } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { breadcrumbJsonLd } from "@/lib/seo";
import { brand } from "@/config/brand";
import { formatAed, formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    author: { "@type": "Organization", name: brand.legalName },
    publisher: { "@id": `${brand.url}/#organization` },
    mainEntityOfPage: `${brand.url}/guides/${guide.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              { name: guide.title, path: `/guides/${guide.slug}` },
            ]),
          ),
        }}
      />

      <Section>
        <article className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/guides" className="hover:text-foreground">
              ← All guides
            </Link>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{guide.category}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {guide.readingMinutes} min read
            </span>
            <span className="text-xs text-muted-foreground">
              Updated {formatDate(guide.updated)}
            </span>
          </div>

          <h1 className="mt-4 text-h1">{guide.title}</h1>
          <p className="mt-5 text-lead text-muted-foreground">{guide.intro}</p>

          <div className="mt-12 space-y-10">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-h2">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.list && (
                  <ol className="mt-5 space-y-3">
                    {section.list.map((item, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-card border border-border bg-surface p-6">
            <h2 className="font-display text-h3">Not sure how this applies to you?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run the eligibility check — it takes about two minutes, needs no sign-up,
              and tells you which routes you actually qualify for.
            </p>
            <ButtonLink href="/eligibility" variant="primary" className="mt-5">
              Check my eligibility
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>

          {guide.services.length > 0 && (
            <div className="mt-10">
              <h2 className="text-h3 font-display">Related services</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {guide.services.map((serviceSlug) => {
                  const service = getService(serviceSlug);
                  if (!service) return null;
                  return (
                    <li key={serviceSlug}>
                      <Card className="relative h-full">
                        <CardContent className="pt-6">
                          <h3 className="font-display text-base font-semibold">
                            <Link
                              href={`/services/${service.slug}`}
                              className="after:absolute after:inset-0 hover:text-primary"
                            >
                              {service.name}
                            </Link>
                          </h3>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {service.summary}
                          </p>
                          <p className="mt-2.5 text-sm font-medium tabular-nums">
                            {formatAed(buildQuote(service).total)} all in
                          </p>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </article>
      </Section>
    </>
  );
}
