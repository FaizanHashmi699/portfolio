import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DonateForm } from "@/components/donate-form";
import { CampaignProgress } from "@/components/campaign-progress";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Manarat Foundation — one-off or monthly, with Gift Aid adding 25p to every eligible pound.",
};

export const revalidate = 60;

export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_primary", true)
    .eq("published", true)
    .maybeSingle();

  const appeal = data as Campaign | null;
  const paymentsLive = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl font-medium tracking-tight">Donate</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Sadaqah, Zakat and support for the masjid&rsquo;s daily work. If you pay UK tax, Gift Aid
          adds 25p to every pound at no cost to you.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-sm border border-rule bg-surface p-7">
            <DonateForm
              campaignId={appeal?.id ?? null}
              campaignTitle={appeal?.title ?? null}
              paymentsLive={paymentsLive}
            />
          </div>

          <aside className="space-y-6">
            {appeal && (
              <div className="rounded-sm border border-rule bg-surface p-6">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Where it goes
                </p>
                <p className="mt-2 font-display text-lg font-medium">{appeal.title}</p>
                <p className="mt-2 mb-5 text-sm leading-relaxed text-ink-soft">{appeal.summary}</p>
                <CampaignProgress
                  raisedPence={appeal.raised_pence}
                  targetPence={appeal.target_pence}
                />
              </div>
            )}

            <div className="rounded-sm border border-rule bg-surface p-6 text-sm leading-relaxed text-ink-soft">
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">Other ways</p>
              <p className="mt-3">
                <strong className="font-semibold text-ink">Bank transfer or cheque</strong> — ask at
                the office for details, or make cheques payable to Manarat Foundation.
              </p>
              <p className="mt-3">
                <strong className="font-semibold text-ink">In person</strong> — the donation boxes
                in the prayer hall.
              </p>
              <p className="mt-4 text-xs text-ink-mute">Registered charity 1148223.</p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
