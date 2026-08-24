import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations();
  const locale = await getLocale();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[var(--color-brand-500)]">
            {t("brand.name")}
          </span>
          <span className="hidden text-xs text-[var(--color-ink-500)] sm:inline">
            {t("brand.tagline")}
          </span>
        </Link>

        <nav className="ms-auto flex items-center gap-1 text-sm">
          <Link
            href="/providers"
            className="rounded px-3 py-2 text-[var(--color-ink-700)] hover:text-[var(--color-brand-500)]"
          >
            {t("nav.directory")}
          </Link>
          <Link href="/request" className="btn btn-primary text-sm">
            {t("nav.request")}
          </Link>
          <Link
            href="/"
            locale={other}
            className="rounded border border-[var(--color-line)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-brand-500)]"
          >
            {t("nav.language")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
