import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logoutAction } from "@/app/[locale]/admin/actions";
import { usingMemoryStore } from "@/lib/store";

export async function AdminNav({ locale }: { locale: string }) {
  const t = await getTranslations();
  return (
    <div className="mb-6 border-b border-[var(--color-line)] pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-[var(--color-brand-500)]">
          {t("admin.title")}
        </span>
        <nav className="ms-auto flex flex-wrap items-center gap-1 text-sm">
          <Link href="/admin" className="rounded px-3 py-1.5 hover:text-[var(--color-brand-500)]">
            {t("admin.nav_overview")}
          </Link>
          <Link href="/admin/partners" className="rounded px-3 py-1.5 hover:text-[var(--color-brand-500)]">
            {t("admin.nav_partners")}
          </Link>
          <Link href="/admin/leads" className="rounded px-3 py-1.5 hover:text-[var(--color-brand-500)]">
            {t("admin.nav_leads")}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost text-sm">
              {t("admin.logout")}
            </button>
          </form>
        </nav>
      </div>
      {usingMemoryStore() ? (
        <p className="mt-3 rounded border border-[var(--color-sand-500)] px-3 py-2 text-xs text-[var(--color-sand-600)]">
          {t("admin.memory_warning")}
        </p>
      ) : null}
    </div>
  );
}
