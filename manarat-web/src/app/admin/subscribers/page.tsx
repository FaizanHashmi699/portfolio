import { createClient } from "@/lib/supabase/server";
import {
  EmptyState,
  PageTitle,
  AdminTable,
  adminRow,
  adminCell,
} from "@/components/admin/ui";
import { dateTimeShort } from "@/lib/format";
import type { Subscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

const HEAD = [{ label: "Email" }, { label: "Name" }, { label: "Joined" }];

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  const subs = (data ?? []) as Subscriber[];
  const active = subs.filter((s) => !s.unsubscribed);

  return (
    <>
      <PageTitle
        title="Newsletter subscribers"
        note="The masjid's own list — the one channel to supporters that no platform owns."
      />

      {subs.length === 0 ? (
        <EmptyState>No subscribers yet.</EmptyState>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2.5">
            <span className="rounded-chip border border-brand bg-brand-wash px-4 py-1.5 text-sm font-bold text-brand-deep">
              {active.length} active
            </span>
            {subs.length !== active.length && (
              <span className="rounded-chip border border-rule bg-surface-2 px-4 py-1.5 text-sm font-bold text-ink-mute">
                {subs.length - active.length} unsubscribed
              </span>
            )}
          </div>

          <AdminTable head={HEAD} minWidth={480}>
            {subs.map((s) => (
              <tr key={s.id} className={adminRow}>
                <td className={adminCell}>
                  <span className="font-medium text-ink">{s.email}</span>
                  {s.unsubscribed && (
                    <span className="ml-2.5 rounded-chip border border-rule bg-surface-2 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
                      unsubscribed
                    </span>
                  )}
                </td>
                <td className={`${adminCell} text-ink-soft`}>{s.name ?? "—"}</td>
                <td className={`${adminCell} whitespace-nowrap text-ink-mute`}>
                  {dateTimeShort(s.created_at)}
                </td>
              </tr>
            ))}
          </AdminTable>
        </>
      )}
    </>
  );
}
