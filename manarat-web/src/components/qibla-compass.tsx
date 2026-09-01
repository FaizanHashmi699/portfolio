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
    <div className="grid gap-8 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center">
      <div className="relative mx-auto aspect-square w-full max-w-[240px]">
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

      <div className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">Qibla bearing</p>
          <p className="font-display text-4xl font-medium tabular-nums text-brand-deep">
            {bearing.toFixed(1)}°{" "}
            <span className="text-2xl text-ink-soft">{compassPoint(bearing)}</span>
          </p>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">From</dt>
            <dd>{coords.label}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">Distance</dt>
            <dd className="tabular-nums">{Math.round(distance).toLocaleString("en-GB")} km to the Ka&rsquo;bah</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-mute">Compass</dt>
            <dd>{heading === null ? "Not available on this device" : `Live — ${Math.round(heading)}° heading`}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={locate}
            disabled={state === "locating"}
            className="rounded-sm bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            {state === "locating" ? "Locating…" : "Use my location"}
          </button>
          {state === "you" && (
            <button
              onClick={() => {
                setCoords(fallback);
                setState("masjid");
              }}
              className="rounded-sm border border-rule px-4 py-2 text-sm transition-colors hover:border-brand"
            >
              Back to the masjid
            </button>
          )}
        </div>

        {state === "denied" && (
          <p className="rounded-sm bg-accent-wash px-3 py-2 text-sm text-accent">
            Location is unavailable, so the bearing shown is from the masjid.
          </p>
        )}
        <p className="text-xs leading-relaxed text-ink-mute">
          The bearing is the great-circle direction to the Ka&rsquo;bah, measured clockwise from
          true north. A phone compass reads magnetic north, so allow for local declination — about
          1° west in the Midlands.
        </p>
      </div>
    </div>
  );
}
