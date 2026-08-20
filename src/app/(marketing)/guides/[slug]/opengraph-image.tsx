import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { getGuide, guides } from "@/content/guides";

export const alt = "Guide";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) return ogImage({ title: "Guides" });

  return ogImage({
    eyebrow: guide.category,
    title: guide.title,
    meta: `${guide.readingMinutes} min read`,
  });
}
