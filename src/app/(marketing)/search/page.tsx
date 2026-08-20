import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { SiteSearch } from "@/components/marketing/site-search";
import { buildSearchIndex } from "@/domain/search";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search services, guides, nationality requirements, free zones and common questions.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // Built at request time from static content, so it never drifts from what is published.
  const index = buildSearchIndex();

  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h1">Search</h1>
        <p className="text-lead text-muted-foreground mt-3">
          Everything we publish, in one place.
        </p>
        <div className="mt-8">
          <SiteSearch index={index} initialQuery={q ?? ""} />
        </div>
      </div>
    </Section>
  );
}
