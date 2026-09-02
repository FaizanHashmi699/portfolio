import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { LivePrayerClock } from "@/components/live-prayer";
import { IslamicEvents } from "@/components/islamic-events";
import { CampaignProgress } from "@/components/campaign-progress";
import { WaysToGive } from "@/components/ways-to-give";
import { Testimonials } from "@/components/testimonials";
import { FaqAccordion, type FaqItem } from "@/components/faq";
import { Reveal, CountUp } from "@/components/motion";
import {
  Container,
  Section,
  SectionHead,
  Button,
  Card,
  ArrowIcon,
  KhatimPattern,
  Figure,
} from "@/components/ui";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { moneyShort } from "@/lib/format";
import Link from "next/link";
import type { Campaign, Programme, Testimonial } from "@/lib/types";

export const revalidate = 300;

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "Sheldon · Solihull · Birmingham",
    title: "A light for",
    titleAccent: "the community.",
    body: "Manarat means lighthouse. Founded by scholars in 2012, we were the first purpose-established masjid and Islamic centre for the Muslims of this area.",
    primary: { label: "Today's prayer times", href: "/prayer-times" },
    secondary: { label: "About Manarat", href: "/about" },
  },
  {
    eyebrow: "The Academy",
    title: "Hifz, Arabic and",
    titleAccent: "Islamic studies.",
    body: "A three-year Qur'an memorisation programme, Arabic from the alphabet upward, and Tajweed taught by qualified huffaz — weekdays and weekends.",
    primary: { label: "See our classes", href: "/programmes" },
    secondary: { label: "Enquire about a place", href: "/programmes/hifz" },
  },
  {
    eyebrow: "The Manarat Expansion",
    title: "Room for every",
    titleAccent: "worshipper.",
    body: "On Jumu'ah the hall is full and our classes are at capacity. This appeal funds an extended prayer hall, four teaching rooms and a dedicated women's area.",
    primary: { label: "Support the appeal", href: "/donate" },
    secondary: { label: "What it funds", href: "/appeal" },
  },
];

/**
 * The services a masjid is actually asked for. Each one is a real reason
 * somebody picks up the phone, so each is a reason to land on this page.
 */
const SERVICES = [
  {
    title: "Nikah & marriage",
    body: "Islamic marriage ceremonies conducted by our imams, with guidance for couples beforehand.",
    d: "M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8.4 1.9c0 5.7-8.4 10.5-8.4 10.5Z",
    href: "/contact",
  },
  {
    title: "Janazah & bereavement",
    body: "Funeral prayers, ghusl arrangements and support for the family through a difficult time.",
    d: "M12 3.5v17M6.5 9h11M4.5 20.5h15",
    href: "/contact",
  },
  {
    title: "New Muslim support",
    body: "Taking your shahadah, and the classes and companionship that should follow it.",
    d: "M12 3.6 14.6 9l5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.8 9.4 9Z",
    href: "/contact",
  },
  {
    title: "Qur'an & Tajweed",
    body: "Recitation corrected properly, for children and adults, at the level you are actually at.",
    d: "M4 18V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5M8 8.5h7",
    href: "/programmes",
  },
  {
    title: "Community events",
    body: "Iftars in Ramadan, Eid gatherings, talks and the ordinary business of a masjid that is used.",
    d: "M7 3v3M17 3v3M3.5 9.5h17M4.5 6h15v14h-15z",
    href: "/calendar",
  },
  {
    title: "Counselling & advice",
    body: "A confidential conversation with someone qualified, on family, faith or what is weighing on you.",
    d: "M20 12a8 8 0 1 1-3.2-6.4M8.5 9.5h7M8.5 13h4.5",
    href: "/contact",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "What time is Jumu'ah?",
    a: "We hold two Jumu'ah congregations every Friday. The exact times are shown on the prayer times page and on the screen in the foyer — they shift with the season, so we publish them live rather than in a fixed PDF.",
  },
  {
    q: "Can I visit if I am not Muslim?",
    a: "Yes, and you are welcome. If you would like to look around or ask questions, get in touch beforehand and someone will meet you and show you the building properly.",
  },
  {
    q: "Is there parking?",
    a: "Yes — free parking on site. It fills up close to Jumu'ah, so allow a few extra minutes on a Friday.",
  },
  {
    q: "Is there a separate area for women?",
    a: "Yes. Provision for sisters is part of what the current expansion appeal is funding, so that it is a proper dedicated space rather than an overflow.",
  },
  {
    q: "How do I enrol my child in the academy?",
    a: "Every programme page lists the ages, the timetable and the fees, and carries an enquiry form. Send that and a member of the team will come back to you about a place.",
  },
  {
    q: "Can I pay my Zakat here?",
    a: "Yes. Choose Zakat when you give and it is kept separate from general funds, then distributed only to those in the eight categories the Qur'an names.",
  },
  {
    q: "Is Gift Aid worth adding?",
    a: "If you pay UK income or capital gains tax, yes — it adds 25p to every pound at no cost to you. Tick the box when you donate and we claim it from HMRC.",
  },
  {
    q: "How do I know the money is handled properly?",
    a: "Manarat Foundation is registered charity number 1148223. Our accounts are filed with the Charity Commission each year and are public.",
  },
];

