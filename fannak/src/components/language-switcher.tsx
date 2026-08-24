"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * Switching language must keep you where you are.
 *
 * Sending the viewer back to the home page is not a language switch — it is a
 * language switch plus losing your place, and on the directory it silently
 * discards the search and filters they just set.
 *
 * `useSearchParams` forces a client bailout, so the query-preserving version
 * renders inside Suspense. The fallback still preserves the PATH, so the worst
 * case is a switch that keeps the page but drops the filters — never one that
 * throws you back to the home page.
 */

function useTarget() {
  const params = useParams();
  const current = (params.locale as string) ?? "ar";
  const other = current === "ar" ? "en" : "ar";
  return other as "ar" | "en";
}

const CLASSES =
  "rounded border border-[var(--color-line)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-brand-500)]";

function SwitcherLink({
  query,
}: {
  query?: Record<string, string>;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const other = useTarget();

  return (
    <Link
      href={query ? { pathname, query } : pathname}
      locale={other}
      lang={other}
      dir={other === "ar" ? "rtl" : "ltr"}
      className={CLASSES}
    >
      {t("nav.language")}
    </Link>
  );
}

function WithQuery() {
  const search = useSearchParams();
  return <SwitcherLink query={Object.fromEntries(search.entries())} />;
}

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<SwitcherLink />}>
      <WithQuery />
    </Suspense>
  );
}
