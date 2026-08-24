import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDistricts, getProvider, getServices } from "@/lib/data";
import { loc, type Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) return {};
  return { title: `${provider.name_ar} — ${provider.name_en}` };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const provider = await getProvider(slug);
  if (!provider) notFound();

  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;
  const [services, districts] = await Promise.all([getServices(), getDistricts()]);

  const offered = provider.service_slugs
    .map((s) => services.find((x) => x.slug === s))
    .filter(Boolean);
  const served = provider.district_slugs
    .map((d) => districts.find((x) => x.slug === d))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/providers"
        className="text-sm text-[var(--color-ink-500)] hover:text-[var(--color-brand-500)]"
      >
        ← {t("directory.title")}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {loc(provider as unknown as Record<string, unknown>, "name", activeLocale)}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={provider.cr_verified_at ? "pill pill-verified" : "pill"}
            >
              {provider.cr_verified_at
                ? t("directory.verified")
                : t("directory.unverified")}
            </span>
            <span className="pill">
              {t("directory.jobs", { count: provider.jobs_completed })}
            </span>
            {provider.rating ? (
              <span className="pill tabular-nums">
                {provider.rating.toFixed(1)} / 5
              </span>
            ) : null}
          </div>
        </div>
        <Link
          href={`/request?provider=${provider.slug}`}
          className="btn btn-primary"
        >
          {t("directory.book")}
        </Link>
      </header>

      {provider.is_demo ? (
        <p className="mt-5 rounded border border-[var(--color-sand-500)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-sand-600)]">
          {t("directory.demo_notice")}
        </p>
      ) : null}

      <p className="mt-5 text-[var(--color-ink-500)]">
        {loc(provider as unknown as Record<string, unknown>, "about", activeLocale)}
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">{t("directory.offers")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {offered.map((s) => (
            <div key={s!.slug} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">
                  {loc(s as unknown as Record<string, unknown>, "name", activeLocale)}
                </h3>
                {s!.is_recurring ? (
                  <span className="pill shrink-0">{t("service.recurring")}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[var(--color-ink-500)]">
                {loc(
                  s as unknown as Record<string, unknown>,
                  "description",
                  activeLocale,
                )}
              </p>
              {s!.typical_price_min ? (
                <p className="mt-2 text-sm font-semibold text-[var(--color-brand-600)] tabular-nums">
                  {s!.typical_price_min}–{s!.typical_price_max} {t("service.sar")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">{t("directory.serves")}</h2>
        <ul className="flex flex-wrap gap-2">
          {served.map((d) => (
            <li key={d!.slug} className="pill">
              {loc(d as unknown as Record<string, unknown>, "name", activeLocale)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
