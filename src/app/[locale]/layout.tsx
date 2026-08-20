import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import {
  alternateLanguages,
  isLocale,
  localeMeta,
  prefixedLocales,
  type Locale,
} from "@/i18n/config";
import { LocalisedHeader } from "@/components/i18n/localised-header";
import { LocalisedFooter } from "@/components/i18n/localised-footer";
import { TranslationNotice } from "@/components/i18n/translation-notice";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";

/** Only the four prefixed locales exist. Anything else is a 404, not a fallback. */
export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dictionary = getDictionary(locale);
  return {
    title: dictionary.meta.homeTitle,
    description: dictionary.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: alternateLanguages(),
    },
    openGraph: {
      title: dictionary.meta.homeTitle,
      description: dictionary.meta.homeDescription,
      locale: localeMeta[locale].htmlLang.replace("-", "_"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const meta = localeMeta[locale as Locale];

  /*
   * `dir` and `lang` are set on a wrapper rather than on <html>.
   *
   * Only the root layout renders <html>, and making it locale-aware would mean reading
   * request headers there — which forces every page, including the statically generated
   * English marketing site, to render on demand. Trading the entire static build for
   * scrollbar placement is a bad deal. `dir` on a container is valid HTML and gives
   * correct text direction, mirroring and logical-property behaviour for everything
   * inside it.
   */
  return (
    <div dir={meta.dir} lang={meta.htmlLang} className="flex min-h-dvh flex-col">
      <TranslationNotice dictionary={dictionary} />
      <LocalisedHeader dictionary={dictionary} locale={locale} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <LocalisedFooter dictionary={dictionary} />
      <WhatsAppButton />
    </div>
  );
}
