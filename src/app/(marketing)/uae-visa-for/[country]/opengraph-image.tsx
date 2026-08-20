import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { countries } from "@/domain/geography/countries";
import { slugify } from "@/lib/utils";

export const alt = "UAE visa requirements by nationality";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return countries.map((country) => ({ country: slugify(country.name) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = await params;
  const country = countries.find((item) => slugify(item.name) === slug);

  if (!country) return ogImage({ title: "UAE visa requirements by nationality" });

  return ogImage({
    eyebrow: country.region,
    title: `UAE visas for ${country.demonym} citizens`,
    meta:
      country.attestation === "apostille" ? "Apostille route" : "Embassy legalisation",
  });
}
