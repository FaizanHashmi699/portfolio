import { services } from "@/domain/catalog/services";
import { pillars } from "@/domain/catalog/pillars";
import { guides } from "@/content/guides";
import { countries } from "@/domain/geography/countries";
import { freeZones } from "@/domain/geography/free-zones";
import { legalDocuments } from "@/content/legal";
import { homeFaqs } from "@/content/faqs";
import { pricingFaqs } from "@/content/faqs-pricing";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed, slugify } from "@/lib/utils";

/**
 * Site search.
 *
 * A build-time index over our own content, scored in the browser. No search service, no
 * network round trip, no third-party script — which matters both for the content security
 * policy and because the index is small enough that anything heavier would be architecture
 * for its own sake.
 */

export type SearchKind = "service" | "guide" | "country" | "free-zone" | "faq" | "page";

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  /** Extra terms that should match but do not belong in the visible text. */
  keywords: string[];
  /** Shown at the end of a result row, e.g. a price or a reading time. */
  meta?: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  service: "Service",
  guide: "Guide",
  country: "By nationality",
  "free-zone": "Free zone",
  faq: "Question",
  page: "Page",
};

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const service of services) {
    entries.push({
      id: `service-${service.slug}`,
      kind: "service",
      title: service.name,
      description: service.summary,
      href: `/services/${service.slug}`,
      keywords: [
        service.pillar,
        service.audience,
        ...service.documents.map((doc) => doc.label),
        ...service.commonRejectionReasons,
      ],
      meta: formatAed(buildQuote(service).total),
    });
  }

  for (const pillar of pillars) {
    entries.push({
      id: `pillar-${pillar.slug}`,
      kind: "page",
      title: pillar.name,
      description: pillar.description,
      href: `/services?pillar=${pillar.slug}`,
      keywords: [pillar.headline],
    });
  }

  for (const guide of guides) {
    entries.push({
      id: `guide-${guide.slug}`,
      kind: "guide",
      title: guide.title,
      description: guide.description,
      href: `/guides/${guide.slug}`,
      keywords: [guide.category, ...guide.sections.map((section) => section.heading)],
      meta: `${guide.readingMinutes} min`,
    });
  }

  for (const country of countries) {
    entries.push({
      id: `country-${country.code}`,
      kind: "country",
      title: `UAE visa for ${country.demonym} citizens`,
      description: `Entry rules and the exact document attestation chain for ${country.name}.`,
      href: `/uae-visa-for/${slugify(country.name)}`,
      keywords: [
        country.name,
        country.demonym,
        country.code,
        country.region,
        country.attestation,
      ],
    });
  }

  for (const zone of freeZones) {
    entries.push({
      id: `zone-${zone.slug}`,
      kind: "free-zone",
      title: zone.name,
      description: zone.bestFor,
      href: `/free-zones/${zone.slug}`,
      keywords: [zone.shortName ?? "", zone.emirate, zone.tier, ...zone.activityFocus],
      meta: zone.emirate,
    });
  }

  for (const [index, faq] of [...homeFaqs, ...pricingFaqs].entries()) {
    entries.push({
      id: `faq-${index}`,
      kind: "faq",
      title: faq.question,
      description: faq.answer.slice(0, 180),
      href: "/faq",
      keywords: [],
    });
  }

  for (const document of legalDocuments) {
    entries.push({
      id: `legal-${document.slug}`,
      kind: "page",
      title: document.title,
      description: document.description,
      href: `/legal/${document.slug}`,
      keywords: document.sections.map((section) => section.heading),
    });
  }

  return entries;
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Field-weighted scoring. A title match beats a description match, which beats a keyword
 * match — someone typing "golden visa" wants the Golden Visa page, not every page that
 * happens to mention it.
 */
export function searchEntries(
  index: SearchEntry[],
  query: string,
  limit = 20,
): SearchEntry[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  const scored = index.map((entry) => {
    const title = normalise(entry.title);
    const description = normalise(entry.description);
    const keywords = normalise(entry.keywords.join(" "));

    let score = 0;
    for (const term of terms) {
      if (title.startsWith(term)) score += 12;
      else if (title.includes(term)) score += 8;
      if (description.includes(term)) score += 3;
      if (keywords.includes(term)) score += 2;
    }

    // Every term must appear somewhere, or it is not a match at all. Without this,
    // "golden visa india" would return every page mentioning "visa".
    const matchesAll = terms.every(
      (term) =>
        title.includes(term) || description.includes(term) || keywords.includes(term),
    );

    return { entry, score: matchesAll ? score : 0 };
  });

  return scored
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((result) => result.entry);
}
