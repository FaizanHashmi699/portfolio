import {
  PRAYER_ORDER,
  PRAYER_LABELS,
  calculateTimes,
  formatMinutes,
  localDateParts,
  nowMinutes,
  nextPrayer,
  type PrayerKey,
} from "@/lib/prayer-times";
import { toPrayerConfig } from "@/lib/settings";
import type { PrayerSettings } from "@/lib/types";

export function PrayerTimesCard({
  settings,
  compact = false,
}: {
  settings: PrayerSettings;
  compact?: boolean;
}) {
  const config = toPrayerConfig(settings);
  const today = localDateParts(settings.timezone);
  const times = calculateTimes(today, config);
  const current = nowMinutes(settings.timezone);
  const next = nextPrayer(times, current);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: settings.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="overflow-hidden rounded-sm border border-rule bg-surface">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule-soft bg-brand-wash px-5 py-4">
        <p className="font-display text-lg font-medium text-brand-deep">Today&rsquo;s prayers</p>
        <p className="text-xs uppercase tracking-[0.12em] text-ink-mute">{dateLabel}</p>
        <p className="ml-auto text-sm text-ink-soft">
          Next: <span className="font-semibold text-brand-deep">{PRAYER_LABELS[next.key]}</span>{" "}
          <span className="tabular-nums font-semibold text-brand-deep">
            {formatMinutes(next.at)}
          </span>
          {next.tomorrow && <span className="text-ink-mute"> (tomorrow)</span>}
        </p>
      </div>

      <table className="w-full text-sm">
        <caption className="sr-only">
          Prayer beginning and congregation times for {dateLabel}
        </caption>
        <thead>
          <tr className="border-b border-rule-soft text-left text-[11px] uppercase tracking-[0.1em] text-ink-mute">
            <th scope="col" className="px-5 py-2 font-medium">
              Prayer
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Begins
            </th>
            <th scope="col" className="px-5 py-2 text-right font-medium">
              Jama&rsquo;ah
            </th>
          </tr>
        </thead>
        <tbody>
          {PRAYER_ORDER.map((key: PrayerKey) => {
            const isNext = key === next.key && !next.tomorrow;
            const isSunrise = key === "sunrise";
            return (
              <tr
                key={key}
                className={`border-b border-rule-soft last:border-0 ${
                  isNext ? "bg-brand-wash/60" : ""
                }`}
              >
                <th
                  scope="row"
                  className={`px-5 py-2.5 text-left font-medium ${
                    isSunrise ? "text-ink-mute" : "text-ink"
                  }`}
                >
                  {PRAYER_LABELS[key]}
                  {isNext && (
                    <span className="ml-2 rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                      next
                    </span>
                  )}
                </th>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                  {formatMinutes(times.begins[key])}
                </td>
                <td className="px-5 py-2.5 text-right font-semibold tabular-nums">
                  {isSunrise ? (
                    <span className="text-ink-mute">&mdash;</span>
                  ) : (
                    formatMinutes(times.jamaah[key])
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!compact && (
        <div className="space-y-1 border-t border-rule-soft px-5 py-4 text-xs text-ink-mute">
          <p>
            <span className="font-medium text-ink-soft">Jumu&rsquo;ah:</span>{" "}
            {settings.jumuah_times}
          </p>
          <p>
            Calculated for {settings.latitude.toFixed(4)}, {settings.longitude.toFixed(4)} and
            updated automatically every day.
          </p>
        </div>
      )}
    </div>
  );
}
