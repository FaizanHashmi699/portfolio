import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Hifz, Arabic, Qur'an and Islamic studies, and Nikah at Manarat Foundation — with ages, times and fees for each.",
};

export const revalidate = 300;

export default async function ProgrammesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  const programmes = (data ?? []) as Programme[];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">Programmes</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Every class we run, with the ages, the timetable and the fees set out in full. If a
          question isn&rsquo;t answered here, send an enquiry from the programme page and we will
          come back to you.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {programmes.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-4 rounded-sm border border-rule bg-surface p-7"
            >
              <h2 className="font-display text-2xl font-medium tracking-tight">
                <Link href={`/programmes/${p.slug}`} className="hover:text-brand">
                  {p.title}
                </Link>
              </h2>
              <p className="leading-relaxed text-ink-soft">{p.summary}</p>

              <dl className="grid gap-2 border-t border-rule-soft pt-4 text-sm">
                {p.age_range && (
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                      Ages
                    </dt>
                    <dd>{p.age_range}</dd>
                  </div>
                )}
                {p.schedule && (
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                      When
                    </dt>
                    <dd>{p.schedule}</dd>
                  </div>
                )}
                {p.fee_text && (
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                      Fees
                    </dt>
                    <dd>{p.fee_text}</dd>
                  </div>
                )}
              </dl>

              <Link
                href={`/programmes/${p.slug}`}
                className="mt-auto w-fit rounded-sm border border-rule px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
              >
                Details &amp; enquiry →
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
