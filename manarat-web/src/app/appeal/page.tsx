import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CampaignProgress } from "@/components/campaign-progress";
import {
  Container,
  Section,
  Card,
  Button,
  ArrowIcon,
  Figure,
  KhatimPattern,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { moneyShort } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our appeal",
  description:
    "The Manarat Expansion — extending the prayer hall and building dedicated classrooms for Sheldon and Solihull.",
};

export const revalidate = 60;

export default async function AppealPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_primary", true)
    .eq("published", true)
    .maybeSingle();

  const appeal = data as Campaign | null;
  if (!appeal) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden bg-navy-950 pb-32 pt-16 text-white sm:pt-20">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="appeal-hero" opacity={0.06} size={72} />
          </span>
          <span
            aria-hidden
            className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(21,145,220,.32), transparent 68%)" }}
          />
          <Container className="relative">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
                Our current appeal
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.05]">
                {appeal.title}
              </h1>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">{appeal.summary}</p>
            </div>
          </Container>
        </section>

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <Card className="p-7 sm:p-9">
                <CampaignProgress
                  raisedPence={appeal.raised_pence}
                  targetPence={appeal.target_pence}
                />
                <div className="mt-8 flex flex-wrap gap-3 border-t border-rule-soft pt-8">
                  <Button href="/donate" size="lg">
                    Give to this appeal <ArrowIcon />
                  </Button>
                  <Button href="/contact" variant="outline" size="lg">
                    Ask a question
                  </Button>
                </div>

                {appeal.body && (
                  <div className="prose-measure mt-10 grid gap-5 border-t border-rule-soft pt-8 text-[1rem] leading-[1.75] text-ink-soft">
                    {appeal.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </Card>

              <aside className="grid gap-5">
                <Figure alt="The prayer hall on Jumu'ah" aspect="4/3" seed={8} />
                <Card className="p-6">
                  <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    At a glance
                  </h2>
                  <dl className="mt-4 grid gap-4">
                    {[
                      ["Target", moneyShort(appeal.target_pence)],
                      ["Raised", moneyShort(appeal.raised_pence)],
                      ["Gift Aid", "Adds 25% at no cost to you"],
                      ["Charity number", "1148223"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 text-[0.9rem]">
                        <dt className="text-ink-soft">{k}</dt>
                        <dd className="text-right font-semibold tabular-nums text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 border-t border-rule-soft pt-4 text-[0.8rem] leading-relaxed text-ink-mute">
                    The raised total is calculated from confirmed donations and updates itself. It
                    is never edited by hand.
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
