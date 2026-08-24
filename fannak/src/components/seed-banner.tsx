import { getTranslations } from "next-intl/server";
import { usingSeedData } from "@/lib/data";

/**
 * Honesty rail. While no database is connected the site is showing sample
 * data, and it says so — rather than letting demo rows read as real ones.
 */
export async function SeedBanner() {
  if (!usingSeedData()) return null;
  const t = await getTranslations();
  return (
    <div className="bg-[var(--color-sand-500)] px-4 py-1.5 text-center text-xs font-semibold text-white">
      {t("common.seed_banner")}
    </div>
  );
}
