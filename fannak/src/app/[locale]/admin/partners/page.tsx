import { redirect } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { isAdmin, partnerToken } from "@/lib/auth";
import { listPartners } from "@/lib/store";
import { getDistricts, getServices } from "@/lib/data";
import { loc, type Locale } from "@/lib/types";
import { CreatePartnerForm } from "@/components/create-partner-form";
import { CreditsForm } from "@/components/credits-form";

export default async function AdminPartners({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);

  const t = await getTranslations();
  const activeLocale = (await getLocale()) as Locale;
  const [partners, services, districts] = await Promise.all([
    listPartners(),
    getServices(),
    getDistricts(),
  ]);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">{t("admin.nav_partners")}</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">{t("admin.add_partner")}</h2>
        <CreatePartnerForm
          services={services.map((s) => ({
            slug: s.slug,
            label: loc(s as unknown as Record<string, unknown>, "name", activeLocale),
          }))}
          districts={districts.map((d) => ({
            slug: d.slug,
            label: loc(d as unknown as Record<string, unknown>, "name", activeLocale),
          }))}
        />
      </section>

      <h2 className="mb-3 text-lg font-bold">{t("admin.partner_list")}</h2>
      <div className="grid gap-3">
        {partners.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">
                  {loc(p as unknown as Record<string, unknown>, "name", activeLocale)}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={p.cr_verified_at ? "pill pill-verified" : "pill"}>
                    {p.cr_verified_at
                      ? t("directory.verified")
                      : t("directory.unverified")}
                  </span>
                  <span className="pill tabular-nums">
                    {t("admin.balance")}: {p.credit_balance}
                  </span>
                </div>
              </div>
              <CreditsForm tenantId={p.id} />
            </div>

            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-[var(--color-ink-500)]">
                {t("admin.portal_link")}
              </summary>
              <p className="mt-2 break-all rounded bg-[var(--color-canvas)] p-2 font-mono text-xs" dir="ltr">
                {base}/{locale}/partner/enter?token={partnerToken(p.id)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-500)]">
                {t("admin.portal_link_hint")}
              </p>
            </details>
          </div>
        ))}
      </div>
    </>
  );
}
