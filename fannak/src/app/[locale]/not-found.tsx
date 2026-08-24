import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{t("common.not_found")}</h1>
      <Link href="/" className="btn btn-primary mt-6">
        {t("nav.home")}
      </Link>
    </div>
  );
}
