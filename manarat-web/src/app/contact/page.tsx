import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, Card, Button, Figure, PageMasthead } from "@/components/ui";
import { getPrayerSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact & directions",
  description:
    "Find Manarat Foundation at 155 Coventry Road, Sheldon, Birmingham. Open for all five daily prayers and two Jumu'ah congregations.",
};

export default async function ContactPage() {
  const settings = await getPrayerSettings();
  const maps =
    "https://www.google.com/maps/search/?api=1&query=155+Coventry+Road+Sheldon+Birmingham";

  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageMasthead
          eyebrow="Find us"
          title="155 Coventry Road, Sheldon."
          lede="The office is open around prayer times. For a place in a class, use the enquiry form on that programme's page — it reaches the teaching team directly."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <Card className="overflow-hidden">
                <Figure
                  alt="Manarat Foundation, 155 Coventry Road"
                  aspect="16/8"
                  seed={6}
                  className="!rounded-none !border-0 !border-b"
                />
                <div className="p-7 sm:p-9">
                  <h2 className="font-display text-2xl font-extrabold text-navy-900">
                    Getting here
                  </h2>
                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    {[
                      ["Address", "155 Coventry Road, Sheldon, Birmingham"],
                      ["Parking", "On site and free"],
                      ["Jumu'ah", settings.jumuah_times],
                      ["Daily prayers", "All five, in congregation"],
                    ].map(([k, v]) => (
                      <div key={k} className="border-l-2 border-brand pl-4">
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                          {k}
                        </dt>
                        <dd className="mt-1 font-semibold leading-snug text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-chip bg-brand px-6 py-3 text-[0.9rem] font-bold text-white shadow-brand transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Open in Google Maps
                      <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h7v7M13 3 4 12" />
                      </svg>
                    </a>
                    <Button href="/prayer-times" variant="outline">
                      Prayer timetable
                    </Button>
                  </div>
                </div>
              </Card>

              <aside className="grid gap-5">
                <Card className="p-7">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    What do you need?
                  </h2>
                  <ul className="mt-5 grid gap-4 text-[0.92rem]">
                    {[
                      ["A place in a class", "Use the enquiry form on the programme page.", "/programmes"],
                      ["Nikah or marriage registration", "See what we offer and enquire.", "/programmes/nikah"],
                      ["To donate", "One-off or monthly, with Gift Aid.", "/donate"],
                    ].map(([t, d, href]) => (
                      <li key={t}>
                        <a
                          href={href}
                          className="group block rounded-card border border-rule p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                        >
                          <span className="block font-bold text-navy-900 group-hover:text-brand">
                            {t}
                          </span>
                          <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-soft">
                            {d}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-7">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Office
                  </h2>
                  <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">
                    The office is staffed around prayer times. The quickest way to reach the right
                    person is the enquiry form on the relevant page.
                  </p>
                  <p className="mt-4 rounded-card bg-surface-2 px-4 py-3 text-[0.82rem] leading-relaxed text-ink-mute">
                    A published phone number and email will appear here once the masjid confirms
                    which ones to use. Nothing is shown until then rather than a number that
                    doesn&rsquo;t answer.
                  </p>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
