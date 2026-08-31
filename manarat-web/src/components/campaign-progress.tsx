import { moneyShort } from "@/lib/format";

export function CampaignProgress({
  raisedPence,
  targetPence,
}: {
  raisedPence: number;
  targetPence: number;
}) {
  const pct = targetPence > 0 ? Math.min(100, (raisedPence / targetPence) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-display text-3xl font-medium tabular-nums text-brand-deep">
          {moneyShort(raisedPence)}
        </span>
        <span className="text-sm text-ink-soft">
          raised of {moneyShort(targetPence)} target
        </span>
        <span className="ml-auto text-sm font-semibold tabular-nums text-ink-soft">
          {pct.toFixed(1)}%
        </span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-sm bg-surface-2"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${moneyShort(raisedPence)} raised of a ${moneyShort(targetPence)} target`}
      >
        <div
          className="h-full rounded-r-sm bg-brand transition-[width] duration-500"
          style={{ width: `${Math.max(pct, pct > 0 ? 1.5 : 0)}%` }}
        />
      </div>

      {raisedPence === 0 && (
        <p className="text-xs text-ink-mute">
          The total updates automatically as donations are confirmed.
        </p>
      )}
    </div>
  );
}
