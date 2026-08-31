import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Stat, StatusPill, EmptyState, PageTitle } from "@/components/admin/ui";
import { money, moneyShort, dateTimeShort, giftAidBonus } from "@/lib/format";
import type { Campaign, Donation, Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [donationsRes, enquiriesRes, subsRes, campaignRes] = await Promise.all([
    supabase.from("donations").select("*").order("created_at", { ascending: false }),
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("unsubscribed", false),
    supabase.from("campaigns").select("*").eq("is_primary", true).maybeSingle(),
  ]);

  const donations = (donationsRes.data ?? []) as Donation[];
  const enquiries = (enquiriesRes.data ?? []) as Enquiry[];
  const campaign = campaignRes.data as Campaign | null;

  const paid = donations.filter((d) => d.status === "paid");
  const pending = donations.filter((d) => d.status === "pending");
  const paidTotal = paid.reduce((s, d) => s + d.amount_pence, 0);
  const pendingTotal = pending.reduce((s, d) => s + d.amount_pence, 0);
  const monthly = paid.filter((d) => d.frequency === "monthly");
  const monthlyTotal = monthly.reduce((s, d) => s + d.amount_pence, 0);
  const giftAidable = paid.filter((d) => d.gift_aid).reduce((s, d) => s + d.amount_pence, 0);
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;

  return (
    <>
      <PageTitle
        title="Dashboard"
        note="Everything arriving through the site, in one place."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Confirmed income"
          value={moneyShort(paidTotal)}
          note={`${paid.length} confirmed donation${paid.length === 1 ? "" : "s"}`}
          tone="brand"
        />
        <Stat
          label="Awaiting confirmation"
          value={moneyShort(pendingTotal)}
          note={`${pending.length} pledge${pending.length === 1 ? "" : "s"} to review`}
          tone={pending.length > 0 ? "accent" : "default"}
        />
        <Stat
          label="Monthly giving"
          value={moneyShort(monthlyTotal)}
          note={`${monthly.length} regular giver${monthly.length === 1 ? "" : "s"} · ${moneyShort(monthlyTotal * 12)} a year`}
        />
        <Stat
          label="Gift Aid claimable"
          value={moneyShort(giftAidBonus(giftAidable))}
          note="25p per eligible pound on confirmed gifts"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New enquiries" value={String(newEnquiries)} note="Unanswered" tone={newEnquiries > 0 ? "accent" : "default"} />
        <Stat label="Newsletter" value={String(subsRes.count ?? 0)} note="Active subscribers" />
        {campaign && (
          <div className="rounded-sm border border-rule bg-surface p-5 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">Current appeal</p>
            <p className="mt-1 font-display text-lg font-medium">{campaign.title}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-sm bg-surface-2">
              <div
                className="h-full bg-brand"
                style={{
                  width: `${Math.min(100, campaign.target_pence ? (campaign.raised_pence / campaign.target_pence) * 100 : 0)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              {money(campaign.raised_pence)} of {moneyShort(campaign.target_pence)}
            </p>
          </div>
        )}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-4">
          <h2 className="font-display text-xl font-medium">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="ml-auto text-sm text-brand hover:underline">
            All enquiries →
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <EmptyState>
            No enquiries yet. They will appear here as soon as someone uses a programme form.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-rule bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-rule text-left text-[10px] uppercase tracking-[0.1em] text-ink-mute">
                  <th className="px-4 py-2.5 font-medium">Received</th>
                  <th className="px-4 py-2.5 font-medium">From</th>
                  <th className="px-4 py-2.5 font-medium">Child</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id} className="border-b border-rule-soft last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-ink-mute">
                      {dateTimeShort(e.created_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{e.parent_name}</span>
                      <span className="block text-xs text-ink-mute">{e.email}</span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {e.child_name ?? "—"}
                      {e.child_age ? `, ${e.child_age}` : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
