"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/types";

const INTERVAL = 7000;

/**
 * A quote carousel. Renders only what the masjid has actually entered in the
 * admin — the homepage omits the whole section when the list is empty, so no
 * placeholder or invented praise is ever shown.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % items.length) + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, items.length]);

  // Pause while the tab is hidden so a backgrounded page isn't cycling.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = region.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [index, go]);

  if (items.length === 0) return null;

  return (
    <div
      ref={region}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="What people say about Manarat"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative rounded-panel border border-white/15 bg-white/[0.07] p-8 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 sm:p-12"
    >
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        className="h-9 w-9 fill-blue-300/45"
      >
        <path d="M13 6c-4.4 1.9-7 5.6-7 10.6V26h9.4v-9.4h-4.6c0-3 1.4-5 4.6-6.4Zm14 0c-4.4 1.9-7 5.6-7 10.6V26h9.4v-9.4h-4.6c0-3 1.4-5 4.6-6.4Z" />
      </svg>

      <div className="relative mt-6 min-h-[9.5rem]">
        {items.map((t, i) => (
          <blockquote
            key={t.id}
            aria-hidden={i !== index}
            className={`transition-opacity duration-[600ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
              i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <p className="font-display text-[clamp(1.15rem,2.4vw,1.55rem)] font-bold leading-[1.55] tracking-tight text-white">
              {t.quote}
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-blue-300" />
              <cite className="not-italic">
                <span className="block text-[0.95rem] font-bold text-white">{t.author_name}</span>
                {t.author_role && (
                  <span className="block text-sm text-white/55">{t.author_role}</span>
                )}
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-8 flex items-center gap-3 border-t border-white/12 pt-6">
          <div className="flex gap-2">
            {items.map((t, i) => (
              <button
                key={t.id}
                onClick={() => go(i)}
                aria-label={`Show quote ${i + 1} of ${items.length}`}
                aria-current={i === index}
                className={`h-1.5 rounded-chip transition-all duration-500 ${
                  i === index ? "w-8 bg-blue-300" : "w-4 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            {[
              { label: "Previous quote", to: index - 1, d: "M10 3.5 5 8l5 4.5" },
              { label: "Next quote", to: index + 1, d: "M6 3.5 11 8l-5 4.5" },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => go(b.to)}
                aria-label={b.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden
                  className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={b.d} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
