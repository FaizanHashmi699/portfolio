import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PrayerTimesCard } from "@/components/prayer-times-card";
import { CampaignProgress } from "@/components/campaign-progress";
import { getPrayerSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { Campaign, Programme } from "@/lib/types";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getPrayerSettings();
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

      <main>
        {/* Hero — leads with scholarship, the thing no local competitor can copy */}
        <section className="border-b border-rule bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:py-20">
            <div className="flex flex-col justify-center gap-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                Founded by scholars · 2012 · Registered charity 1148223
              </p>
              <h1 className="font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
                The masjid built for Sheldon and Solihull.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
                Manarat was the first purpose-established masjid and Islamic centre for the Muslims
                of this area — founded by a group of scholars, open to over a thousand worshippers,
                and committed to teaching a deen of tolerance and service.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/programmes"
                  className="rounded-sm bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-deep"
                >
                  Our programmes
                </Link>
                <Link
                  href="/prayer-times"
                  className="rounded-sm border border-rule bg-surface px-5 py-3 font-medium text-ink transition-colors hover:border-brand"
                >
                  Full timetable
                </Link>
              </div>
            </div>

            <div className="lg:pt-2">
              <PrayerTimesCard settings={settings} />
            </div>
          </div>
        </section>

        {/* Programmes — each one its own entry point */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight">
                What we teach
              </h2>
              <p className="mt-2 max-w-2xl text-ink-soft">
                Fees, times and age ranges for every class — so you can decide without picking up
                the phone.
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
                className="group flex flex-col gap-3 rounded-sm border border-rule bg-surface p-6 transition-colors hover:border-brand"
              >
                <h3 className="font-display text-xl font-medium group-hover:text-brand">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-2 text-xs text-ink-mute">
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

        {/* The named appeal */}
        {appeal && (
          <section className="border-y border-rule bg-surface">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">
                  Our current appeal
                </p>
                <h2 className="font-display text-3xl font-medium tracking-tight text-balance">
                  {appeal.title}
                </h2>
                <p className="leading-relaxed text-ink-soft">{appeal.summary}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/donate"
                    className="rounded-sm bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-deep"
                  >
                    Support the appeal
                  </Link>
                  <Link
                    href="/appeal"
                    className="rounded-sm border border-rule px-5 py-3 font-medium text-ink transition-colors hover:border-brand"
                  >
                    What it funds
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full rounded-sm border border-rule bg-ground p-6">
                  <CampaignProgress
                    raisedPence={appeal.raised_pence}
                    targetPence={appeal.target_pence}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
