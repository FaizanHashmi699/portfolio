import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { getLegalDocument, legalDocuments } from "@/content/legal";
import { formatDate } from "@/lib/utils";

/**
 * The valid slugs are known at build time and the set is finite, so anything else is a
 * genuine 404 rather than a page to attempt. Without this Next renders the route on
 * demand, reaches notFound(), and can still serve the result with a 200 — which tells
 * search engines a nonexistent page exists.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocument(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);
  if (!doc) notFound();

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-h1">{doc.title}</h1>
        <p className="text-muted-foreground mt-3">{doc.description}</p>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Last updated {formatDate(doc.updated)}
        </p>

        <div className="mt-12 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-h2">{section.heading}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="rounded-card border-border bg-surface text-muted-foreground mt-14 border p-5 text-sm">
          This document is a drafting starting point and has not yet been reviewed by a
          UAE qualified legal practitioner. It must be reviewed and adapted before the
          business trades.
        </p>
      </article>
    </Section>
  );
}
