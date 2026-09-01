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
        className="rounded-md border border-rule bg-surface p-6 text-sm text-ink-mute"
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
    <div className="overflow-hidden rounded-md border border-rule bg-surface shadow-sm">
      {/* Countdown */}
      <div className="relative overflow-hidden bg-brand-deep px-6 py-6 text-white">
        <PatternOverlay />
        <div className="relative flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">
              {next.tomorrow ? "Tomorrow's first jama'ah" : "Next jama'ah"}
            </p>
            <p
              className={`mt-1 font-display font-medium leading-none ${
                display ? "text-6xl" : "text-4xl"
              }`}
            >
              {PRAYER_LABELS[next.key]}{" "}
              <span className="tabular-nums text-white/70">{formatMinutes(next.at)}</span>
            </p>
          </div>

          <div className="ml-auto text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">Begins in</p>
            <p
              className={`mt-1 font-display font-medium tabular-nums leading-none ${
                display ? "text-6xl" : "text-4xl"
              }`}
              aria-live="off"
            >
              {remaining.h}
              <span className="text-white/45">:</span>
              {remaining.m}
              <span className="text-white/45">:</span>
              {remaining.s}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/15 pt-4 text-xs text-white/70">
          <span className="tabular-nums">{clock}</span>
          <span>{gregorianLabel}</span>
          <span className="text-white/90">{formatHijri(hijri)}</span>
        </div>
      </div>

      {/* Today's table */}
      <table className={`w-full ${display ? "text-lg" : "text-sm"}`}>
        <caption className="sr-only">Prayer beginning and congregation times for today</caption>
        <thead>
          <tr className="border-b border-rule-soft text-left text-[11px] uppercase tracking-[0.1em] text-ink-mute">
            <th scope="col" className="px-6 py-2.5 font-medium">Prayer</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Begins</th>
            <th scope="col" className="px-6 py-2.5 text-right font-medium">Jama&rsquo;ah</th>
          </tr>
        </thead>
        <tbody>
          {PRAYER_ORDER.map((key: PrayerKey) => {
            const isNext = key === next.key && !next.tomorrow;
            const isSunrise = key === "sunrise";
            return (
              <tr
                key={key}
                className={`border-b border-rule-soft last:border-0 transition-colors ${
                  isNext ? "bg-brand-wash" : ""
                }`}
              >
                <th
                  scope="row"
                  className={`px-6 ${display ? "py-4" : "py-3"} text-left font-medium ${
                    isSunrise ? "text-ink-mute" : "text-ink"
                  }`}
                >
                  {PRAYER_LABELS[key]}
                  {isNext && (
                    <span className="ml-2 rounded-sm bg-brand px-1.5 py-0.5 align-middle text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                      next
                    </span>
                  )}
                </th>
                <td className={`px-3 ${display ? "py-4" : "py-3"} text-right tabular-nums text-ink-soft`}>
                  {formatMinutes(times.begins[key])}
                </td>
                <td className={`px-6 ${display ? "py-4" : "py-3"} text-right font-semibold tabular-nums`}>
                  {isSunrise ? <span className="text-ink-mute">&mdash;</span> : formatMinutes(times.jamaah[key])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-rule-soft px-6 py-4 text-xs text-ink-mute">
        <span>
          <span className="font-medium text-ink-soft">Jumu&rsquo;ah:</span> {jumuahTimes}
        </span>
        <span>Recalculated live — never a stale PDF.</span>
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
