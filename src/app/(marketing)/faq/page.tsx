import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { FaqSection } from "@/components/marketing/faq-section";
import { faqJsonLd } from "@/lib/seo";
import { homeFaqs } from "@/content/faqs";
import { pricingFaqs } from "@/content/faqs-pricing";
import { processFaqs } from "@/content/faqs-process";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Straight answers about UAE visas, costs, timelines, document attestation and how our AI checks work — including the questions most consultancies avoid.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const all = [...homeFaqs, ...pricingFaqs, ...processFaqs];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(all)) }}
      />

      <Section className="pb-4">
        <SectionHeading
          eyebrow="FAQ"
          title="Straight answers, including the awkward ones."
          description="If a question here has an answer that costs us a sale, that is usually a sign it was worth publishing."
        />
      </Section>

      <FaqSection items={homeFaqs} eyebrow="General" title="About us and the process" />
      <FaqSection items={pricingFaqs} eyebrow="Money" title="Costs, fees and refunds" />
      <FaqSection
        items={processFaqs}
        eyebrow="Applications"
        title="Documents, timelines and rejections"
      />

      <Section>
        <div className="bg-surface border-border rounded-card border p-8">
          <h2 className="text-h2">Still not answered?</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Ask us directly. If your question turns out to be one other people have, it
            ends up on this page.
          </p>
          <p className="mt-6">
            <Link href="/contact" className="text-primary font-medium hover:underline">
              Get in touch →
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
