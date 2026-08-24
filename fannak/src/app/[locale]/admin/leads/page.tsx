import { redirect } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { isAdmin } from "@/lib/auth";
import { listAssignments, listLeads, listPartners } from "@/lib/store";
import { loc, type Locale } from "@/lib/types";
import { AssignForm } from "@/components/assign-form";

export default async function AdminLeads({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);

  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;
  const [leads, partners, assignments] = await Promise.all([
    listLeads(),
    listPartners(),
    listAssignments(),
  ]);

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">{t("admin.nav_leads")}</h1>

      {leads.length === 0 ? (
        <p className="card p-6 text-[var(--color-ink-500)]">{t("admin.no_leads")}</p>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => {
            const assigned = assignments.filter((a) => a.lead_id === lead.id);
            return (
              <div key={lead.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-ink-500)]">
                      {lead.ref}
                    </p>
                    <h3 className="font-bold">{lead.customer_name}</h3>
                    <p className="font-mono text-sm text-[var(--color-ink-500)]" dir="ltr">
                      {lead.phone}
                    </p>
                    {lead.notes ? (
                      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
                        {lead.notes}
                      </p>
                    ) : null}
                  </div>
                  <span className="pill">{lead.status}</span>
                </div>

                {assigned.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {assigned.map((a) => {
                      const p = partners.find((x) => x.id === a.tenant_id);
                      return (
                        <li key={a.id} className="pill">
                          {p
                            ? loc(p as unknown as Record<string, unknown>, "name", activeLocale)
                            : a.tenant_id}
                          {a.accepted_at ? " ✓" : a.declined_at ? " ✕" : ""}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <div className="mt-3 border-t border-[var(--color-line)] pt-3">
                  <AssignForm
                    leadId={lead.id}
                    partners={partners.map((p) => ({
                      id: p.id,
                      label: `${loc(p as unknown as Record<string, unknown>, "name", activeLocale)} (${p.credit_balance})`,
                      disabled: p.credit_balance < 1,
                    }))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
