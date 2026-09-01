import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PrayerTimesCard } from "@/components/prayer-times-card";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";
import {
  METHOD_LABELS,
  PRAYER_ORDER,
  PRAYER_LABELS,
  calculateTimes,
  formatMinutes,
  localDateParts,
} from "@/lib/prayer-times";

export const metadata: Metadata = {
  title: "Prayer times",
  description:
    "Daily prayer beginning and congregation times for Manarat Foundation, Sheldon — calculated fresh every day.",
};

export const revalidate = 3600;

export default async function PrayerTimesPage() {
  const settings = await getPrayerSettings();
  const config = toPrayerConfig(settings);
  const today = localDateParts(settings.timezone);

  const daysInMonth = new Date(today.year, today.month, 0).getDate();
  const month = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const times = calculateTimes({ ...today, day }, config);
    return { day, times };
  });

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(today.year, today.month - 1, 1));

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">Prayer times</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Calculated for the masjid&rsquo;s own coordinates and refreshed every day, so the times
          here are always current.
        </p>

        <div className="mt-8 max-w-2xl">
          <PrayerTimesCard settings={settings} />
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-medium tracking-tight">{monthLabel}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Congregation times, with the beginning time in brackets.
          </p>

          <div className="mt-5 overflow-x-auto rounded-sm border border-rule bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">Prayer timetable for {monthLabel}</caption>
              <thead>
                <tr className="border-b border-rule text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Date
                  </th>
                  {PRAYER_ORDER.map((k) => (
                    <th key={k} scope="col" className="px-4 py-3 text-right font-medium">
                      {PRAYER_LABELS[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {month.map(({ day, times }) => (
                  <tr
                    key={day}
                    className={`border-b border-rule-soft last:border-0 ${
                      day === today.day ? "bg-brand-wash/60 font-medium" : ""
                    }`}
                  >
                    <th scope="row" className="px-4 py-2 text-left font-medium tabular-nums">
                      {day}
                      {day === today.day && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-brand">
                          today
                        </span>
                      )}
                    </th>
                    {PRAYER_ORDER.map((k) => (
                      <td key={k} className="px-4 py-2 text-right tabular-nums">
                        {k === "sunrise" ? (
                          <span className="text-ink-mute">{formatMinutes(times.begins[k])}</span>
                        ) : (
                          <>
                            {formatMinutes(times.jamaah[k])}{" "}
                            <span className="text-xs text-ink-mute">
                              ({formatMinutes(times.begins[k])})
                            </span>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-mute">
            Calculation method: {METHOD_LABELS[settings.method]}. Asr:{" "}
            {settings.asr_method === "hanafi" ? "Hanafi" : "Standard"}. Jumu&rsquo;ah:{" "}
            {settings.jumuah_times}. Times are given in local time and account for British Summer
            Time automatically.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
