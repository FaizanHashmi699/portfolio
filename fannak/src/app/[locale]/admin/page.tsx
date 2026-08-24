import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isAdmin } from "@/lib/auth";
import { listAssignments, listLeads, listMessages, listPartners } from "@/lib/store";

export default async function AdminOverview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);

  const t = await getTranslations();
  const [partners, leads, assignments, messages] = await Promise.all([
    listPartners(),
    listLeads(),
    listAssignments(),
    listMessages(10),
  ]);

  const unassigned = leads.filter((l) => l.status === "new").length;
  const credits = partners.reduce((sum, p) => sum + p.credit_balance, 0);

  const tiles = [
    { label: t("admin.tile_partners"), value: partners.length },
    { label: t("admin.tile_unassigned"), value: unassigned, alert: unassigned > 0 },
    { label: t("admin.tile_assigned"), value: assignments.length },
    { label: t("admin.tile_credits"), value: credits },
  ];

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">{t("admin.nav_overview")}</h1>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              {tile.label}
            </p>
            <p
              className={`mt-1 text-3xl font-bold tabular-nums ${
                tile.alert ? "text-[var(--color-sand-500)]" : ""
              }`}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      {unassigned > 0 ? (
        <Link href="/admin/leads" className="btn btn-primary mb-8">
          {t("admin.go_assign")}
        </Link>
      ) : null}

      <h2 className="mb-3 text-lg font-bold">{t("admin.message_log")}</h2>
      {messages.length ? (
        <div className="card divide-y divide-[var(--color-line)]">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <span
                className={`pill ${m.status === "failed" ? "text-[var(--color-sand-600)]" : ""}`}
              >
                {m.status}
              </span>
              <span className="font-mono text-xs" dir="ltr">
                {m.recipient}
              </span>
              <span className="text-[var(--color-ink-500)]">{m.template}</span>
              {m.error ? (
                <span className="text-xs text-[var(--color-sand-600)]">{m.error}</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-ink-500)]">{t("admin.no_messages")}</p>
      )}
    </>
  );
}
