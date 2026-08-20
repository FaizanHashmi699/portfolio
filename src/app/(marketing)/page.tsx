import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import {
  AiSection,
  CtaSection,
  PopularSection,
  ProblemSection,
  ProcessSection,
  ServicesSection,
  TrustSection,
} from "@/components/marketing/home-sections";
import { faqJsonLd } from "@/lib/seo";
import { alternateLanguages } from "@/i18n/config";
import { homeFaqs } from "@/content/faqs";
import { FaqSection } from "@/components/marketing/faq-section";

export const metadata: Metadata = {
  title: "UAE Visas & Business Setup, Priced Honestly",
  description:
    "Check which UAE visa you qualify for in two minutes — no phone number required. Then see the full cost broken down to the dirham: government fees, third-party costs, our fee and VAT.",
  alternates: { canonical: "/", languages: alternateLanguages() },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(homeFaqs)) }}
      />
      <Hero />
      <ProblemSection />
      <AiSection />
      <ServicesSection />
      <PopularSection />
      <ProcessSection />
      <TrustSection />
      <FaqSection items={homeFaqs} />
      <CtaSection />
    </>
  );
}
