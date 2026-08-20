import Link from "next/link";
import { Languages } from "lucide-react";
import type { Dictionary } from "@/i18n";

/**
 * Shown on every machine-assisted page.
 *
 * Saying so plainly costs a little polish and buys the thing that matters more: nobody
 * acts on a mistranslated eligibility criterion believing a person checked it.
 */
export function TranslationNotice({ dictionary }: { dictionary: Dictionary }) {
  return (
    <div className="border-border bg-surface border-b">
      <div className="container-page flex items-start gap-3 py-3 text-sm">
        <Languages className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            {dictionary.translation.noticeTitle}.
          </strong>{" "}
          {dictionary.translation.noticeBody}{" "}
          <Link href="/" className="text-primary underline underline-offset-4">
            {dictionary.translation.viewInEnglish}
          </Link>
        </p>
      </div>
    </div>
  );
}
