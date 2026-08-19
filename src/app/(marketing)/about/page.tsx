import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About Us",
  description: `Why ${brand.name} exists, how we make money, and what we refuse to do. A UAE visa and business setup consultancy built around transparent pricing and self-serve answers.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-8">
        <div className="max-w-3xl">
          <h1 className="text-h1">
            We built the consultancy we couldn&apos;t find.
          </h1>
          <div className="mt-6 space-y-5 text-lead text-muted-foreground">
            <p>
              The UAE visa industry works. Applications get filed, visas get issued, and
              most consultants are competent. What it doesn&apos;t do is tell you
              anything before you&apos;ve handed over your phone number.
            </p>
            <p>
              Ask what a Golden Visa costs and you get &ldquo;from AED 9,000&rdquo; and a
              callback request. Ask whether you qualify and you get a form. Ask for an
              update mid-process and you get silence, then &ldquo;still processing&rdquo;.
              None of that is malicious. It is just what happens when the whole business
              model runs on controlling information.
            </p>
            <p className="text-foreground">
              {brand.name} is built on the opposite bet: that giving away the answers wins
              more business than hoarding them.
            </p>
          </div>
        </div>
      </Section>

      <Section className="py-8">
        <SectionHeading
          eyebrow="How we make money"
          title="One line on every invoice. That's it."
          description="Government fees and third-party costs pass through at cost. Our service fee is the only thing we earn, and it is printed on every page of this website before you ever speak to us."
        />
        <div className="mt-8 max-w-3xl space-y-5 text-muted-foreground">
          <p>
            This matters more than it sounds. Once a consultancy earns a hidden margin on
            pass-through fees, every incentive bends: they steer you toward the free zone
            that pays the best commission rather than the one that fits your activity, and
            they can never show you an itemised quote without exposing the markup.
          </p>
          <p>
            We took that option off the table deliberately. Our pricing engine has no
            concept of a markup on a government fee — you can read the code that generates
            every price on this site, and it is the same code that generates your invoice.
          </p>
        </div>
      </Section>

      <Section className="py-8">
        <SectionHeading
          eyebrow="What we won't do"
          title="The list matters more than the promises."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              title: "We won't guarantee an outcome",
              body: "Visa decisions belong to UAE authorities. Anyone guaranteeing approval is either lying or planning to blame you when it fails. We tell you readiness and likelihood, and we show our reasoning.",
            },
            {
              title: "We won't imply government affiliation",
              body: "We are a private consultancy with no connection to the ICP, GDRFA, MoHRE or any embassy. Firms that blur this line are relying on your uncertainty.",
            },
            {
              title: "We won't host our own review wall",
              body: "Self-published all-five-star reviews are now a scam signal, and rightly so. When we publish reviews they will live on independent platforms with the bad ones intact.",
            },
            {
              title: "We won't hold your answer hostage",
              body: "Eligibility and pricing are public information. Putting them behind a lead form is a choice, and we've made the other one.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <h3 className="font-display text-h3">{item.title}</h3>
                <p className="mt-2.5 text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-8">
        <div className="max-w-3xl">
          <h2 className="text-h2">Where the AI fits</h2>
          <div className="mt-5 space-y-5 text-muted-foreground">
            <p>
              In May 2026 the UAE began screening work permit applications with an
              automated system that scores skills, education and experience against live
              labour-market data and verifies documents automatically. That is a genuine
              shift: the first assessment of your file is now made by software.
            </p>
            <p>
              So we built software that runs those checks first. Your documents are
              validated on upload against the same criteria — passport validity, photo
              specification, name consistency, attestation chains — and you see a
              rejection-risk score before you have spent a dirham on government fees.
            </p>
            <p>
              What our AI does <em>not</em> do is decide whether you are eligible. That is
              a deterministic rules engine with versioned, effective-dated rules, so every
              result can be reproduced and audited. The language model explains the
              outcome in plain English. It never overrides it. When you are dealing with
              someone&apos;s right to live in a country, &ldquo;the model said so&rdquo;
              is not an acceptable answer.
            </p>
          </div>
          <ButtonLink href="/eligibility" variant="primary" className="mt-8">
            See it for yourself
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
