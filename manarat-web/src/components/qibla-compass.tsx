"use client";

import { useEffect, useState } from "react";
import { qiblaBearing, distanceToKaaba, compassPoint } from "@/lib/qibla";

interface Coords {
  latitude: number;
  longitude: number;
  label: string;
}

export function QiblaCompass({ fallback }: { fallback: Coords }) {
  const [coords, setCoords] = useState<Coords>(fallback);
  const [state, setState] = useState<"masjid" | "locating" | "you" | "denied">("masjid");
  const [heading, setHeading] = useState<number | null>(null);

  const bearing = qiblaBearing(coords.latitude, coords.longitude);
  const distance = distanceToKaaba(coords.latitude, coords.longitude);

  function locate() {
    if (!("geolocation" in navigator)) {
      setState("denied");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Your location",
        });
        setState("you");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Live compass heading, where the device exposes one.
  useEffect(() => {
    function onOrientation(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
      const h = e.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
      if (h !== null && Number.isFinite(h)) setHeading(h);
    }
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    return () =>
      window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
  }, []);

  // With a live heading the needle points at the Qibla relative to the phone;
  // without one it just shows the bearing from true north.
  const needle = heading === null ? bearing : bearing - heading;

  return (
    <div className="grid gap-10 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-center">
      <div className="relative mx-auto aspect-square w-full max-w-[260px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" role="img"
             aria-label={`Qibla is ${bearing.toFixed(1)} degrees, ${compassPoint(bearing)}, from ${coords.label}`}>
          <circle cx="100" cy="100" r="94" className="fill-surface stroke-rule" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" className="fill-none stroke-rule-soft" strokeWidth="1" />

          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * 5 * Math.PI) / 180;
            const major = i % 9 === 0;
            const r1 = major ? 76 : 84;
            return (
              <line
                key={i}
                x1={100 + Math.sin(a) * r1}
                y1={100 - Math.cos(a) * r1}
                x2={100 + Math.sin(a) * 90}
                y2={100 - Math.cos(a) * 90}
                className={major ? "stroke-ink-soft" : "stroke-rule"}
                strokeWidth={major ? 1.6 : 0.8}
              />
            );
          })}

          {[["N", 0], ["E", 90], ["S", 180], ["W", 270]].map(([label, deg]) => {
            const a = ((deg as number) * Math.PI) / 180;
            return (
              <text
                key={label as string}
                x={100 + Math.sin(a) * 64}
                y={100 - Math.cos(a) * 64 + 5}
                textAnchor="middle"
                className="fill-ink-mute text-[13px] font-semibold"
              >
                {label as string}
              </text>
            );
          })}

          <g style={{ transform: `rotate(${needle}deg)`, transformOrigin: "100px 100px", transition: "transform .35s ease-out" }}>
            <path d="M100 100 L96 156 L100 164 L104 156 Z" className="fill-rule" />
            <path d="M100 30 L108 96 L100 104 L92 96 Z" className="fill-brand" />
            {/* the Ka'bah, at the rim in the Qibla direction */}
            <g transform="translate(100 20)">
              <rect x="-9" y="-9" width="18" height="18" rx="2" className="fill-brand-deep" />
              <rect x="-9" y="-3.5" width="18" height="3" fill="#d6a24a" />
            </g>
          </g>

          <circle cx="100" cy="100" r="7" className="fill-surface stroke-ink-soft" strokeWidth="2" />
        </svg>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
            Qibla bearing
          </p>
          <p className="mt-2 font-display text-[clamp(2.4rem,6vw,3.4rem)] font-extrabold leading-none tabular-nums text-brand-deep">
            {bearing.toFixed(1)}&deg;
            <span className="ml-3 align-middle text-[0.4em] font-bold uppercase tracking-[0.14em] text-brand">
              {compassPoint(bearing)}
            </span>
          </p>
        </div>

        <dl className="grid gap-px overflow-hidden rounded-card border border-rule bg-rule">
          {[
            { k: "From", v: coords.label },
            {
              k: "Distance",
              v: `${Math.round(distance).toLocaleString("en-GB")} km to the Ka\u2019bah`,
            },
            {
              k: "Compass",
              v:
                heading === null
                  ? "Not available on this device"
                  : `Live \u2014 ${Math.round(heading)}\u00b0 heading`,
            },
          ].map((row) => (
            <div key={row.k} className="flex flex-wrap gap-x-4 gap-y-1 bg-surface px-5 py-3.5">
              <dt className="w-24 shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
                {row.k}
              </dt>
              <dd className="text-sm font-medium tabular-nums text-ink">{row.v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={locate}
            disabled={state === "locating"}
            className="inline-flex items-center justify-center gap-2.5 rounded-chip bg-brand px-6 py-3 text-[0.9rem] font-bold text-white shadow-brand transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-60"
          >
            {state === "locating" ? "Locating\u2026" : "Use my location"}
          </button>
          {state === "you" && (
            <button
              onClick={() => {
                setCoords(fallback);
                setState("masjid");
              }}
              className="inline-flex items-center justify-center gap-2.5 rounded-chip border border-rule bg-surface px-6 py-3 text-[0.9rem] font-bold text-navy-900 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            >
              Back to the masjid
            </button>
          )}
        </div>

        {state === "denied" && (
          <p className="rounded-card border border-rule bg-brand-wash px-4 py-3 text-sm leading-[1.7] text-brand-deep">
            Location is unavailable, so the bearing shown is from the masjid.
          </p>
        )}
        <p className="text-sm leading-[1.7] text-ink-soft">
          The bearing is the great-circle direction to the Ka&rsquo;bah, measured clockwise from
          true north. A phone compass reads magnetic north, so allow for local declination &mdash;
          about 1&deg; west in the Midlands.
        </p>
      </div>
    </div>
  );
}
