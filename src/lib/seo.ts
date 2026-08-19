import { brand } from "@/config/brand";
import type { ServiceDefinition } from "@/domain/catalog/types";
import { buildQuote } from "@/domain/pricing/quote";

/**
 * Structured data helpers.
 *
 * Emitted server-side in the document head so crawlers see them without executing
 * JavaScript. Rich results for services and FAQs are the cheapest organic-traffic win
 * available to us against competitors who have an eight-year content head start.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${brand.url}/#organization`,
    name: brand.name,
    legalName: brand.legalName,
    description: brand.description,
    url: brand.url,
    email: brand.email.general,
    telephone: brand.phone.e164,
    priceRange: "AED",
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address.street,
      addressLocality: brand.address.locality,
      addressRegion: brand.address.region,
      addressCountry: brand.address.country,
      postalCode: brand.address.postalCode,
    },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    sameAs: [brand.social.linkedin, brand.social.instagram],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${brand.url}/#website`,
    url: brand.url,
    name: brand.name,
    publisher: { "@id": `${brand.url}/#organization` },
    inLanguage: "en-AE",
  };
}

export function serviceJsonLd(service: ServiceDefinition) {
  const quote = buildQuote(service);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.summary,
    provider: { "@id": `${brand.url}/#organization` },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    url: `${brand.url}/services/${service.slug}`,
    offers: {
      "@type": "Offer",
      price: quote.total,
      priceCurrency: brand.currency,
      availability: "https://schema.org/InStock",
      url: `${brand.url}/services/${service.slug}`,
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${brand.url}${crumb.path}`,
    })),
  };
}
