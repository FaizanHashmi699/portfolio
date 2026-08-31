import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Manarat Foundation — the first purpose-established masjid and Islamic centre for Sheldon and Solihull, founded by scholars in 2012.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">About Manarat</h1>

        <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
          <p>
            Manarat Foundation was established in 2012 by a group of dedicated scholars, and became
            the first purpose-established masjid and Islamic centre for the Muslims of Sheldon,
            Solihull and the surrounding areas.
          </p>
          <p>
            We later acquired a permanent home at 155 Coventry Road — a spacious building with
            ample parking that now serves over a thousand worshippers.
          </p>
          <p>
            Our commitment is to education, to community, and to improving the quality of life of
            our congregation and our neighbours. We teach and practise a deen of tolerance, and we
            reject extremism in all its forms.
          </p>
        </div>

        <dl className="mt-12 grid gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-3">
          {[
            { label: "Established", value: "2012" },
            { label: "Capacity", value: "1,000+ worshippers" },
            { label: "Registered charity", value: "1148223" },
          ].map((f) => (
            <div key={f.label} className="bg-surface p-5">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">{f.label}</dt>
              <dd className="mt-1 font-display text-xl font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
