import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { currentPartnerId } from "@/lib/auth";
import { getPartner, listAssignments, listLeads, listLedger } from "@/lib/store";
import { loc, type Locale } from "@/lib/types";
import { RespondButtons } from "@/components/respond-buttons";

// Reads the session cookie, so it must render per request.
export const dynamic = "force-dynamic";

export default async function PartnerPortal({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; denied?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { token } = await searchParams;
  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;

  // A token on this URL is exchanged for a session by the route handler,
  // which is the only place a cookie may be written.
  if (token) redirect(`/${locale}/partner/enter?token=${encodeURIComponent(token)}`);

  const tenantId = await currentPartnerId();

  if (!tenantId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">{t("partner.no_access_title")}</h1>
        <p className="mt-2 text-[var(--color-ink-500)]">
          {t("partner.no_access_body")}
        </p>
      </div>
    );
  }

  const [partner, assignments, leads, ledger] = await Promise.all([
    getPartner(tenantId),
    listAssignments(tenantId),
    listLeads(),
    listLedger(tenantId),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] pb-4">
        <div>
          <h1 className="text-xl font-bold">
            {partner
              ? loc(partner as unknown as Record<string, unknown>, "name", activeLocale)
              : t("partner.title")}
          </h1>
          <p className="text-sm text-[var(--color-ink-500)]">{t("partner.title")}</p>
        </div>
        <div className="text-end">
          <p className="text-xs font-semibold uppercase text-[var(--color-ink-500)]">
            {t("admin.balance")}
          </p>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-brand-500)]">
            {partner?.credit_balance ?? 0}
          </p>
        </div>
      </header>

      <h2 className="mb-3 text-lg font-bold">{t("partner.your_leads")}</h2>
      {assignments.length === 0 ? (
        <p className="card p-6 text-[var(--color-ink-500)]">{t("partner.no_leads")}</p>
      ) : (
        <div className="grid gap-3">
          {assignments.map((a) => {
            const lead = leads.find((l) => l.id === a.lead_id);
            const settled = Boolean(a.accepted_at || a.declined_at);
            return (
              <div key={a.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-ink-500)]">
                      {lead?.ref}
                    </p>
                    <h3 className="font-bold">{lead?.customer_name}</h3>
                    {/* The phone number is the value being sold: shown only
                        because this partner has already been charged for it. */}
                    <a
                      href={`tel:${lead?.phone}`}
                      className="font-mono text-sm text-[var(--color-brand-500)]"
                      dir="ltr"
                    >
                      {lead?.phone}
                    </a>
                    {lead?.notes ? (
                      <p className="mt-1 text-sm text-[var(--color-ink-500)]">
                        {lead.notes}
                      </p>
                    ) : null}
                  </div>
                  <span className="pill tabular-nums">
                    −{a.credits_charged}
                  </span>
                </div>

                <div className="mt-3 border-t border-[var(--color-line)] pt-3">
                  {a.outcome ? (
                    <span className="pill pill-verified">{t("partner.completed")}</span>
                  ) : settled ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill">
                        {a.accepted_at ? t("partner.accepted") : t("partner.declined")}
                      </span>
                      {a.accepted_at ? (
                        <RespondButtons assignmentId={a.id} stage="accepted" />
                      ) : null}
                    </div>
                  ) : (
                    <RespondButtons assignmentId={a.id} stage="new" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-lg font-bold">{t("partner.ledger")}</h2>
      {ledger.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-500)]">{t("partner.no_ledger")}</p>
      ) : (
        <div className="card divide-y divide-[var(--color-line)]">
          {ledger.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 text-sm">
              <span
                className={`w-12 font-mono tabular-nums ${
                  e.delta < 0
                    ? "text-[var(--color-sand-600)]"
                    : "text-[var(--color-verified-500)]"
                }`}
              >
                {e.delta > 0 ? `+${e.delta}` : e.delta}
              </span>
              <span className="text-[var(--color-ink-500)]">{e.reason}</span>
              <span className="ms-auto font-mono tabular-nums text-[var(--color-ink-500)]">
                {e.balance_after}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
