import { moneyShort } from "@/lib/format";

export function CampaignProgress({
  raisedPence,
  targetPence,
  onNavy = false,
}: {
  raisedPence: number;
  targetPence: number;
  /** Recolours for the navy appeal band. */
  onNavy?: boolean;
}) {
  const pct = targetPence > 0 ? Math.min(100, (raisedPence / targetPence) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span
          className={`font-display text-[2.1rem] font-extrabold tabular-nums leading-none ${
            onNavy ? "text-white" : "text-brand-deep"
          }`}
        >
          {moneyShort(raisedPence)}
        </span>
        <span className={`text-sm ${onNavy ? "text-white/65" : "text-ink-soft"}`}>
          of {moneyShort(targetPence)}
        </span>
        <span
          className={`ml-auto text-sm font-bold tabular-nums ${
            onNavy ? "text-blue-300" : "text-ink-soft"
          }`}
        >
          {pct.toFixed(1)}%
        </span>
      </div>

      <div
        className={`h-2.5 w-full overflow-hidden rounded-chip ${
          onNavy ? "bg-white/15" : "bg-surface-2"
        }`}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${moneyShort(raisedPence)} raised of a ${moneyShort(targetPence)} target`}
      >
        <div
          className={`h-full rounded-chip transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
            onNavy ? "bg-blue-300" : "bg-brand"
          }`}
          style={{ width: `${Math.max(pct, pct > 0 ? 1.5 : 0)}%` }}
        />
      </div>

      {raisedPence === 0 && (
        <p className={`text-xs ${onNavy ? "text-white/55" : "text-ink-mute"}`}>
          The total updates automatically as donations are confirmed.
        </p>
      )}
    </div>
  );
}
