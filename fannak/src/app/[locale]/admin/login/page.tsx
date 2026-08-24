import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await isAdmin()) redirect(`/${locale}/admin`);

  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-1 text-xl font-bold">{t("admin.login_title")}</h1>
      <p className="mb-5 text-sm text-[var(--color-ink-500)]">
        {t("admin.login_hint")}
      </p>
      <AdminLoginForm locale={locale} />
    </div>
  );
}
