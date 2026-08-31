import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageTitle } from "@/components/admin/ui";
import { dateTimeShort } from "@/lib/format";
import type { Subscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
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
          <p className="mb-4 text-sm text-ink-soft">
            <strong className="font-semibold text-ink">{active.length}</strong> active
            {subs.length !== active.length && ` · ${subs.length - active.length} unsubscribed`}
          </p>
          <div className="overflow-x-auto rounded-sm border border-rule bg-surface">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="border-b border-rule text-left text-[10px] uppercase tracking-[0.1em] text-ink-mute">
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-rule-soft last:border-0">
                    <td className="px-4 py-2.5">
                      {s.email}
                      {s.unsubscribed && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.08em] text-ink-mute">
                          unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{s.name ?? "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-ink-mute">
                      {dateTimeShort(s.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
