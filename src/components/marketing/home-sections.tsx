import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileSearch,
  Globe2,
  PlaneLanding,
  Receipt,
  Radar,
  Stamp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pillars } from "@/domain/catalog/pillars";
import { popularServices, servicesByPillar } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { formatAed } from "@/lib/utils";
import { brand } from "@/config/brand";

const PILLAR_ICONS = { PlaneLanding, Building2, Globe2, Stamp } as const;

/** The category's actual failure modes, named. This is the whole positioning. */
export function ProblemSection() {
  const problems = [
    {
      wrong: "“Starting from AED 12,900.”",
      right:
        "A full itemised total, with government, third-party and our own fee on separate lines.",
      detail:
        "Every competitor leads with a floor price and reveals the rest after you have given them your number. Fee surprise is the single biggest driver of this industry's terrible reviews.",
    },
    {
      wrong: "“Fill in this form and an advisor will call you.”",
      right: "Answer ten questions and get your answer on screen, immediately.",
      detail:
        "Whether you qualify for a Golden Visa is public information. Holding it hostage behind a lead form is a choice, and it is not one we make.",
    },
    {
      wrong: "“Any update?” — sent for the fourth time.",
      right: "A live timeline showing the stage, the date and whose turn it is.",
      detail:
        "For a process that runs two to four weeks and involves non-refundable fees, being kept in the dark is the most stressful part of the whole experience.",
    },
    {
      wrong: "Your file is rejected after you have paid.",
      right: "Documents are checked at upload, before a single fee is spent.",
      detail:
        "Applications fail on trivia: six months of passport validity, a photo background, an unattested degree. Every one of those is catchable in advance.",
    },
  ];

  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow="Why we exist"
        title="The problem is not the paperwork. It's the not knowing."
        description="We studied the five largest consultancies in this market. They differ in price and polish, but they share the same four habits — and every one of them costs you."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {problems.map((problem) => (
          <Card key={problem.wrong} className="flex flex-col">
            <CardContent className="flex-1 pt-6">
              <p className="text-muted-foreground decoration-danger-500/60 flex items-start gap-2.5 text-sm line-through decoration-2">
                <XCircle className="text-danger-500 mt-0.5 size-4 shrink-0 no-underline" />
                <span>{problem.wrong}</span>
              </p>
              <p className="mt-4 flex items-start gap-2.5 font-medium">
                <CheckCircle2 className="text-success-500 mt-0.5 size-4 shrink-0" />
                <span>{problem.right}</span>
              </p>
              <p className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
                {problem.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/** The AI angle, grounded in the actual May 2026 government change. */
export function AiSection() {
  const capabilities = [
    {
      icon: Radar,
      title: "Eligibility scored against published criteria",
      body: "Our rules engine checks your profile against every route — salary, property, talent, creator, entrepreneur — and ranks them. Deterministic, versioned and auditable. The AI explains the result; it never decides it.",
    },
    {
      icon: FileSearch,
      title: "Documents checked the way the government checks them",
      body: "Passport validity, photo specification, name consistency across your file, and the full attestation chain. You get a rejection-risk score and a fix list before any fee is paid.",
    },
    {
      icon: Receipt,
      title: "Costs computed, not quoted",
      body: "Every price on this site is produced by the same pricing engine that produces your invoice. There is no separate 'sales number' — the architecture makes a bait-and-switch impossible.",
    },
  ];

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge tone="accent">
            <Sparkle /> What changed in 2026
          </Badge>
          <h2 className="text-h2 mt-4">
            The UAE started screening applications with AI. Most consultants
            haven&apos;t noticed.
          </h2>
          <div className="text-lead text-muted-foreground mt-5 space-y-4">
            <p>
              Since May 2026 the ICP and MoHRE have screened work permits with an
              automated system that scores skills, education and experience against live
              labour-market data, and verifies passports, photographs and certificates
              automatically.
            </p>
            <p>
              That quietly changes what a consultancy is for. When a machine makes the
              first assessment, the value is no longer knowing someone at the counter —
              it is{" "}
              <strong className="text-foreground">
                predicting the machine&apos;s verdict before you pay
              </strong>
              . That is the product we built.
            </p>
          </div>
          <ButtonLink href="/eligibility" variant="primary" className="mt-8">
            Run the checks on my file
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>

        <ul className="space-y-4">
          {capabilities.map((item) => (
            <li key={item.title}>
              <Card>
                <CardContent className="flex gap-4 pt-6">
                  <span className="bg-ink-50 text-ink-600 dark:bg-ink-950 dark:text-ink-300 flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-sm">{item.body}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 10.35l-5.91 2.09L12 18.7l-2.09-6.26L4 10.35l5.91-2.09z" />
    </svg>
  );
}

export function ServicesSection() {
  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow="What we do"
        title="Four service lines, one standard of honesty."
        description="Every service below publishes its full fee breakdown, its realistic processing window, and the reasons applications like yours actually get rejected."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.icon as keyof typeof PILLAR_ICONS];
          const count = servicesByPillar(pillar.slug).length;
          return (
            <Card key={pillar.slug} className="group flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <span className="bg-ink-50 text-ink-600 group-hover:bg-accent group-hover:text-accent-foreground dark:bg-ink-950 dark:text-ink-300 flex size-12 items-center justify-center rounded-xl transition-colors">
                  {Icon && <Icon className="size-6" />}
                </span>
                <h3 className="font-display text-h3 mt-5">{pillar.name}</h3>
                <p className="text-muted-foreground mt-2 flex-1 text-sm">
                  {pillar.description}
                </p>
                <Link
                  href={`/services?pillar=${pillar.slug}`}
                  className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2.5"
                >
                  {count} services
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

export function PopularSection() {
  const featured = popularServices();

  return (
    <Section>
      <SectionHeading
        eyebrow="Real prices"
        title="No “from”. No “contact us”. Just the total."
        description="These are complete, all-in figures at today's published rates — government fees, third-party costs, our fee and VAT. The same engine that renders this page renders your invoice."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {featured.map((service) => {
          const quote = buildQuote(service);
          return (
            <Card key={service.slug} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <Badge tone="brand" className="self-start">
                  {service.processingDays.min}–{service.processingDays.max} working days
                </Badge>
                <h3 className="font-display text-h3 mt-4">{service.name}</h3>
                <p className="text-muted-foreground mt-2 flex-1 text-sm">
                  {service.summary}
                </p>

                <dl className="border-border mt-5 space-y-1.5 border-t pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">
                      Government &amp; third party
                    </dt>
                    <dd className="tabular-nums">{formatAed(quote.passThrough)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Our fee</dt>
                    <dd className="tabular-nums">{formatAed(quote.serviceFee)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">VAT (5%)</dt>
                    <dd className="tabular-nums">{formatAed(quote.vat)}</dd>
                  </div>
                  <div className="border-border flex justify-between gap-3 border-t pt-2 font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatAed(quote.total)}</dd>
                  </div>
                </dl>

                <Link
                  href={`/services/${service.slug}`}
                  className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2.5"
                >
                  Full breakdown
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        Government fees are set by the authorities and change without notice. Where a
        cost genuinely varies — insurance by age, free zone by activity — we mark it as
        an estimate rather than pretending to a precision we don&apos;t have.
      </p>
    </Section>
  );
}

export function ProcessSection() {
  const steps = [
    {
      title: "Check eligibility",
      body: "Ten questions, about two minutes. You get a ranked list of every route you qualify for, what's missing, and how to fix it. No sign-up, no phone number.",
    },
    {
      title: "See the real cost",
      body: "A complete itemised quote for the route you choose, with every fee attributed to whoever actually receives it. Written, and honoured.",
    },
    {
      title: "Upload and get checked",
      body: "Documents are validated as you upload them against the same criteria the government's own screening applies. You fix problems before spending anything.",
    },
    {
      title: "Track it to the end",
      body: "A live timeline with each stage, its date, and whose turn it is to act. You never have to ask for an update, because you already have it.",
    },
  ];

  return (
    <Section className="bg-surface">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps, and you can see all of them."
        align="center"
      />

      <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            <span
              className="font-display text-5xl font-bold text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-h3 mt-3">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/**
 * Deliberately not a testimonial wall.
 *
 * Research on this category shows self-hosted all-five-star reviews now read as a scam
 * signal rather than a trust signal. Until there are real verifiable reviews to show,
 * stating the policy is worth more than inventing the proof.
 */
export function TrustSection() {
  const commitments = [
    {
      title: "We quote it, we honour it",
      body: "The written quote is the price. If a government fee changes between quote and submission, we show you the difference and you decide — we never adjust it silently.",
    },
    {
      title: "No guaranteed approvals, ever",
      body: "Nobody can promise an immigration outcome, and anyone who does is telling you something useful about themselves. We tell you likelihood and readiness, with our reasoning shown.",
    },
    {
      title: "Reviews only where you can verify them",
      body: "We will not host our own five-star wall. When we publish reviews they will be on independent platforms, with the bad ones left where they are.",
    },
    {
      title: "Your documents stay yours",
      body: "Passports and certificates are encrypted, access is logged, and files are deleted on request. We never sell or share your data with third parties.",
    },
  ];

  return (
    <Section>
      <SectionHeading
        eyebrow="Where we stand"
        title="Four commitments we'd rather be held to than advertise."
        description="This industry has a trust problem it earned. These are the specific things we do differently, written plainly enough that you can hold us to them."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {commitments.map((item) => (
          <Card key={item.title}>
            <CardContent className="pt-6">
              <h3 className="font-display text-h3 flex items-center gap-2.5">
                <CheckCircle2 className="text-success-500 size-5 shrink-0" />
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function CtaSection() {
  return (
    <Section>
      <div className="rounded-card relative overflow-hidden bg-slate-950 px-6 py-16 text-center text-slate-50 md:px-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_0%,oklch(0.417_0.129_257)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-h1">Find out where you stand.</h2>
          <p className="text-lead mt-5 text-slate-300">
            Two minutes. No phone number. You keep the result whether or not you ever
            hire us.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/eligibility" variant="primary" size="lg">
              Check my eligibility
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Talk to a human
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Or message us on WhatsApp at {brand.whatsapp.display}
          </p>
        </div>
      </div>
    </Section>
  );
}
