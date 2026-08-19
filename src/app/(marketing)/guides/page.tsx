import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { guides } from "@/content/guides";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides to UAE visas, Golden Visa routes, degree attestation and Dubai business setup — written to answer the questions most consultancy content avoids.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Guides"
        title="The answers most consultancies leave out."
        description="We write about the parts where the honest answer costs the writer a lead — which route you don't qualify for, why a cheaper quote isn't cheaper, and what actually causes refusals."
      />

      <ul className="mt-12 grid gap-5 md:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Card className="relative h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{guide.category}</Badge>
                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                    <Clock className="size-3.5" />
                    {guide.readingMinutes} min read
                  </span>
                </div>

                <h2 className="font-display text-h3 mt-4">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="hover:text-primary after:absolute after:inset-0"
                  >
                    {guide.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mt-2.5 flex-1 text-sm">
                  {guide.description}
                </p>
                <p className="text-muted-foreground mt-4 text-xs">
                  Updated {formatDate(guide.updated)}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
