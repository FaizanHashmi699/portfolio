import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QiblaCompass } from "@/components/qibla-compass";
import { getPrayerSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Qibla finder",
  description:
    "Find the direction of the Ka'bah from Sheldon, Solihull or anywhere else — with a live compass and the exact great-circle bearing.",
};

export const revalidate = 86400;

export default async function QiblaPage() {
  const settings = await getPrayerSettings();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">Direction of prayer</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Qibla finder
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The bearing to the Ka&rsquo;bah in Makkah, calculated as a great circle rather than a
          line on a flat map — which is why it points south-east from Britain, not south.
        </p>

        <div className="mt-10 rounded-md border border-rule bg-surface p-7 sm:p-9">
          <QiblaCompass
            fallback={{
              latitude: settings.latitude,
              longitude: settings.longitude,
              label: `${settings.masjid_name}, Sheldon`,
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
