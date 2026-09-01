import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manaratfoundation.org.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/prayer-times`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/programmes`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/calendar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/qibla`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/appeal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/donate`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("programmes").select("slug").eq("published", true);
    for (const p of data ?? []) {
      routes.push({
        url: `${BASE}/programmes/${(p as { slug: string }).slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // A sitemap without the programme pages is better than no sitemap.
  }

  return routes;
}
