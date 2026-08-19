import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EligibilityWizard } from "@/components/eligibility/wizard";
import { getService } from "@/domain/catalog/services";

export const metadata: Metadata = {
  title: "Check Your UAE Visa Eligibility — Free, No Sign-Up",
  description:
    "Answer about ten questions and see which UAE visa routes you qualify for, what's missing, and exactly how to fix it. No phone number, no sales call, no obligation.",
  alternates: { canonical: "/eligibility" },
};

export default async function EligibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: serviceSlug } = await searchParams;
  const service = serviceSlug ? getService(serviceSlug) : undefined;

  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent">Free · No sign-up · About 2 minutes</Badge>
        <h1 className="mt-4 text-h1">
          {service ? `Do you qualify for ${service.name}?` : "Which UAE visa do you qualify for?"}
        </h1>
        <p className="mt-4 text-lead text-muted-foreground">
          We check your answers against the published criteria for every route, then show
          you what you meet, what you don&apos;t, and precisely what it takes to close the
          gap.
        </p>
      </div>

      <div className="mt-14">
        <EligibilityWizard initialService={serviceSlug} />
      </div>
    </Section>
  );
}
