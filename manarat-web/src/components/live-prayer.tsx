"use client";

import { useEffect, useState } from "react";
import {
  PRAYER_ORDER,
  PRAYER_LABELS,
  calculateTimes,
  formatMinutes,
  localDateParts,
  nextPrayer,
  type DayTimes,
  type PrayerConfig,
  type PrayerKey,
} from "@/lib/prayer-times";
import { gregorianToHijri, formatHijri } from "@/lib/hijri";

/** Seconds past local midnight, in the masjid's timezone. */
function nowSeconds(timeZone: string): number {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return (get("hour") % 24) * 3600 + get("minute") * 60 + get("second");
}

function countdown(seconds: number): { h: string; m: string; s: string } {
  const s = Math.max(0, Math.floor(seconds));
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

export interface LivePrayerProps {
  config: PrayerConfig;
  jumuahTimes: string;
  /** Large type and higher contrast, for a screen in the foyer. */
  display?: boolean;
}

export function LivePrayerClock({ config, jumuahTimes, display = false }: LivePrayerProps) {
  // Render nothing time-dependent until mounted, so server and client agree.
  const [tick, setTick] = useState<number | null>(null);
  const [times, setTimes] = useState<DayTimes | null>(null);
  const [dayKey, setDayKey] = useState("");

  useEffect(() => {
    const update = () => {
      const today = localDateParts(config.timezone);
      const key = `${today.year}-${today.month}-${today.day}`;
      setDayKey((prev) => {
        if (prev !== key) setTimes(calculateTimes(today, config));
        return key;
      });
      setTick(nowSeconds(config.timezone));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
    // config is a stable server-derived object for the life of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.timezone, config.latitude, config.longitude, config.method, config.asrMethod]);

  if (tick === null || !times) {
    return (
      <div
        className="rounded-panel border border-rule bg-surface p-8 text-sm text-ink-mute shadow-sm"
        aria-live="polite"
      >
        Loading today&rsquo;s times…
      </div>
    );
  }

  const minutes = tick / 60;
  const next = nextPrayer(times, minutes);
  const targetSeconds = next.tomorrow ? next.at * 60 + 86400 : next.at * 60;
  const remaining = countdown(targetSeconds - tick);

  const [y, m, d] = dayKey.split("-").map(Number);
  const hijri = gregorianToHijri(y, m, d);

  const gregorianLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  return (
    <div className="overflow-hidden rounded-panel border border-rule bg-surface shadow-md">
      {/* Countdown */}
      <div className="relative overflow-hidden bg-navy-950 px-6 py-7 text-white sm:px-8">
        <PatternOverlay />
        <span
          aria-hidden
          className="absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(21,145,220,.34), transparent 68%)" }}
        />
        <div className="relative flex flex-wrap items-end gap-x-8 gap-y-5">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-300">
              {next.tomorrow ? "Tomorrow's first jama'ah" : "Next jama'ah"}
            </p>
            <p
              className={`mt-2 font-display font-extrabold leading-none tracking-tight ${
                display ? "text-[clamp(2.6rem,6vw,4.2rem)]" : "text-[clamp(1.8rem,4vw,2.6rem)]"
              }`}
            >
              {PRAYER_LABELS[next.key]}{" "}
              <span className="tabular-nums text-blue-300">{formatMinutes(next.at)}</span>
            </p>
          </div>

          <div className="ml-auto text-right">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-300">
              Begins in
            </p>
            <p
              className={`mt-2 font-display font-extrabold tabular-nums leading-none tracking-tight ${
                display ? "text-[clamp(2.6rem,6vw,4.2rem)]" : "text-[clamp(1.8rem,4vw,2.6rem)]"
              }`}
              aria-live="off"
            >
              {remaining.h}
              <span className="text-white/35">:</span>
              {remaining.m}
              <span className="text-white/35">:</span>
              {remaining.s}
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/12 pt-5 text-xs">
          <span className="rounded-chip bg-white/10 px-3 py-1 font-bold tabular-nums text-white">
            {clock}
          </span>
          <span className="text-white/60">{gregorianLabel}</span>
          <span aria-hidden className="text-white/25">&middot;</span>
          <span className="font-medium text-blue-300">{formatHijri(hijri)}</span>
        </div>
      </div>

      {/* Today's table */}
      <table className={`w-full ${display ? "text-lg" : "text-[0.95rem]"}`}>
        <caption className="sr-only">Prayer beginning and congregation times for today</caption>
        <thead>
          <tr className="border-b border-rule bg-surface-2/60 text-left text-[0.66rem] uppercase tracking-[0.14em] text-ink-mute">
            <th scope="col" className="px-6 py-3 font-bold sm:px-8">Prayer</th>
            <th scope="col" className="px-3 py-3 text-right font-bold">Begins</th>
            <th scope="col" className="px-6 py-3 text-right font-bold sm:px-8">Jama&rsquo;ah</th>
          </tr>
        </thead>
        <tbody>
          {PRAYER_ORDER.map((key: PrayerKey) => {
            const isNext = key === next.key && !next.tomorrow;
            const isSunrise = key === "sunrise";
            return (
              <tr
                key={key}
                className={`relative border-b border-rule-soft transition-colors last:border-0 ${
                  isNext ? "bg-brand-wash" : "hover:bg-surface-2/50"
                }`}
              >
                <th
                  scope="row"
                  className={`relative px-6 text-left font-bold sm:px-8 ${
                    display ? "py-4" : "py-3.5"
                  } ${isSunrise ? "text-ink-mute" : "text-brand-deep"}`}
                >
                  {isNext && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-brand"
                    />
                  )}
                  {PRAYER_LABELS[key]}
                  {isNext && (
                    <span className="ml-2.5 rounded-chip bg-brand px-2 py-0.5 align-middle text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">
                      Next
                    </span>
                  )}
                </th>
                <td
                  className={`px-3 text-right tabular-nums text-ink-soft ${
                    display ? "py-4" : "py-3.5"
                  }`}
                >
                  {formatMinutes(times.begins[key])}
                </td>
                <td
                  className={`px-6 text-right font-bold tabular-nums text-ink sm:px-8 ${
                    display ? "py-4" : "py-3.5"
                  }`}
                >
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

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule bg-surface-2/50 px-6 py-4 text-xs text-ink-mute sm:px-8">
        <span>
          <span className="font-bold text-brand-deep">Jumu&rsquo;ah:</span> {jumuahTimes}
        </span>
        <span aria-hidden className="text-rule">&middot;</span>
        <span>Recalculated live &mdash; never a stale PDF.</span>
      </div>
    </div>
  );
}

/** A faint eight-fold tile, drawn rather than fetched. */
export function PatternOverlay({ opacity = 0.09 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    >
      <defs>
        <pattern id="khatim" width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M28 4 34 22 52 28 34 34 28 52 22 34 4 28 22 22Z" />
            <rect x="14" y="14" width="28" height="28" transform="rotate(45 28 28)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatim)" />
    </svg>
  );
}
