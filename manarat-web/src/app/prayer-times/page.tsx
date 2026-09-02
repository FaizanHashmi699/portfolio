import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LivePrayerClock } from "@/components/live-prayer";
import { Container, Section, Card, PageMasthead } from "@/components/ui";
import { getPrayerSettings, toPrayerConfig } from "@/lib/settings";
import {
  METHOD_LABELS,
  PRAYER_ORDER,
  PRAYER_LABELS,
  calculateTimes,
  formatMinutes,
  localDateParts,
} from "@/lib/prayer-times";
import { qiblaBearing, compassPoint } from "@/lib/qibla";
import { gregorianToHijri, formatHijri } from "@/lib/hijri";

export const metadata: Metadata = {
  title: "Prayer times",
  description:
    "Daily prayer beginning and congregation times for Manarat Foundation, Sheldon — calculated fresh every day, never a stale PDF.",
};

export const revalidate = 3600;

export default async function PrayerTimesPage() {
  const settings = await getPrayerSettings();
  const config = toPrayerConfig(settings);
  const today = localDateParts(settings.timezone);

  const daysInMonth = new Date(today.year, today.month, 0).getDate();
  const month = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return { day, times: calculateTimes({ ...today, day }, config) };
  });

  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(today.year, today.month - 1, 1),
  );
  const hijri = gregorianToHijri(today.year, today.month, today.day);
  const bearing = qiblaBearing(settings.latitude, settings.longitude);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageMasthead
          eyebrow="Worship"
          title="Prayer times."
          lede="Calculated from the masjid's own coordinates and refreshed every day, so what you see here is always current."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <LivePrayerClock config={config} jumuahTimes={settings.jumuah_times} />

              <aside className="grid gap-5">
                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Today
                  </h2>
                  <dl className="mt-4 grid gap-4">
                    {[
                      ["Hijri", formatHijri(hijri)],
                      ["Jumu'ah", settings.jumuah_times],
                      ["Qibla", `${bearing.toFixed(1)}° ${compassPoint(bearing)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="border-l-2 border-brand pl-4">
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                          {k}
                        </dt>
                        <dd className="mt-0.5 font-semibold text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>

                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    How these are worked out
                  </h2>
                  <dl className="mt-4 grid gap-3 text-[0.87rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Method</dt>
                      <dd className="text-right font-semibold text-navy-900">
                        {METHOD_LABELS[settings.method]}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Asr</dt>
                      <dd className="font-semibold text-navy-900">
                        {settings.asr_method === "hanafi" ? "Hanafi" : "Standard"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Location</dt>
                      <dd className="font-semibold tabular-nums text-navy-900">
                        {settings.latitude.toFixed(3)}, {settings.longitude.toFixed(3)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 border-t border-rule-soft pt-4 text-[0.8rem] leading-relaxed text-ink-mute">
                    British Summer Time is handled automatically. Jama&rsquo;ah times are the
                    minutes the masjid adds to each beginning time.
                  </p>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        <Section tone="surface">
          <Container>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand">
                  Full month
                </p>
                <h2 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-extrabold text-navy-900">
                  {monthLabel}
                </h2>
                <p className="mt-2 text-[0.95rem] text-ink-soft">
                  Congregation times, with the beginning time in brackets.
                </p>
              </div>
            </div>

            <Card className="mt-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-[0.9rem]">
                  <caption className="sr-only">Prayer timetable for {monthLabel}</caption>
                  <thead>
                    <tr className="border-b border-rule bg-surface-2 text-[0.62rem] uppercase tracking-[0.12em] text-ink-mute">
                      <th scope="col" className="px-5 py-3.5 text-left font-bold">
                        Date
                      </th>
                      {PRAYER_ORDER.map((k) => (
                        <th key={k} scope="col" className="px-4 py-3.5 text-right font-bold">
                          {PRAYER_LABELS[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {month.map(({ day, times }) => {
                      const isToday = day === today.day;
                      return (
                        <tr
                          key={day}
                          className={`border-b border-rule-soft last:border-0 ${
                            isToday ? "bg-brand-wash font-semibold" : ""
                          }`}
                        >
                          <th
                            scope="row"
                            className="px-5 py-2.5 text-left font-semibold tabular-nums text-navy-900"
                          >
                            {day}
                            {isToday && (
                              <span className="ml-2 rounded-chip bg-brand px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white">
                                today
                              </span>
                            )}
                          </th>
                          {PRAYER_ORDER.map((k) => (
                            <td key={k} className="px-4 py-2.5 text-right tabular-nums">
                              {k === "sunrise" ? (
                                <span className="text-ink-mute">{formatMinutes(times.begins[k])}</span>
                              ) : (
                                <>
                                  <span className="text-navy-900">
                                    {formatMinutes(times.jamaah[k])}
                                  </span>{" "}
                                  <span className="text-[0.78rem] text-ink-mute">
                                    ({formatMinutes(times.begins[k])})
                                  </span>
                                </>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
