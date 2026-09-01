import type { Metadata } from "next";
import Link from "next/link";
import { LivePrayerClock } from "@/components/live-prayer";
import { IslamicEvents } from "@/components/islamic-events";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Masjid display",
  description: "Full-screen prayer clock for the masjid foyer screen.",
  robots: { index: false },
};

export const revalidate = 300;

/** Designed to be cast to a screen in the masjid and left running. */
export default async function LiveDisplayPage() {
  const settings = await getPrayerSettings();
  const config = toPrayerConfig(settings);

  return (
    <div className="min-h-screen bg-ground px-6 py-8">
      <header className="mx-auto mb-8 flex max-w-5xl items-center gap-3">
        <span aria-hidden className="flex flex-col items-center">
          <span className="block h-2.5 w-2.5 bg-brand" />
          <span className="block h-7 w-[3px] bg-brand/35" />
        </span>
        <span>
          <span className="block font-display text-2xl font-medium">{settings.masjid_name}</span>
          <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            155 Coventry Road · Sheldon
          </span>
        </span>
        <Link
          href="/"
          className="ml-auto text-xs text-ink-mute hover:text-brand print:hidden"
        >
          ← Back to site
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-8">
        <LivePrayerClock config={config} jumuahTimes={settings.jumuah_times} display />
        <section>
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-ink-mute">
            Coming up
          </h2>
          <IslamicEvents limit={2} today={new Date()} />
        </section>
      </main>
    </div>
  );
}
