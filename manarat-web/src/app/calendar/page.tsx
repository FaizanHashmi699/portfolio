import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHead, Card, PageMasthead, Button, ArrowIcon } from "@/components/ui";
import { IslamicEvents } from "@/components/islamic-events";
import {
  gregorianToHijri,
  formatHijri,
  HIJRI_MONTHS,
  hijriToGregorian,
  upcomingEvents,
} from "@/lib/hijri";

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

  // The single next observance, shown alongside today's date so the card
  // answers "what's next" without the reader scrolling.
  const nextUp = upcomingEvents(now, 1)[0];

  const gregorian = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageMasthead
          eyebrow="The Islamic year"
          title="Islamic calendar."
          lede="Today's Hijri date, the months of the year ahead, and the sacred days worth putting in the diary."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <Card className="overflow-hidden">
                <div className="grid gap-px bg-rule sm:grid-cols-2">
                  <div className="bg-surface p-8 sm:p-10">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                      Today, Hijri
                    </p>
                    <p className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.1rem)] font-extrabold leading-tight text-brand-deep">
                      {formatHijri(hijri)}
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">
                      {HIJRI_MONTHS[hijri.month - 1]} is month {hijri.month} of {hijri.year} AH.
                    </p>
                  </div>
                  <div className="bg-surface p-8 sm:p-10">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                      Today, Gregorian
                    </p>
                    <p className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.1rem)] font-extrabold leading-tight">
                      {gregorian}
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">
                      The Hijri day begins at maghrib, so after sunset the date above moves on.
                    </p>
                  </div>
                </div>

                {nextUp && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-rule bg-surface-2/50 px-8 py-6 sm:px-10">
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                        Next observance
                      </p>
                      <p className="mt-1.5 font-display text-[1.15rem] font-extrabold tracking-tight text-brand-deep">
                        {nextUp.name}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(
                          new Date(
                            Date.UTC(
                              nextUp.gregorian.year,
                              nextUp.gregorian.month - 1,
                              nextUp.gregorian.day,
                            ),
                          ),
                        )}{" "}
                        &middot; {nextUp.day} {HIJRI_MONTHS[nextUp.month - 1]} {nextUp.hijriYear} AH
                      </p>
                    </div>
                    <span className="ml-auto rounded-chip bg-brand px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white">
                      {nextUp.isToday
                        ? "Today"
                        : nextUp.isActive
                          ? "Now"
                          : nextUp.daysAway === 1
                            ? "Tomorrow"
                            : `In ${nextUp.daysAway} days`}
                    </span>
                  </div>
                )}
              </Card>

              <aside className="grid gap-5">
                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    How these dates work
                  </h2>
                  <p className="mt-3 text-sm leading-[1.7] text-ink-soft">
                    We use the tabular Islamic calendar — the same arithmetic behind printed
                    timetables and date converters. Because a month truly begins on local sighting
                    of the new moon, an observed date can fall a day either side.
                  </p>
                  <p className="mt-3 text-sm leading-[1.7] text-ink-soft">
                    Manarat announces the confirmed dates for Ramadan and both Eids from the minbar
                    and by newsletter.
                  </p>
                </Card>

                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Also useful
                  </h2>
                  <div className="mt-4 grid gap-2.5">
                    <Button href="/prayer-times" variant="outline" className="w-full justify-between">
                      Prayer times <ArrowIcon />
                    </Button>
                    <Button href="/qibla" variant="outline" className="w-full justify-between">
                      Qibla finder <ArrowIcon />
                    </Button>
                  </div>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        <Section tone="surface">
          <Container>
            <SectionHead
              eyebrow="What's coming"
              title="Upcoming observances"
              lede="Counted from today. The masjid confirms each date once the moon is sighted."
            />
            <div className="mt-10">
              <IslamicEvents limit={10} today={now} />
            </div>
          </Container>
        </Section>

        <Section tone="ground">
          <Container>
            <SectionHead
              eyebrow={`${hijri.year} AH`}
              title="The twelve months"
              lede="Each month with the Gregorian date it begins on, so you can plan around it."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {months.map((m) => (
                <Card
                  key={m.number}
                  interactive
                  className={`flex items-center gap-4 p-5 ${
                    m.isCurrent ? "!border-brand shadow-md" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                      m.isCurrent ? "bg-brand text-white" : "bg-brand-wash text-brand-deep"
                    }`}
                  >
                    {m.number}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display font-bold text-brand-deep">
                        {m.name}
                      </span>
                      {m.isCurrent && (
                        <span className="shrink-0 rounded-chip bg-brand px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">
                          Now
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm tabular-nums text-ink-soft">
                      begins{" "}
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(m.startsOn)}
                    </span>
                  </span>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
