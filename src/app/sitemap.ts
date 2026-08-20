import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { services } from "@/domain/catalog/services";
import { guides } from "@/content/guides";
import { legalDocuments } from "@/content/legal";
import { prefixedLocales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/eligibility", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  return [
    // Localised homepages. Only the pages that are genuinely translated are listed —
    // submitting a URL that serves English under an Arabic path invites a duplicate-
    // content penalty and wastes crawl budget.
    ...prefixedLocales.map((locale) => ({
      url: `${brand.url}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...staticRoutes.map((route) => ({
      url: `${brand.url}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: `${brand.url}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...guides.map((guide) => ({
      url: `${brand.url}/guides/${guide.slug}`,
      lastModified: new Date(guide.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...legalDocuments.map((doc) => ({
      url: `${brand.url}/legal/${doc.slug}`,
      lastModified: new Date(doc.updated),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
