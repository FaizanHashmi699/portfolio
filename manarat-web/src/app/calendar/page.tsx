import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IslamicEvents } from "@/components/islamic-events";
import { gregorianToHijri, formatHijri, HIJRI_MONTHS, hijriToGregorian } from "@/lib/hijri";

export const metadata: Metadata = {
  title: "Islamic calendar",
  description:
    "Today's Hijri date, Ramadan and Eid dates, and every sacred day of the Islamic year with a countdown — for Sheldon, Solihull and Birmingham.",
};

export const revalidate = 3600;

export default function CalendarPage() {
  const now = new Date();
  const hijri = gregorianToHijri(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());

  // The current Hijri year laid out month by month.
  const months = HIJRI_MONTHS.map((name, i) => {
    const start = hijriToGregorian(hijri.year, i + 1, 1);
    return {
      name,
      number: i + 1,
      startsOn: new Date(Date.UTC(start.year, start.month - 1, start.day)),
      isCurrent: i + 1 === hijri.month,
    };
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">The Islamic year</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Islamic calendar
        </h1>

        <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4 rounded-md border border-rule bg-surface p-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">Today</p>
            <p className="mt-1 font-display text-3xl font-medium text-brand-deep">
              {formatHijri(hijri)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">Gregorian</p>
            <p className="mt-1 font-display text-3xl font-medium">
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(now)}
            </p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-medium tracking-tight">Upcoming observances</h2>
          <p className="mt-1 mb-6 max-w-2xl text-sm text-ink-soft">
            Counted from today. Dates are the arithmetic Hijri calendar; the masjid announces the
            confirmed date once the moon is sighted.
          </p>
          <IslamicEvents limit={10} today={now} />
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-medium tracking-tight">
            The months of {hijri.year} AH
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {months.map((m) => (
              <div
                key={m.number}
                className={`flex items-baseline gap-3 rounded-sm border px-4 py-3 ${
                  m.isCurrent ? "border-brand bg-brand-wash" : "border-rule bg-surface"
                }`}
              >
                <span className="w-5 shrink-0 text-right font-mono text-xs text-ink-mute">
                  {m.number}
                </span>
                <span className="font-medium">{m.name}</span>
                {m.isCurrent && (
                  <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                    now
                  </span>
                )}
                <span className="ml-auto text-xs tabular-nums text-ink-mute">
                  {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                    .format(m.startsOn)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-ink-mute">
          These dates follow the tabular Islamic calendar, which is what printed timetables and
          date converters use. Because months actually begin on local sighting of the new moon, an
          observed date can fall a day either side. Manarat announces the confirmed dates for
          Ramadan and both Eids from the minbar and by newsletter.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
