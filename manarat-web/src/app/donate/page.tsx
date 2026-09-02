import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DonateForm } from "@/components/donate-form";
import { CampaignProgress } from "@/components/campaign-progress";
import { Container, Section, Card, KhatimPattern } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { paymentsEnabled } from "@/lib/payments";
import { moneyShort } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Manarat Foundation — one-off or monthly. Gift Aid adds 25p to every eligible pound at no cost to you. Registered charity 1148223.",
};

export const revalidate = 60;

const REASSURANCE = [
  {
    title: "Every pound accounted for",
    body: "We are a registered charity, number 1148223, and file audited accounts with the Charity Commission each year.",
    d: "M12 3 4.5 6.2v5.4c0 4.5 3.2 8.7 7.5 9.7 4.3-1 7.5-5.2 7.5-9.7V6.2Z M9 12l2.2 2.2L15.5 10",
  },
  {
    title: "Gift Aid adds 25%",
    body: "If you pay UK tax, we can claim an extra 25p from HMRC on every pound — it costs you nothing.",
    d: "M12 3v18M8 6.5h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6",
  },
  {
    title: "Straight to the work",
    body: "Your gift funds the prayer hall, the academy and the daily running of the masjid — not overheads.",
    d: "M3.6 12h16.8M12 3.6v16.8M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
  },
];

export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_primary", true)
    .eq("published", true)
    .maybeSingle();

  const appeal = data as Campaign | null;
  const live = paymentsEnabled();

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ---------------------------------------------------- masthead */}
        <section className="relative overflow-hidden bg-navy-950 pb-32 pt-16 text-white sm:pt-20">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="donate" opacity={0.06} size={72} />
          </span>
          <span
            aria-hidden
            className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(21,145,220,.32), transparent 68%)" }}
          />
          <Container className="relative">
            <div className="max-w-2xl">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
                Sadaqah · Zakat · Lillah
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.05]">
                Give to the masjid.
              </h1>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">
                Every prayer held here, every child taught to read the Qur&rsquo;an, and every
                neighbour helped is carried by the people who give. Jazakum Allahu khayran.
              </p>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------- form */}
        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1fr)_368px] lg:items-start">
              <Card className="p-6 sm:p-9">
                <h2 className="font-display text-2xl font-extrabold text-navy-900">
                  Choose your gift
                </h2>
                <p className="mt-2 mb-8 text-[0.95rem] text-ink-soft">
                  {live
                    ? "Card, Apple Pay and Google Pay are accepted on the next page."
                    : "Card payments are not switched on yet — this records your pledge and a reference."}
                </p>
                <DonateForm
                  campaignId={appeal?.id ?? null}
                  campaignTitle={appeal?.title ?? null}
                  paymentsLive={live}
                />
              </Card>

              <aside className="grid gap-5 lg:sticky lg:top-28">
                {appeal && (
                  <Card className="overflow-hidden">
                    <div className="relative bg-navy-950 p-6 text-white">
                      <span aria-hidden className="absolute inset-0 text-blue-300">
                        <KhatimPattern id="aside" opacity={0.08} size={48} />
                      </span>
                      <div className="relative">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-blue-300">
                          Where it goes
                        </p>
                        <p className="mt-2 font-display text-lg font-extrabold">{appeal.title}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <CampaignProgress
                        raisedPence={appeal.raised_pence}
                        targetPence={appeal.target_pence}
                      />
                      <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-soft">
                        {appeal.summary}
                      </p>
                      <dl className="mt-5 flex gap-6 border-t border-rule-soft pt-4">
                        <div>
                          <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                            Target
                          </dt>
                          <dd className="mt-0.5 font-display text-base font-extrabold tabular-nums text-navy-900">
                            {moneyShort(appeal.target_pence)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                            With Gift Aid
                          </dt>
                          <dd className="mt-0.5 font-display text-base font-extrabold tabular-nums text-brand">
                            +25%
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                    Other ways to give
                  </h3>
                  <dl className="mt-4 grid gap-4 text-[0.9rem] leading-relaxed">
                    <div>
                      <dt className="font-bold text-navy-900">Bank transfer or cheque</dt>
                      <dd className="mt-0.5 text-ink-soft">
                        Ask at the office for details, or make cheques payable to Manarat
                        Foundation.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-navy-900">In person</dt>
                      <dd className="mt-0.5 text-ink-soft">
                        The donation boxes in the prayer hall, at any prayer.
                      </dd>
                    </div>
                  </dl>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------- trust */}
        <Section tone="surface">
          <Container>
            <div className="grid gap-5 sm:grid-cols-3">
              {REASSURANCE.map((r) => (
                <Card key={r.title} className="p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-card bg-brand-wash text-brand">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
                      <path d={r.d} />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-[1.1rem] font-extrabold text-navy-900">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{r.body}</p>
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
