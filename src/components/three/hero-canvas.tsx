"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Gate around the 3D hero.
 *
 * The scene is deliberately never part of first paint. The static gradient beneath it is
 * what the crawler, the slow connection and the reduced-motion user actually get, and it
 * is a finished design in its own right rather than a placeholder. The canvas fades in on
 * top only once three conditions hold: the user has not asked for reduced motion, the
 * device looks capable of rendering it, and the browser is idle.
 */

const DuneField = dynamic(() => import("./dune-field"), { ssr: false });

function deviceLooksCapable(): boolean {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return false;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return false;

  // Respect data-saver mode: someone metering their bytes did not ask for a shader.
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return false;

  return true;
}

export function HeroCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches || !deviceLooksCapable()) return;

    const useIdle = typeof window.requestIdleCallback === "function";
    const handle = useIdle
      ? window.requestIdleCallback(() => setEnabled(true))
      : window.setTimeout(() => setEnabled(true), 300);

    const onPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) setEnabled(false);
    };
    motionQuery.addEventListener("change", onPreferenceChange);

    return () => {
      if (useIdle) window.cancelIdleCallback(handle as number);
      else window.clearTimeout(handle as number);
      motionQuery.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 motion-safe:animate-[fadeIn_1.2s_ease-out_forwards] opacity-0"
      style={{ animationFillMode: "forwards" }}
      data-testid="hero-canvas"
    >
      <DuneField />
    </div>
  );
}
