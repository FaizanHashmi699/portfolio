import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { getService, services } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";

export const alt = "Service cost breakdown";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return ogImage({ title: "UAE visas & business setup" });
  }

  // The price goes on the card itself. Somebody sharing this in a WhatsApp group is
  // sharing the number, which is the entire point of the positioning.
  return ogImage({
    eyebrow: `${service.processingDays.min}–${service.processingDays.max} working days`,
    title: service.name,
    meta: `${formatAed(buildQuote(service).total)} all in`,
  });
}
