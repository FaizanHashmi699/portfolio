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
        <div className="space-y-5">
          {list.map((e) => (
            <article
              key={e.id}
              className={`relative overflow-hidden rounded-card border bg-surface p-6 shadow-sm sm:p-7 ${
                e.status === "new" ? "border-brand" : "border-rule"
              }`}
            >
              {e.status === "new" && (
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 className="font-display text-[1.15rem] font-extrabold tracking-tight text-brand-deep">
                  {e.parent_name}
                </h2>
                <StatusPill status={e.status} />
                <span className="ml-auto text-xs text-ink-mute">{dateTimeShort(e.created_at)}</span>
              </div>

              <dl className="mt-5 grid gap-x-10 gap-y-2.5 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 pt-px text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                    Email
                  </dt>
                  <dd>
                    <a href={`mailto:${e.email}`} className="font-medium text-brand hover:underline">
                      {e.email}
                    </a>
                  </dd>
                </div>
                {e.phone && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 pt-px text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                      Phone
                    </dt>
                    <dd className="font-medium text-ink">{e.phone}</dd>
                  </div>
                )}
                {e.programme_id && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 pt-px text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                      About
                    </dt>
                    <dd className="font-medium text-ink">{names.get(e.programme_id) ?? "—"}</dd>
                  </div>
                )}
                {(e.child_name || e.child_age) && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 pt-px text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                      Child
                    </dt>
                    <dd className="font-medium text-ink">
                      {e.child_name ?? "—"}
                      {e.child_age ? `, age ${e.child_age}` : ""}
                    </dd>
                  </div>
                )}
              </dl>

              {e.message && (
                <p className="mt-5 rounded-card border-l-[3px] border-brand bg-brand-wash/50 px-5 py-4 text-sm leading-[1.7] text-ink-soft">
                  {e.message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2.5 border-t border-rule-soft pt-5">
                {(NEXT[e.status] ?? []).map((a) => (
                  <form key={a.to} action={setEnquiryStatus}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="status" value={a.to} />
                    <button className="rounded-chip border border-rule px-4 py-2 text-xs font-bold text-ink-soft transition-all duration-300 hover:border-brand hover:text-brand-deep">
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
