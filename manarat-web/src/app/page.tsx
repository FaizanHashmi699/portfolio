import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { LivePrayerClock } from "@/components/live-prayer";
import { IslamicEvents } from "@/components/islamic-events";
import { CampaignProgress } from "@/components/campaign-progress";
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
import type { Campaign, Programme } from "@/lib/types";

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

export default async function HomePage() {
  const settings = await getPrayerSettings();
  const config = toPrayerConfig(settings);
  const supabase = await createClient();

  const [{ data: programmes }, { data: campaign }] = await Promise.all([
    supabase.from("programmes").select("*").eq("published", true).order("sort_order"),
    supabase.from("campaigns").select("*").eq("is_primary", true).eq("published", true).maybeSingle(),
  ]);

  const list = (programmes ?? []) as Programme[];
  const appeal = campaign as Campaign | null;

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ---------------------------------------------------- hero */}
        <HeroSlider
          slides={SLIDES}
          aside={<LivePrayerClock config={config} jumuahTimes={settings.jumuah_times} />}
        />

        {/* ---------------------------------------------- quick actions */}
        <Section tone="surface" className="!py-0">
          <Container>
            <div className="-mt-10 grid gap-3 rounded-panel border border-rule bg-surface p-3 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/prayer-times", title: "Prayer times", note: "Today and the month ahead", d: "M12 6.6V12l3.6 2.2M20.4 12a8.4 8.4 0 1 1-16.8 0 8.4 8.4 0 0 1 16.8 0Z" },
                { href: "/programmes", title: "Our classes", note: "Hifz, Arabic, Islamic studies", d: "M4 18V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5M8 8.5h7" },
                { href: "/calendar", title: "Islamic calendar", note: "Ramadan, Eid and the sacred days", d: "M7 3v3M17 3v3M3.5 9.5h17M4.5 6h15v14h-15z" },
                { href: "/donate", title: "Give sadaqah", note: "One-off or monthly, with Gift Aid", d: "M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8.4 1.9c0 5.7-8.4 10.5-8.4 10.5Z" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-start gap-4 rounded-card p-5 transition-colors duration-300 hover:bg-surface-2"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-brand-wash text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
                      <path d={a.d} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-navy-900">{a.title}</span>
                    <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-soft">{a.note}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------- welcome */}
        <Section tone="surface">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
                <Figure alt="The prayer hall at Manarat Foundation" aspect="3/4" seed={0} className="mt-8" />
                <Figure alt="Students in the Qur'an academy" aspect="3/4" seed={1} />
              </div>

              <div className="order-1 lg:order-2">
                <SectionHead
                  eyebrow="Welcome to Manarat"
                  title={<>A masjid built by scholars, for its neighbours.</>}
                  lede="We began in 2012 as the first purpose-established masjid and Islamic centre for Sheldon, Solihull and the surrounding areas. Today more than a thousand worshippers pray here."
                />
                <ul className="mt-8 grid gap-4">
                  {[
                    ["Founded by scholars", "Our teaching is led by qualified ulama, not volunteers filling a gap."],
                    ["Open to everyone", "We serve our neighbours whoever they are, and reject extremism in all its forms."],
                    ["Education first", "From a child's first letters of Arabic to a three-year Hifz programme."],
                  ].map(([t, d]) => (
                    <li key={t} className="flex gap-4">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-wash text-brand">
                        <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 fill-none stroke-current stroke-[2.4]" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8.5 6.5 12 13 4.5" />
                        </svg>
                      </span>
                      <span>
                        <span className="block font-bold text-navy-900">{t}</span>
                        <span className="mt-0.5 block text-[0.95rem] leading-relaxed text-ink-soft">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/about">Our story</Button>
                  <Button href="/contact" variant="outline">Visit us</Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------- academy */}
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

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {list.map((p, i) => (
                <Card key={p.id} interactive className="overflow-hidden">
                  <Link href={`/programmes/${p.slug}`} className="block">
                    <div className="grid gap-0 sm:grid-cols-[150px_minmax(0,1fr)]">
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
                              <dt className="uppercase tracking-[0.1em] text-ink-mute">Ages</dt>
                              <dd className="font-semibold text-ink">{p.age_range}</dd>
                            </div>
                          )}
                          {p.schedule && (
                            <div className="flex gap-1.5">
                              <dt className="uppercase tracking-[0.1em] text-ink-mute">When</dt>
                              <dd className="font-semibold text-ink">{p.schedule}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------- appeal */}
        {appeal && (
          <Section tone="navy" className="overflow-hidden">
            <span aria-hidden className="absolute inset-0 text-white">
              <KhatimPattern id="appeal" opacity={0.05} size={80} />
            </span>
            <span
              aria-hidden
              className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(21,145,220,.34), transparent 66%)" }}
            />
            <Container className="relative">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
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
                </div>

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
                        <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-white/50">{k}</dt>
                        <dd className="mt-1 font-display text-lg font-extrabold tabular-nums text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* ---------------------------------------------------- calendar */}
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

        {/* ---------------------------------------------------- visit */}
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
                        <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-mute">{k}</dt>
                        <dd className="mt-1 font-semibold text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/contact">Get directions</Button>
                    <Button href="/prayer-times" variant="outline">Prayer timetable</Button>
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
      </main>

      <SiteFooter />
    </>
  );
}
