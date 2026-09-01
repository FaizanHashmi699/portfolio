import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your donation to Manarat Foundation.",
  robots: { index: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
        <div className="rounded-md border border-rule bg-surface p-9 text-center">
          <span
            aria-hidden
            className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-wash text-brand"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5 9.5 18 20 7" />
            </svg>
          </span>

          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-brand-deep">
            Jazakum Allahu khayran
          </h1>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Your donation has been received. A receipt is on its way to the email address you gave.
          </p>

          {ref && (
            <p className="mt-6 inline-block rounded-sm bg-surface-2 px-4 py-2 font-mono text-sm text-ink">
              Reference <strong>{ref.slice(0, 32)}</strong>
            </p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-ink-mute">
            A donation shows as confirmed once the payment provider notifies us, which is usually
            immediate. If you added Gift Aid, we will claim the extra 25% from HMRC at no cost to
            you.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/appeal"
              className="rounded-full bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-mid"
            >
              See the appeal
            </Link>
            <Link
              href="/"
              className="rounded-full border border-rule px-6 py-3 font-bold text-brand-deep transition-colors hover:border-brand"
            >
              Back to the masjid
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
