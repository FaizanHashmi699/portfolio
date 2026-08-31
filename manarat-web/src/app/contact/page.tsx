import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrayerSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find Manarat Foundation at 155 Coventry Road, Sheldon, Birmingham.",
};

export default async function ContactPage() {
  const settings = await getPrayerSettings();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">Contact</h1>
        <p className="mt-3 text-ink-soft">
          The office is open around prayer times. For class places, please use the enquiry form on
          the relevant programme page — it reaches the teaching team directly.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-rule bg-surface p-6">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">Address</p>
            <p className="mt-2 leading-relaxed">
              Manarat Foundation
              <br />
              155 Coventry Road
              <br />
              Sheldon, Birmingham
            </p>
          </div>
          <div className="rounded-sm border border-rule bg-surface p-6">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
              Jumu&rsquo;ah
            </p>
            <p className="mt-2 leading-relaxed">{settings.jumuah_times}</p>
            <p className="mt-3 text-sm text-ink-mute">
              Please arrive early — the first jama&rsquo;ah fills quickly.
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-mute">
          Replace the placeholder phone number and email in the admin panel before this site goes
          live.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
