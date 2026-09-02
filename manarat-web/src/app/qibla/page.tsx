import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Section, SectionHead, Card, PageMasthead, Button, ArrowIcon } from "@/components/ui";
import { QiblaCompass } from "@/components/qibla-compass";
import { getPrayerSettings } from "@/lib/settings";
import { qiblaBearing, distanceToKaaba, compassPoint } from "@/lib/qibla";

export const metadata: Metadata = {
  title: "Qibla finder",
  description:
    "Find the direction of the Ka'bah from Sheldon, Solihull or anywhere else — with a live compass and the exact great-circle bearing.",
};

export const revalidate = 86400;

export default async function QiblaPage() {
  const settings = await getPrayerSettings();
  const bearing = qiblaBearing(settings.latitude, settings.longitude);
  const distance = distanceToKaaba(settings.latitude, settings.longitude);

  const notes = [
    {
      title: "Why south-east, not south",
      body: "The shortest path between two points on a globe is a great circle, not a straight line on a flat map. From Britain that arc leaves on a south-easterly bearing and curves down towards Makkah.",
    },
    {
      title: "Magnetic north is not true north",
      body: "A phone compass points to magnetic north. In the Midlands that sits roughly 1° west of true north, so allow a degree either way when you line up.",
    },
    {
      title: "In the prayer hall",
      body: "You do not need any of this inside the masjid — the mihrab and the carpet lines are already set to the qibla. This page is for home, work and travel.",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageMasthead
          eyebrow="Direction of prayer"
          title="Qibla finder."
          lede="The bearing to the Ka'bah in Makkah, calculated as a great circle rather than a line on a flat map."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <Card className="p-7 sm:p-10">
                <QiblaCompass
                  fallback={{
                    latitude: settings.latitude,
                    longitude: settings.longitude,
                    label: `${settings.masjid_name}, Sheldon`,
                  }}
                />
              </Card>

              <aside className="grid gap-5">
                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    From the masjid
                  </h2>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Bearing</dt>
                      <dd className="font-bold tabular-nums text-brand-deep">
                        {bearing.toFixed(1)}° {compassPoint(bearing)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Distance</dt>
                      <dd className="font-bold tabular-nums text-brand-deep">
                        {Math.round(distance).toLocaleString("en-GB")} km
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Coordinates</dt>
                      <dd className="tabular-nums text-ink">
                        {settings.latitude.toFixed(4)}, {settings.longitude.toFixed(4)}
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Also useful
                  </h2>
                  <div className="mt-4 grid gap-2.5">
                    <Button href="/prayer-times" variant="outline" className="w-full justify-between">
                      Prayer times <ArrowIcon />
                    </Button>
                    <Button href="/calendar" variant="outline" className="w-full justify-between">
                      Islamic calendar <ArrowIcon />
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
              eyebrow="Getting it right"
              title="Three things worth knowing"
              lede="A compass reading is only as good as what you do with it."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {notes.map((n, i) => (
                <Card key={n.title} interactive className="p-7">
                  <span
                    aria-hidden
                    className="grid h-10 w-10 place-items-center rounded-full bg-brand-wash font-display text-sm font-extrabold text-brand-deep"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-extrabold tracking-tight text-brand-deep">
                    {n.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.7] text-ink-soft">{n.body}</p>
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
