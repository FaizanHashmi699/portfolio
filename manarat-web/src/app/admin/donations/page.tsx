import { createClient } from "@/lib/supabase/server";
import { setDonationStatus } from "@/actions/admin";
import { StatusPill, EmptyState, PageTitle } from "@/components/admin/ui";
import { money, dateTimeShort } from "@/lib/format";
import type { Donation } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
  const donations = (data ?? []) as Donation[];

  return (
    <>
      <PageTitle
        title="Donations"
        note="Marking a donation paid adds it to the appeal total automatically. Until card payments are switched on, gifts arrive here as pledges to confirm by hand."
      />

      {donations.length === 0 ? (
        <EmptyState>No donations yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-rule bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-[10px] uppercase tracking-[0.1em] text-ink-mute">
                <th className="px-4 py-2.5 font-medium">Received</th>
                <th className="px-4 py-2.5 font-medium">Ref</th>
                <th className="px-4 py-2.5 font-medium">Donor</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Gift Aid</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b border-rule-soft last:border-0">
                  <td className="px-4 py-2.5 whitespace-nowrap text-ink-mute">
                    {dateTimeShort(d.created_at)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{d.reference}</td>
                  <td className="px-4 py-2.5">
                    {d.donor_name ?? <span className="text-ink-mute">Anonymous</span>}
                    {d.donor_email && (
                      <span className="block text-xs text-ink-mute">{d.donor_email}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {money(d.amount_pence)}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {d.frequency === "monthly" ? "Monthly" : "One-off"}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.gift_aid ? (
                      <span className="text-brand">Yes</span>
                    ) : (
                      <span className="text-ink-mute">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      {d.status !== "paid" && (
                        <form action={setDonationStatus}>
                          <input type="hidden" name="id" value={d.id} />
                          <input type="hidden" name="status" value="paid" />
                          <button className="rounded-sm bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-deep">
                            Mark paid
                          </button>
                        </form>
                      )}
                      {d.status !== "cancelled" && (
                        <form action={setDonationStatus}>
                          <input type="hidden" name="id" value={d.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button className="rounded-sm border border-rule px-2.5 py-1 text-xs hover:border-brand">
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
