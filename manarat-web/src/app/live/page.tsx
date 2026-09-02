import type { Metadata } from "next";
import Link from "next/link";
import { LivePrayerClock } from "@/components/live-prayer";
import { IslamicEvents } from "@/components/islamic-events";
import { KhatimPattern } from "@/components/ui";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";
import { gregorianToHijri, formatHijri } from "@/lib/hijri";

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
  const now = new Date();
  const hijri = gregorianToHijri(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());

  return (
    <div className="min-h-screen bg-ground">
      <header className="relative overflow-hidden bg-navy-950 text-white">
        <span aria-hidden className="absolute inset-0 text-blue-300">
          <KhatimPattern id="live-khatim" opacity={0.07} size={72} />
        </span>
        <span
          aria-hidden
          className="absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(21,145,220,.32), transparent 68%)" }}
        />
        <div className="relative mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-4 px-6 py-7 sm:px-10">
          <span
            aria-hidden
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-brand to-navy-800 shadow-[0_8px_22px_-10px_rgba(21,145,220,.95)]"
          >
            <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white">
              <path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
              <circle cx="16" cy="16" r="2.6" className="fill-navy-950" />
            </svg>
          </span>

          <span className="min-w-0 leading-tight">
            <span className="flex items-baseline gap-3">
              <span className="font-display text-[1.6rem] font-extrabold tracking-tight">
                {settings.masjid_name}
              </span>
              <span aria-hidden className="font-arabic text-[1.5rem] leading-none text-blue-300">
                منارة
              </span>
            </span>
            <span className="mt-1 block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/60">
              155 Coventry Road · Sheldon · Birmingham
            </span>
          </span>

          <span className="ml-auto text-right">
            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-blue-300">
              Today
            </span>
            <span className="mt-1 block font-display text-[1.15rem] font-extrabold">
              {formatHijri(hijri)}
            </span>
            <span className="block text-sm text-white/60">
              {new Intl.DateTimeFormat("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(now)}
            </span>
          </span>

          <Link
            href="/"
            className="rounded-chip border border-white/25 px-4 py-2 text-xs font-bold text-white/80 transition-colors hover:border-white hover:text-white print:hidden"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] space-y-10 px-6 py-10 sm:px-10">
        <LivePrayerClock config={config} jumuahTimes={settings.jumuah_times} display />

        <section>
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink-mute">
            Coming up
          </h2>
          <div className="mt-5">
            <IslamicEvents limit={2} today={now} />
          </div>
        </section>
      </main>
    </div>
  );
}
