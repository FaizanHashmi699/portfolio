import { createClient } from "@/lib/supabase/server";
import { setDonationStatus } from "@/actions/admin";
import {
  StatusPill,
  EmptyState,
  PageTitle,
  AdminTable,
  adminRow,
  adminCell,
} from "@/components/admin/ui";
import { money, dateTimeShort } from "@/lib/format";
import type { Donation } from "@/lib/types";

export const dynamic = "force-dynamic";

const HEAD = [
  { label: "Received" },
  { label: "Ref" },
  { label: "Donor" },
  { label: "Amount", align: "right" as const },
  { label: "Type" },
  { label: "Gift Aid" },
  { label: "Status" },
  { label: "Action" },
];

export default async function DonationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });
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
        <AdminTable head={HEAD} minWidth={880}>
          {donations.map((d) => (
            <tr key={d.id} className={adminRow}>
              <td className={`${adminCell} whitespace-nowrap text-ink-mute`}>
                {dateTimeShort(d.created_at)}
              </td>
              <td className={`${adminCell} font-mono text-xs text-ink-soft`}>{d.reference}</td>
              <td className={adminCell}>
                <span className="font-bold text-brand-deep">
                  {d.donor_name ?? <span className="font-normal text-ink-mute">Anonymous</span>}
                </span>
                {d.donor_email && (
                  <span className="mt-0.5 block text-xs text-ink-mute">{d.donor_email}</span>
                )}
              </td>
              <td className={`${adminCell} text-right font-bold tabular-nums text-brand-deep`}>
                {money(d.amount_pence)}
              </td>
              <td className={`${adminCell} text-ink-soft`}>
                {d.frequency === "monthly" ? "Monthly" : "One-off"}
              </td>
              <td className={adminCell}>
                {d.gift_aid ? (
                  <span className="font-bold text-brand">Yes</span>
                ) : (
                  <span className="text-ink-mute">No</span>
                )}
              </td>
              <td className={adminCell}>
                <StatusPill status={d.status} />
              </td>
              <td className={adminCell}>
                <div className="flex gap-2">
                  {d.status !== "paid" && (
                    <form action={setDonationStatus}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="paid" />
                      <button className="rounded-chip bg-brand px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700">
                        Mark paid
                      </button>
                    </form>
                  )}
                  {d.status !== "cancelled" && (
                    <form action={setDonationStatus}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button className="rounded-chip border border-rule px-3.5 py-1.5 text-xs font-bold text-ink-soft transition-colors hover:border-brand hover:text-brand-deep">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
