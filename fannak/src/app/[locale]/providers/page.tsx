import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProviderCard } from "@/components/provider-card";
import { getDistricts, getServices, searchProviders, usingSeedData } from "@/lib/data";
import { loc, type Locale } from "@/lib/types";

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; service?: string; district?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;

  const [services, districts, results] = await Promise.all([
    getServices(),
    getDistricts(),
    searchProviders({ q: sp.q, service: sp.service, district: sp.district }),
  ]);

  const hasFilters = Boolean(sp.q || sp.service || sp.district);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("directory.title")}</h1>
        <p className="mt-1 text-[var(--color-ink-500)]">
          {t("directory.subtitle")}
        </p>
      </header>

      {/* Filters are a plain GET form: every search is a shareable, indexable
          URL. That is what makes "AC repair in Al Olaya" a landing page. */}
      <form
        method="get"
        className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <label className="label" htmlFor="q">
            {t("directory.search_label")}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={sp.q ?? ""}
            className="field"
            placeholder={t("directory.search_placeholder")}
          />
        </div>

        <div>
          <label className="label" htmlFor="service">
            {t("directory.service_label")}
          </label>
          <select
            id="service"
            name="service"
            defaultValue={sp.service ?? ""}
            className="field"
          >
            <option value="">{t("directory.all_services")}</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {loc(s as unknown as Record<string, unknown>, "name", activeLocale)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="district">
            {t("directory.district_label")}
          </label>
          <select
            id="district"
            name="district"
            defaultValue={sp.district ?? ""}
            className="field"
          >
            <option value="">{t("directory.all_districts")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {loc(d as unknown as Record<string, unknown>, "name", activeLocale)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn btn-primary">
            {t("directory.apply")}
          </button>
          {hasFilters ? (
            <Link href="/providers" className="btn btn-ghost">
              {t("directory.reset")}
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mb-4 text-sm font-semibold text-[var(--color-ink-500)]">
        {t("directory.results", { count: results.length })}
      </p>

      {usingSeedData() ? (
        <p className="mb-4 rounded border border-[var(--color-sand-500)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-sand-600)]">
          {t("directory.demo_notice")}
        </p>
      ) : null}

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProviderCard key={p.id} provider={p} services={services} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-ink-500)]">{t("directory.empty")}</p>
          <Link href="/request" className="btn btn-primary mt-4">
            {t("directory.empty_cta")}
          </Link>
        </div>
      )}
    </div>
  );
}
