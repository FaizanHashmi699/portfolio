import { Info } from "lucide-react";

/**
 * Shown on auth screens when no credential store is configured. Being explicit that no
 * password is checked is more useful than letting someone believe they created an account.
 */
export function DemoAuthNotice() {
  return (
    <div className="border-warning-500/40 bg-warning-50 text-warning-900 dark:bg-warning-900/25 dark:text-warning-50 mb-6 flex items-start gap-2.5 rounded-xl border p-4 text-sm">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong>Demo mode.</strong> No database is configured, so no credentials are
        checked and nothing is stored. Submit anything to continue into the seeded
        portal.
      </p>
    </div>
  );
}
