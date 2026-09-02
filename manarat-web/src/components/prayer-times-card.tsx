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
    <div className="overflow-hidden rounded-card border border-rule bg-surface shadow-sm">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-b border-rule bg-brand-wash px-6 py-5">
        <p className="font-display text-[1.1rem] font-extrabold tracking-tight text-brand-deep">
          Today&rsquo;s prayers
        </p>
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
          {dateLabel}
        </p>
        <p className="ml-auto text-sm text-ink-soft">
          Next: <span className="font-bold text-brand-deep">{PRAYER_LABELS[next.key]}</span>{" "}
          <span className="font-bold tabular-nums text-brand-deep">
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
          <tr className="border-b border-rule bg-surface-2/60 text-left text-[0.62rem] uppercase tracking-[0.14em] text-ink-mute">
            <th scope="col" className="px-6 py-3 font-bold">
              Prayer
            </th>
            <th scope="col" className="px-3 py-3 text-right font-bold">
              Begins
            </th>
            <th scope="col" className="px-6 py-3 text-right font-bold">
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
                className={`border-b border-rule-soft transition-colors last:border-0 ${
                  isNext ? "bg-brand-wash" : "hover:bg-surface-2/50"
                }`}
              >
                <th
                  scope="row"
                  className={`relative px-6 py-3 text-left font-bold ${
                    isSunrise ? "text-ink-mute" : "text-brand-deep"
                  }`}
                >
                  {isNext && (
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand" />
                  )}
                  {PRAYER_LABELS[key]}
                  {isNext && (
                    <span className="ml-2.5 rounded-chip bg-brand px-2 py-0.5 align-middle text-[0.58rem] font-bold uppercase tracking-[0.12em] text-white">
                      Next
                    </span>
                  )}
                </th>
                <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                  {formatMinutes(times.begins[key])}
                </td>
                <td className="px-6 py-3 text-right font-bold tabular-nums text-ink">
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
        <div className="space-y-1.5 border-t border-rule bg-surface-2/50 px-6 py-4 text-xs leading-[1.6] text-ink-mute">
          <p>
            <span className="font-bold text-brand-deep">Jumu&rsquo;ah:</span>{" "}
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
