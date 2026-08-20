import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

/**
 * Shown by the service worker when a navigation fails.
 *
 * Deliberately does not serve a cached copy of whatever was requested. Fees, thresholds
 * and entry rules change, and a stale page presented as current is worse than no page —
 * someone could act on a number that is no longer true.
 */
export default function OfflinePage() {
  return (
    <Section>
      <div className="mx-auto max-w-xl py-16 text-center">
        <WifiOff className="text-muted-foreground mx-auto size-12" aria-hidden="true" />
        <h1 className="text-h1 mt-6">You&apos;re offline.</h1>
        <p className="text-lead text-muted-foreground mt-4">
          We can&apos;t reach the site right now. Nothing you were doing has been lost.
        </p>
        <p className="text-muted-foreground mt-6 text-sm">
          We don&apos;t serve you a saved copy of the page you wanted, on purpose.
          Government fees and eligibility rules change, and showing you an old figure as
          though it were current could cost you real money.
        </p>
        <p className="text-muted-foreground mt-6 text-sm">
          Reconnect and reload, and everything will be where you left it.
        </p>
      </div>
    </Section>
  );
}
