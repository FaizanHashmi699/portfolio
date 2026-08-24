import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { RequestForm } from "@/components/request-form";
import { getDistricts, getProvider, getServices } from "@/lib/data";
import { loc, type Locale } from "@/lib/types";

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string; service?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;

  const [services, districts, provider] = await Promise.all([
    getServices(),
    getDistricts(),
    sp.provider ? getProvider(sp.provider) : undefined,
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("request.title")}</h1>
      <p className="mt-1 mb-6 text-[var(--color-ink-500)]">
        {t("request.subtitle")}
      </p>

      <RequestForm
        services={services.map((s) => ({
          slug: s.slug,
          label: loc(s as unknown as Record<string, unknown>, "name", activeLocale),
        }))}
        districts={districts.map((d) => ({
          slug: d.slug,
          label: loc(d as unknown as Record<string, unknown>, "name", activeLocale),
        }))}
        preferredProvider={provider?.slug}
        preferredProviderName={
          provider
            ? loc(
                provider as unknown as Record<string, unknown>,
                "name",
                activeLocale,
              )
            : undefined
        }
      />
    </div>
  );
}
