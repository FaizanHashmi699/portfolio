import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations();
  return (
    <footer className="mt-16 border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-[var(--color-ink-500)]">
        <p className="font-semibold text-[var(--color-ink-700)]">
          {t("brand.name")}
        </p>
        <p className="mt-1 max-w-2xl">{t("common.footer_note")}</p>
      </div>
    </footer>
  );
}
