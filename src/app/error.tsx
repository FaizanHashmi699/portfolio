"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

/**
 * Route-level error boundary.
 *
 * Shows the digest rather than the message. Next.js replaces server error messages with a
 * digest in production precisely so internals do not leak, and echoing a raw client-side
 * message would defeat that. The digest is what support needs anyway.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="text-warning-600 size-12" aria-hidden="true" />
      <h1 className="text-h1 mt-6">Something went wrong.</h1>
      <p className="text-lead text-muted-foreground mt-4 max-w-lg">
        This is on us, not on you. Nothing you had entered has been submitted.
      </p>

      {error.digest && (
        <p className="text-muted-foreground mt-4 font-mono text-xs">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/contact"
          className="border-border hover:bg-surface rounded-full border px-6 py-2.5 text-sm font-medium"
        >
          Tell us what happened
        </Link>
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        If it keeps happening, email{" "}
        <a
          href={`mailto:${brand.email.support}`}
          className="underline underline-offset-4"
        >
          {brand.email.support}
        </a>{" "}
        with the reference above.
      </p>
    </div>
  );
}
