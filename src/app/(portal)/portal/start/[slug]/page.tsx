import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { StartApplicationForm } from "@/components/portal/start-application-form";
import { getService, services } from "@/domain/catalog/services";
import { requireUser } from "@/server/auth";

export const metadata: Metadata = { title: "Start an application" };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function StartApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <Section className="py-10">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link href="/services" className="hover:text-foreground">
          ← All services
        </Link>
      </nav>

      <div className="mt-6">
        <Badge tone="brand">
          {service.processingDays.min}–{service.processingDays.max} working days
        </Badge>
        <h1 className="text-h1 mt-4">Start: {service.name}</h1>
        <p className="text-lead text-muted-foreground mt-3 max-w-2xl">
          {service.summary}
        </p>
      </div>

      <div className="mt-10">
        <StartApplicationForm service={service} />
      </div>
    </Section>
  );
}
