import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";
import { Container, Section, Card, Figure, KhatimPattern } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types";

export const revalidate = 300;

async function getProgramme(slug: string): Promise<Programme | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Programme) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const programme = await getProgramme(slug);
  if (!programme) return { title: "Programme not found" };
  return { title: programme.title, description: programme.summary };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = await getProgramme(slug);
  if (!programme) notFound();

  const facts = [
    ["Ages", programme.age_range],
    ["When", programme.schedule],
    ["Fees", programme.fee_text],
    ["Teachers", programme.teacher_note],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden bg-navy-950 pb-32 pt-16 text-white sm:pt-20">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="prog-hero" opacity={0.06} size={72} />
          </span>
          <span
            aria-hidden
            className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(21,145,220,.3), transparent 68%)" }}
          />
          <Container className="relative">
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-blue-300 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 8H4M7.5 3.7 3.2 8l4.3 4.3" />
              </svg>
              All programmes
            </Link>
            <div className="mt-6 max-w-2xl">
              <h1 className="font-display text-[clamp(2.1rem,4.6vw,3.2rem)] font-extrabold leading-[1.06]">
                {programme.title}
              </h1>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">{programme.summary}</p>
            </div>
          </Container>
        </section>

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <Card className="p-7 sm:p-9">
                {facts.length > 0 && (
                  <dl className="grid gap-5 border-b border-rule-soft pb-8 sm:grid-cols-2">
                    {facts.map(([k, v]) => (
                      <div key={k} className="border-l-2 border-brand pl-4">
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                          {k}
                        </dt>
                        <dd className="mt-1 font-semibold leading-snug text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {programme.body && (
                  <div className="prose-measure mt-8 grid gap-5 text-[1rem] leading-[1.75] text-ink-soft">
                    {programme.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                <div className="mt-10 border-t border-rule-soft pt-8">
                  <h2 className="font-display text-2xl font-extrabold text-navy-900">
                    Enquire about a place
                  </h2>
                  <p className="mt-2 mb-7 text-[0.95rem] text-ink-soft">
                    Tell us a little about your child and we will let you know honestly what is
                    available — including if the answer is to wait.
                  </p>
                  <EnquiryForm programmeId={programme.id} programmeTitle={programme.title} />
                </div>
              </Card>

              <aside className="grid gap-5">
                <Figure alt={programme.title} aspect="4/3" seed={programme.sort_order + 2} />
                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Also at the academy
                  </h2>
                  <ul className="mt-4 grid gap-2.5 text-[0.92rem]">
                    {[
                      ["Hifz ul-Qur'an", "/programmes/hifz"],
                      ["Arabic language", "/programmes/arabic"],
                      ["Qur'an & Tajweed", "/programmes/islamic-studies"],
                      ["Nikah & marriage", "/programmes/nikah"],
                    ]
                      .filter(([, href]) => !href.endsWith(programme.slug))
                      .map(([label, href]) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className="flex items-center justify-between gap-3 rounded-card border border-rule px-4 py-3 font-semibold text-navy-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand hover:shadow-md"
                          >
                            {label}
                            <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                  </ul>
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
