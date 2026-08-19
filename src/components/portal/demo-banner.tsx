import { Info } from "lucide-react";

/**
 * Demo mode must be unmistakable. Seeded data that looks like production data is how
 * someone ends up making a decision about a real customer from a fixture.
 */
export function DemoBanner() {
  return (
    <div className="border-warning-500/40 bg-warning-50 text-warning-900 dark:bg-warning-900/25 dark:text-warning-50 border-b px-4 py-2.5 text-center text-sm">
      <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
        <Info className="size-4 shrink-0" />
        <strong>Demo mode.</strong>
        <span>
          No database is configured, so this is seeded example data. Add your Supabase
          credentials to <code className="font-mono">.env.local</code> to switch to real
          storage — see <code className="font-mono">.env.example</code>.
        </span>
      </p>
    </div>
  );
}
