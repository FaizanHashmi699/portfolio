import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { FaqSection } from "@/components/marketing/faq-section";
import { faqJsonLd } from "@/lib/seo";
import { services } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";
import { pricingFaqs } from "@/content/faqs-pricing";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparent Pricing — Every UAE Visa Fee, Itemised",
  description:
    "See the complete cost of any UAE visa, business setup or attestation service: government fees, third-party costs, our service fee and VAT, itemised separately. No 'from' prices, no contact form.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(pricingFaqs)) }}
      />

      <Section className="pb-8">
        <SectionHeading
          as="h1"
          eyebrow="Pricing"
          title="Four lines. That's the whole quote."
          description="Every price we publish splits into what the government takes, what mandated third parties take, what we take, and VAT. You can verify each one independently — which is exactly the point."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              tone: "neutral" as const,
              label: "Government fees",
              body: "Paid to the ICP, GDRFA, MoHRE, DED or a free zone authority. We pass these through at cost — we do not mark them up.",
            },
            {
              tone: "neutral" as const,
              label: "Third-party costs",
              body: "Medical centres, insurers, typing centres, couriers, attestation agents. Also passed through at cost.",
            },
            {
              tone: "accent" as const,
              label: "Our service fee",
              body: "The only line we earn. Shown on every quote, on this website, before you ever speak to us.",
            },
            {
              tone: "neutral" as const,
              label: "VAT at 5%",
              body: "Applied per line, not to the total. Government fees are generally outside VAT scope, so we don't charge it on them.",
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <Badge tone={item.tone}>{item.label}</Badge>
                <p className="text-muted-foreground mt-3 text-sm">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Work out your cost</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          No form, no email address. This runs the same pricing engine that produces
          your invoice, so what you see here is what you would actually be charged.
        </p>
        <div className="mt-8">
          <CostCalculator initialSlug={service} />
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Every service, every price</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          The complete list. One applicant, standard processing, all fees included.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-border-strong border-b text-left">
                <th scope="col" className="py-3 pr-4 font-medium">
                  Service
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  Pass-through
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  Our fee
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">
                  VAT
                </th>
                <th scope="col" className="py-3 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {services.map((item) => {
                const quote = buildQuote(item);
                return (
                  <tr key={item.slug}>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/services/${item.slug}`}
                        className="hover:text-primary font-medium"
                      >
                        {item.name}
                      </Link>
                      <span className="text-muted-foreground block text-xs">
                        {item.processingDays.min}–{item.processingDays.max} working days
                      </span>
                    </td>
                    <td className="text-muted-foreground py-3 pr-4 text-right tabular-nums">
                      {formatAed(quote.passThrough)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatAed(quote.serviceFee)}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4 text-right tabular-nums">
                      {formatAed(quote.vat)}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {formatAed(quote.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <FaqSection
        items={pricingFaqs}
        title="Questions about money"
        eyebrow="Pricing FAQ"
      />
    </>
  );
}
