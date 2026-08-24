import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/data";
import { loc, type Locale } from "@/lib/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;
  const services = await getServices();
  const popular = services.filter((s) => s.category === "ac").slice(0, 6);

  return (
    <>
      {/* Hero. The search box is the hero, because "AC repair near me" is
          the actual entry point for this market. */}
      <section className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="mb-3 text-sm font-semibold text-[var(--color-brand-500)]">
            {t("common.riyadh")}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold sm:text-5xl">
            {t("home.hero_title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-ink-500)]">
            {t("home.hero_sub")}
          </p>

          <form
            action={`/${locale}/providers`}
            className="mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row"
          >
            <input
              type="search"
              name="q"
              className="field flex-1"
              placeholder={t("home.search_placeholder")}
              aria-label={t("directory.search_label")}
            />
            <button type="submit" className="btn btn-primary">
              {t("home.cta_search")}
            </button>
          </form>

          <div className="mt-4">
            <Link href="/request" className="btn btn-accent">
              {t("home.cta_request")}
            </Link>
          </div>
        </div>
      </section>

      {/* Popular services — each is a pre-filtered directory query. */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-5 text-xl font-bold">{t("home.popular")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((s) => (
            <Link
              key={s.slug}
              href={`/providers?service=${s.slug}`}
              className="card p-4 transition-colors hover:border-[var(--color-brand-500)]"
            >
              <h3 className="font-semibold">
                {loc(s as unknown as Record<string, unknown>, "name", activeLocale)}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-500)]">
                {loc(
                  s as unknown as Record<string, unknown>,
                  "description",
                  activeLocale,
                )}
              </p>
              {s.typical_price_min ? (
                <p className="mt-3 text-sm font-semibold text-[var(--color-brand-600)] tabular-nums">
                  {s.typical_price_min}–{s.typical_price_max} {t("service.sar")}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-xl font-bold">{t("home.how_title")}</h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-sm font-bold text-white tabular-nums">
                  {n}
                </span>
                <div>
                  <h3 className="font-semibold">
                    {t(`home.how_${n}_title` as "home.how_1_title")}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-ink-500)]">
                    {t(`home.how_${n}_body` as "home.how_1_body")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust. Verification is the product differentiator, so it gets space. */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-bold">{t("home.trust_title")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["verified", "pricing", "local"] as const).map((k) => (
            <div key={k} className="card p-5">
              <h3 className="font-semibold text-[var(--color-brand-600)]">
                {t(`home.trust_${k}` as "home.trust_verified")}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-ink-500)]">
                {t(`home.trust_${k}_body` as "home.trust_verified_body")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