export default async function HomePage() {
  const settings = await getPrayerSettings();
  const config = toPrayerConfig(settings);
  const supabase = await createClient();

  const [{ data: programmes }, { data: campaign }, { data: quotes }] =
    await Promise.all([
      supabase
        .from("programmes")
        .select("*")
        .eq("published", true)
        .order("sort_order"),
      supabase
        .from("campaigns")
        .select("*")
        .eq("is_primary", true)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("testimonials")
        .select("*")
        .eq("published", true)
        .order("sort_order"),
    ]);

  const list = (programmes ?? []) as Programme[];
  const appeal = campaign as Campaign | null;
  const testimonials = (quotes ?? []) as Testimonial[];

  // Only figures we can stand behind: the founding year, the hall's capacity,
  // the fixed shape of the week, and a live count of what the academy teaches.
  const stats: {
    value: number;
    label: string;
    note: string;
    plain?: boolean;
    suffix?: string;
  }[] = [
    {
      value: 2012,
      label: "Established",
      note: "Founded by scholars",
      plain: true,
    },
    {
      value: 1000,
      label: "Worshippers",
      note: "Capacity of the hall",
      suffix: "+",
    },
    ...(list.length > 0
      ? [
          {
            value: list.length,
            label: "Programmes",
            note: "Running at the academy",
          },
        ]
      : []),
    {
      value: 5,
      label: "Daily prayers",
      note: "Plus two Jumu'ah congregations",
    },
  ];

  // The Mosque/Organization entity lives in the root layout; this page adds
  // only the FAQ and points it back at that entity by id, so search engines
  // see one organisation rather than two competing descriptions of it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://manaratfoundation.org.uk#faq",
    about: { "@id": "https://manaratfoundation.org.uk#organisation" },
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main id="main">
        {/* 1 ------------------------------------------------------- hero */}
        <HeroSlider
          slides={SLIDES}
          aside={
            <LivePrayerClock
              config={config}
              jumuahTimes={settings.jumuah_times}
            />
          }
        />

        {/* 2 ----------------------------------------------- quick actions */}
        <Section tone="surface" className="!py-0">
          <Container>
            <div className="-mt-10 grid gap-3 rounded-panel border border-rule bg-surface p-3 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  href: "/prayer-times",
                  title: "Prayer times",
                  note: "Today and the month ahead",
                  d: "M12 6.6V12l3.6 2.2M20.4 12a8.4 8.4 0 1 1-16.8 0 8.4 8.4 0 0 1 16.8 0Z",
                },
                {
                  href: "/programmes",
                  title: "Our classes",
                  note: "Hifz, Arabic, Islamic studies",
                  d: "M4 18V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5M8 8.5h7",
                },
                {
                  href: "/calendar",
                  title: "Islamic calendar",
                  note: "Ramadan, Eid and the sacred days",
                  d: "M7 3v3M17 3v3M3.5 9.5h17M4.5 6h15v14h-15z",
                },
                {
                  href: "/donate",
                  title: "Give sadaqah",
                  note: "One-off or monthly, with Gift Aid",
                  d: "M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8.4 1.9c0 5.7-8.4 10.5-8.4 10.5Z",
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-start gap-4 rounded-card p-5 transition-colors duration-300 hover:bg-surface-2"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-brand-wash text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className="h-5 w-5 fill-none stroke-current stroke-[1.6]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={a.d} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-navy-900">
                      {a.title}
                    </span>
                    <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-soft">
                      {a.note}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* 3 ---------------------------------------------------- welcome */}
        <Section tone="surface">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <Figure
                    alt="The prayer hall at Manarat Foundation"
                    aspect="3/4"
                    seed={0}
                    className="mt-8"
                  />
                  <Figure
                    alt="Students in the Qur'an academy"
                    aspect="3/4"
                    seed={1}
                  />
                </div>
              </Reveal>

              <Reveal delay={100} className="order-1 lg:order-2">
                <SectionHead
                  eyebrow="Welcome to Manarat"
                  title={<>A masjid built by scholars, for its neighbours.</>}
                  lede="We began in 2012 as the first purpose-established masjid and Islamic centre for Sheldon, Solihull and the surrounding areas. Today more than a thousand worshippers pray here."
                />
                <ul className="mt-8 grid gap-4">
                  {[
                    [
                      "Founded by scholars",
                      "Our teaching is led by qualified ulama, not volunteers filling a gap.",
                    ],
                    [
                      "Open to everyone",
                      "We serve our neighbours whoever they are, and reject extremism in all its forms.",
                    ],
                    [
                      "Education first",
                      "From a child's first letters of Arabic to a three-year Hifz programme.",
                    ],
                  ].map(([t, d]) => (
                    <li key={t} className="flex gap-4">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-wash text-brand">
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden
                          className="h-3 w-3 fill-none stroke-current stroke-[2.4]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 8.5 6.5 12 13 4.5" />
                        </svg>
                      </span>
                      <span>
                        <span className="block font-bold text-navy-900">
                          {t}
                        </span>
                        <span className="mt-0.5 block text-[0.95rem] leading-relaxed text-ink-soft">
                          {d}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/about">Our story</Button>
                  <Button href="/contact" variant="outline">
                    Visit us
                  </Button>
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 4 ----------------------------------------------------- impact */}
        <Section tone="navy" className="overflow-hidden !py-14 sm:!py-16">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="stats" opacity={0.06} size={72} />
          </span>
          <Container className="relative">
            <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 80}>
                  <div className="border-l-2 border-blue-300/40 pl-5">
                    <dd className="font-display text-[clamp(2.2rem,4.5vw,3rem)] font-extrabold leading-none tracking-tight text-white">
                      {s.plain ? (
                        s.value
                      ) : (
                        <CountUp value={s.value} suffix={s.suffix ?? ""} />
                      )}
                    </dd>
                    <dt className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
                      {s.label}
                    </dt>
                    <p className="mt-1.5 text-sm text-white/55">{s.note}</p>
                  </div>
                </Reveal>
              ))}
            </dl>
          </Container>
        </Section>

        {/* 5 ---------------------------------------------------- academy */}
        {list.length > 0 && (
          <Section tone="ground">
            <Container>
              <SectionHead
                eyebrow="The Academy"
                title="Every class, in full detail."
                lede="Ages, timetable, fees and who teaches — so a parent can decide without picking up the phone."
                action={
                  <Button href="/programmes" variant="outline">
                    All programmes <ArrowIcon />
                  </Button>
                }
              />

              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {list.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 90}>
                    <Card interactive className="h-full overflow-hidden">
                      <Link
                        href={`/programmes/${p.slug}`}
                        className="block h-full"
                      >
                        <div className="grid h-full gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                          <Figure
                            alt={p.title}
                            aspect="1/1"
                            seed={i + 2}
                            className="!rounded-none !border-0 h-full"
                          />
                          <div className="p-6">
                            <h3 className="font-display text-[1.3rem] font-extrabold text-navy-900">
                              {p.title}
                            </h3>
                            <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">
                              {p.summary}
                            </p>
                            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-rule-soft pt-4 text-[0.78rem]">
                              {p.age_range && (
                                <div className="flex gap-1.5">
                                  <dt className="uppercase tracking-[0.1em] text-ink-mute">
                                    Ages
                                  </dt>
                                  <dd className="font-semibold text-ink">
                                    {p.age_range}
                                  </dd>
                                </div>
                              )}
                              {p.schedule && (
                                <div className="flex gap-1.5">
                                  <dt className="uppercase tracking-[0.1em] text-ink-mute">
                                    When
                                  </dt>
                                  <dd className="font-semibold text-ink">
                                    {p.schedule}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* 6 --------------------------------------------------- services */}
        <Section tone="surface">
          <Container>
            <SectionHead
              eyebrow="How we serve"
              title="What the masjid is here for."
              lede="Beyond the five daily prayers, these are the things people actually come to us for."
              align="center"
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s, i) => (
                <Reveal key={s.title} delay={(i % 3) * 80}>
                  <Link href={s.href} className="block h-full">
                    <Card interactive className="group h-full p-7">
                      <span
                        aria-hidden
                        className="grid h-12 w-12 place-items-center rounded-card bg-brand-wash text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 fill-none stroke-current stroke-[1.6]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={s.d} />
                        </svg>
                      </span>
                      <h3 className="mt-6 font-display text-[1.15rem] font-extrabold tracking-tight text-brand-deep">
                        {s.title}
                      </h3>
                      <p className="mt-2.5 text-[0.93rem] leading-[1.7] text-ink-soft">
                        {s.body}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand">
                        Find out more <ArrowIcon />
                      </span>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* 7 ----------------------------------------------- ways to give */}
        <Section tone="ground">
          <Container>
            <SectionHead
              eyebrow="Ways to give"
              title="Give as Zakat, Sadaqah or Lillah."
              lede="Choose the category your gift belongs to and we keep it in that category. Gift Aid adds 25p to every eligible pound at no cost to you."
              align="center"
            />
            <div className="mt-12">
              <WaysToGive />
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-[1.7] text-ink-mute">
              Manarat Foundation is registered charity 1148223. Accounts are
              filed with the Charity Commission every year.
            </p>
          </Container>
        </Section>

        {/* 8 ----------------------------------------------------- appeal */}
        {appeal && (
          <Section tone="navy" className="overflow-hidden">
            <span aria-hidden className="absolute inset-0 text-white">
              <KhatimPattern id="appeal" opacity={0.05} size={80} />
            </span>
            <span
              aria-hidden
              className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(21,145,220,.34), transparent 66%)",
              }}
            />
            <Container className="relative">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <Reveal>
                  <SectionHead
                    eyebrow="Our current appeal"
                    title={appeal.title}
                    lede={appeal.summary}
                    onNavy
                  />
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/donate" variant="white" size="lg">
                      Give to the appeal <ArrowIcon />
                    </Button>
                    <Button href="/appeal" variant="ghost-white" size="lg">
                      What it funds
                    </Button>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div className="rounded-panel border border-white/15 bg-white/[0.07] p-8 backdrop-blur-sm">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-blue-300">
                      Raised so far
                    </p>
                    <div className="mt-5">
                      <CampaignProgress
                        raisedPence={appeal.raised_pence}
                        targetPence={appeal.target_pence}
                        onNavy
                      />
                    </div>
                    <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                      {[
                        ["Target", moneyShort(appeal.target_pence)],
                        ["Gift Aid", "+25%"],
                        ["Charity", "1148223"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-white/50">
                            {k}
                          </dt>
                          <dd className="mt-1 font-display text-lg font-extrabold tabular-nums text-white">
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
              </div>
            </Container>
          </Section>
        )}

        {/* 9 ------------------------------------------------ testimonials */}
        {testimonials.length > 0 && (
          <Section tone="navy" className="overflow-hidden">
            <span aria-hidden className="absolute inset-0 text-blue-300">
              <KhatimPattern id="quotes" opacity={0.055} size={72} />
            </span>
            <Container className="relative">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
                <SectionHead
                  eyebrow="From the community"
                  title="In their own words."
                  lede="Worshippers, parents and students on what Manarat means to them."
                  onNavy
                />
                <Testimonials items={testimonials} />
              </div>
            </Container>
          </Section>
        )}

        {/* 10 -------------------------------------------------- calendar */}
        <Section tone="surface">
          <Container>
            <SectionHead
              eyebrow="The Islamic year"
              title="What's coming up."
              lede="Ramadan, both Eids and the sacred days, with a live countdown to each."
              action={
                <Button href="/calendar" variant="outline">
                  Full calendar <ArrowIcon />
                </Button>
              }
            />
            <div className="mt-12">
              <IslamicEvents limit={4} today={new Date()} />
            </div>
          </Container>
        </Section>

        {/* 11 ----------------------------------------------------- visit */}
        <Section tone="ground">
          <Container>
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_42%]">
                <div className="p-8 sm:p-12">
                  <SectionHead
                    eyebrow="Visit the masjid"
                    title="155 Coventry Road, Sheldon."
                    lede="A spacious hall with ample parking, open for all five prayers and two Jumu'ah congregations every Friday."
                  />
                  <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                    {[
                      ["Jumu'ah", settings.jumuah_times],
                      ["Capacity", "1,000+ worshippers"],
                      ["Parking", "On site, free"],
                      ["Established", "2012"],
                    ].map(([k, v]) => (
                      <div key={k} className="border-l-2 border-brand pl-4">
                        <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                          {k}
                        </dt>
                        <dd className="mt-1 font-semibold text-navy-900">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/contact">Get directions</Button>
                    <Button href="/prayer-times" variant="outline">
                      Prayer timetable
                    </Button>
                  </div>
                </div>
                <Figure
                  alt="Manarat Foundation on Coventry Road"
                  aspect="4/5"
                  seed={7}
                  className="!rounded-none !border-0 !border-l h-full min-h-[280px]"
                />
              </div>
            </Card>
          </Container>
        </Section>

        {/* 12 ------------------------------------------------------- faq */}
        <Section tone="surface">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHead
                  eyebrow="Questions"
                  title="Before you visit."
                  lede="The things we get asked most. If yours is not here, ask us directly — someone will answer."
                />
                <div className="mt-8">
                  <Button href="/contact" variant="outline">
                    Ask a question <ArrowIcon />
                  </Button>
                </div>
              </div>

              <FaqAccordion items={FAQS} />
            </div>
          </Container>
        </Section>

        {/* 13 -------------------------------------------------- final CTA */}
        <Section tone="navy" className="overflow-hidden">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="cta" opacity={0.06} size={80} />
          </span>
          <span
            aria-hidden
            className="absolute -left-40 -bottom-48 h-[540px] w-[540px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(21,145,220,.3), transparent 68%)",
            }}
          />
          <Container className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
                Sadaqah Jariyah
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.1rem)] font-extrabold leading-[1.08] text-white">
                Build something whose reward does not stop.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">
                A masjid is the clearest sadaqah jariyah there is. Every prayer
                prayed in this hall, every verse a child memorises upstairs,
                continues for whoever helped build it.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button href="/donate" variant="white" size="lg">
                  Give now <ArrowIcon />
                </Button>
                <Button href="/appeal" variant="ghost-white" size="lg">
                  See the appeal
                </Button>
              </div>

              <div className="mx-auto mt-14 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-white/12 pt-10">
                {[
                  "Registered charity 1148223",
                  "Gift Aid adds 25%",
                  "Accounts filed yearly",
                ].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className="h-3.5 w-3.5 shrink-0 fill-none stroke-blue-300 stroke-[2.4]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8.5 6.5 12 13 4.5" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
