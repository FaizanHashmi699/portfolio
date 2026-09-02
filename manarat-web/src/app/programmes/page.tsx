import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Container,
  Section,
  Card,
  Button,
  ArrowIcon,
  Figure,
  KhatimPattern,
  PageMasthead,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types";

export const metadata: Metadata = {
  title: "The Academy",
  description:
    "Hifz ul-Qur'an, Arabic, Qur'an and Tajweed, and Nikah at Manarat Foundation — with ages, timetable and fees for every class.",
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
      <main id="main">
        <PageMasthead
          eyebrow="The Academy"
          title="Learn here."
          lede="Every class we run, with the ages, the timetable and the fees set out in full — so you can decide without picking up the phone."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-20 grid gap-5 lg:grid-cols-2">
              {programmes.map((p, i) => (
                <Card key={p.id} interactive className="overflow-hidden">
                  <Link href={`/programmes/${p.slug}`} className="block">
                    <Figure
                      alt={p.title}
                      aspect="16/7"
                      seed={i + 3}
                      className="!rounded-none !border-0 !border-b"
                    />
                    <div className="p-7">
                      <h2 className="font-display text-[1.45rem] font-extrabold text-navy-900">
                        {p.title}
                      </h2>
                      <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
                        {p.summary}
                      </p>

                      <dl className="mt-6 grid gap-3 border-t border-rule-soft pt-5 sm:grid-cols-2">
                        {[
                          ["Ages", p.age_range],
                          ["When", p.schedule],
                          ["Fees", p.fee_text],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k as string} className="border-l-2 border-brand/30 pl-3">
                              <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                                {k}
                              </dt>
                              <dd className="mt-0.5 text-[0.88rem] font-semibold leading-snug text-navy-900">
                                {v}
                              </dd>
                            </div>
                          ))}
                      </dl>

                      <span className="mt-6 inline-flex items-center gap-2 text-[0.9rem] font-bold text-brand">
                        Details &amp; enquiry <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>

            {programmes.length === 0 && (
              <Card className="mt-4 p-12 text-center">
                <p className="text-ink-soft">
                  Our class list is being updated. Please{" "}
                  <Link href="/contact" className="font-semibold text-brand hover:underline">
                    contact the office
                  </Link>{" "}
                  and we will tell you what is running.
                </p>
              </Card>
            )}
          </Container>
        </Section>

        <Section tone="surface">
          <Container>
            <Card className="relative overflow-hidden bg-navy-950 p-9 text-white sm:p-14">
              <span aria-hidden className="absolute inset-0 text-blue-300">
                <KhatimPattern id="prog-cta" opacity={0.06} size={64} />
              </span>
              <div className="relative grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold">
                    Not sure which class fits your child?
                  </h2>
                  <p className="mt-3 max-w-[52ch] leading-relaxed text-white/70">
                    Tell us their age and where they are up to, and our teachers will tell you
                    honestly what suits them — including if the answer is to wait a year.
                  </p>
                </div>
                <Button href="/contact" variant="white" size="lg">
                  Talk to a teacher <ArrowIcon />
                </Button>
              </div>
            </Card>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
