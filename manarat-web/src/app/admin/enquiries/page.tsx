import { createClient } from "@/lib/supabase/server";
import { setEnquiryStatus } from "@/actions/admin";
import { StatusPill, EmptyState, PageTitle } from "@/components/admin/ui";
import { dateTimeShort } from "@/lib/format";
import type { Enquiry, Programme } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEXT: Record<string, { to: string; label: string }[]> = {
  new: [{ to: "contacted", label: "Mark contacted" }, { to: "closed", label: "Close" }],
  contacted: [{ to: "enrolled", label: "Mark enrolled" }, { to: "closed", label: "Close" }],
  enrolled: [{ to: "closed", label: "Close" }],
  closed: [{ to: "new", label: "Reopen" }],
};

export default async function EnquiriesPage() {
  const supabase = await createClient();
  const [{ data: enquiries }, { data: programmes }] = await Promise.all([
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
    supabase.from("programmes").select("id,title"),
  ]);

  const list = (enquiries ?? []) as Enquiry[];
  const names = new Map((programmes ?? []).map((p: Pick<Programme, "id" | "title">) => [p.id, p.title]));

  return (
    <>
      <PageTitle title="Enquiries" note="Every enquiry sent from a programme page." />

      {list.length === 0 ? (
        <EmptyState>No enquiries yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {list.map((e) => (
            <article key={e.id} className="rounded-sm border border-rule bg-surface p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-display text-lg font-medium">{e.parent_name}</h2>
                <StatusPill status={e.status} />
                <span className="ml-auto text-xs text-ink-mute">{dateTimeShort(e.created_at)}</span>
              </div>

              <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">Email</dt>
                  <dd><a href={`mailto:${e.email}`} className="text-brand hover:underline">{e.email}</a></dd>
                </div>
                {e.phone && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">Phone</dt>
                    <dd>{e.phone}</dd>
                  </div>
                )}
                {e.programme_id && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">About</dt>
                    <dd>{names.get(e.programme_id) ?? "—"}</dd>
                  </div>
                )}
                {(e.child_name || e.child_age) && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">Child</dt>
                    <dd>{e.child_name ?? "—"}{e.child_age ? `, age ${e.child_age}` : ""}</dd>
                  </div>
                )}
              </dl>

              {e.message && (
                <p className="mt-3 rounded-sm bg-ground p-3 text-sm leading-relaxed text-ink-soft">
                  {e.message}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(NEXT[e.status] ?? []).map((a) => (
                  <form key={a.to} action={setEnquiryStatus}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="status" value={a.to} />
                    <button className="rounded-sm border border-rule px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand hover:text-brand">
                      {a.label}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
