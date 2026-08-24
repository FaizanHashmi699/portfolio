import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { loc, type Locale, type Provider, type Service } from "@/lib/types";

export async function ProviderCard({
  provider,
  services,
}: {
  provider: Provider;
  services: Service[];
}) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;

  const offered = provider.service_slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s))
    .slice(0, 4);

  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold">
          <Link
            href={`/providers/${provider.slug}`}
            className="hover:text-[var(--color-brand-500)]"
          >
            {loc(provider as unknown as Record<string, unknown>, "name", locale)}
          </Link>
        </h3>
        {provider.rating ? (
          <span className="shrink-0 text-sm font-semibold text-[var(--color-ink-500)] tabular-nums">
            {provider.rating.toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
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
      </div>

      <ul className="flex flex-wrap gap-1.5 text-xs text-[var(--color-ink-500)]">
        {offered.map((s) => (
          <li
            key={s.slug}
            className="rounded bg-[var(--color-brand-50)] px-2 py-1 text-[var(--color-brand-600)]"
          >
            {loc(s as unknown as Record<string, unknown>, "name", locale)}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex gap-2 pt-1">
        <Link href={`/providers/${provider.slug}`} className="btn btn-ghost text-sm">
          {t("directory.view")}
        </Link>
        <Link
          href={`/request?provider=${provider.slug}`}
          className="btn btn-primary text-sm"
        >
          {t("directory.book")}
        </Link>
      </div>
    </article>
  );
}
