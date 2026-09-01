import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero3D } from "@/components/hero-3d";
import { LivePrayerClock, PatternOverlay } from "@/components/live-prayer";
import { IslamicEvents } from "@/components/islamic-events";
import { CampaignProgress } from "@/components/campaign-progress";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { qiblaBearing, compassPoint } from "@/lib/qibla";
import type { Campaign, Programme } from "@/lib/types";

export const revalidate = 300;

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
  const bearing = qiblaBearing(settings.latitude, settings.longitude);

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ---------- Hero: 3D khatim field ---------- */}
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#062b55_0%,#0f4d80_55%,#1591dc_135%)] text-white">
          <Hero3D />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,42,37,0.94)_0%,rgba(0,42,37,0.82)_38%,rgba(0,42,37,0.35)_65%,rgba(0,42,37,0.55)_100%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_minmax(0,440px)] lg:py-28">
            <div className="flex flex-col justify-center gap-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                Founded by scholars · 2012 · Registered charity 1148223
              </p>
              <h1 className="font-display text-[2.6rem] leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
                A light for Sheldon
                <span className="block text-brand-wash">and Solihull.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-white/75">
                Manarat means lighthouse. We were the first purpose-established masjid and Islamic
                centre for the Muslims of this area — founded by scholars, open to over a thousand
                worshippers, teaching a deen of knowledge, tolerance and service.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/programmes"
                  className="rounded-sm bg-white px-6 py-3 font-medium text-brand-deep transition-transform hover:-translate-y-0.5"
                >
                  Our programmes
                </Link>
                <Link
                  href="/donate"
                  className="rounded-sm border border-white/30 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10"
                >
                  Support the masjid
                </Link>
              </div>

              <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6">
                {[
                  { k: "Established", v: "2012" },
                  { k: "Capacity", v: "1,000+" },
                  { k: "Qibla from here", v: `${bearing.toFixed(0)}° ${compassPoint(bearing)}` },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-white/50">{s.k}</dt>
                    <dd className="font-display text-2xl font-medium tabular-nums">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pt-4">
              <LivePrayerClock config={config} jumuahTimes={settings.jumuah_times} />
            </div>
          </div>
        </section>

        {/* ---------- Programmes ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-10 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">What we teach</p>
              <h2 className="mt-2 font-display text-4xl font-medium tracking-tight">
                Classes, in full detail.
              </h2>
              <p className="mt-3 max-w-2xl text-ink-soft">
                Ages, timetable, fees and teachers for every programme — so a parent can decide
                without picking up the phone.
              </p>
            </div>
            <Link href="/programmes" className="ml-auto text-sm font-medium text-brand hover:underline">
              All programmes →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((p) => (
              <Link
                key={p.id}
                href={`/programmes/${p.slug}`}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-md border border-rule bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 text-brand opacity-[0.06] transition-opacity group-hover:opacity-[0.13]">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <path d="M50 4 61 35 92 46 61 57 50 96 39 57 8 46 39 35Z" fill="currentColor" />
                  </svg>
                </span>
                <h3 className="font-display text-2xl font-medium transition-colors group-hover:text-brand">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-3 text-xs text-ink-mute">
                  {p.age_range && (
                    <div className="flex gap-1.5">
                      <dt className="uppercase tracking-[0.1em]">Ages</dt>
                      <dd className="font-medium text-ink-soft">{p.age_range}</dd>
                    </div>
                  )}
                  {p.schedule && (
                    <div className="flex gap-1.5">
                      <dt className="uppercase tracking-[0.1em]">When</dt>
                      <dd className="font-medium text-ink-soft">{p.schedule}</dd>
                    </div>
                  )}
                </dl>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Islamic calendar ---------- */}
        <section className="relative overflow-hidden border-y border-rule bg-surface">
          <span aria-hidden className="absolute inset-0 text-brand">
            <PatternOverlay opacity={0.04} />
          </span>
          <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="mb-10 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                  The Islamic year
                </p>
                <h2 className="mt-2 font-display text-4xl font-medium tracking-tight">
                  What&rsquo;s coming up.
                </h2>
                <p className="mt-3 max-w-2xl text-ink-soft">
                  Ramadan, the two Eids and the sacred days, with a live countdown to each.
                </p>
              </div>
              <Link href="/calendar" className="ml-auto text-sm font-medium text-brand hover:underline">
                Full calendar →
              </Link>
            </div>
            <IslamicEvents limit={4} today={new Date()} />
          </div>
        </section>

        {/* ---------- Appeal ---------- */}
        {appeal && (
          <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                  Our current appeal
                </p>
                <h2 className="font-display text-4xl font-medium tracking-tight text-balance">
                  {appeal.title}
                </h2>
                <p className="text-lg leading-relaxed text-ink-soft">{appeal.summary}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/donate"
                    className="rounded-sm bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-deep"
                  >
                    Give to the appeal
                  </Link>
                  <Link
                    href="/appeal"
                    className="rounded-sm border border-rule px-6 py-3 font-medium transition-colors hover:border-brand"
                  >
                    What it funds
                  </Link>
                </div>
              </div>
              <div className="rounded-md border border-rule bg-surface p-8">
                <CampaignProgress raisedPence={appeal.raised_pence} targetPence={appeal.target_pence} />
              </div>
            </div>
          </section>
        )}

        {/* ---------- Tools strip ---------- */}
        <section className="border-t border-rule bg-surface-2/60">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:px-8 md:grid-cols-3">
            {[
              { href: "/prayer-times", title: "Prayer timetable", note: "Today and the whole month, recalculated daily.", icon: "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" },
              { href: "/qibla", title: "Qibla finder", note: "The direction of the Ka'bah from anywhere.", icon: "M12 2 15 12 12 22 9 12Z" },
              { href: "/live", title: "Masjid display", note: "Full-screen clock for the foyer screen.", icon: "M3 5h18v12H3zM8 21h8" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group flex items-start gap-4 rounded-md border border-rule bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-brand"
              >
                <span className="mt-0.5 shrink-0 rounded-sm bg-brand-wash p-2 text-brand-deep">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path d={c.icon} strokeLinecap="round" />
                  </svg>
                </span>
                <span>
                  <span className="block font-display text-lg font-medium group-hover:text-brand">
                    {c.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{c.note}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
