"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { KhatimPattern } from "./ui";

export interface HeroSlide {
  eyebrow: string;
  title: string;
  /** Rendered in the light brand blue, so one phrase carries the emphasis. */
  titleAccent?: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** A real photograph, once one exists. Falls back to generated artwork. */
  image?: string | null;
}

const DURATION = 6500;

export function HeroSlider({
  slides,
  aside,
}: {
  slides: HeroSlide[];
  /** Server-rendered panel for the right column (the prayer clock). */
  aside?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchX = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) setPaused(true);
  }, []);

  const go = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
      setProgress(0);
    },
    [slides.length],
  );

  /* Autoplay, driven by a progress tick so the indicator is honest. */
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const step = 100 / (DURATION / 50);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          setIndex((i) => (i + 1) % slides.length);
          return 0;
        }
        return p + step;
      });
    }, 50);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  /* Pause while the tab is hidden — no invisible slide changes. */
  useEffect(() => {
    const onVis = () => setPaused(document.hidden || reduced.current);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };

  const slide = slides[index];

  return (
    <section
      className="relative isolate overflow-hidden bg-navy-950 text-white"
      aria-roledescription="carousel"
      aria-label="Welcome"
      onKeyDown={onKey}
      onMouseEnter={() => !reduced.current && setPaused(true)}
      onMouseLeave={() => !reduced.current && setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Layered backdrop, one per slide, cross-fading. */}
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          {s.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(${118 + i * 22}deg, #062b55 0%, #123a6b 52%, #1591dc 140%)`,
              }}
            />
          )}
          <span className="absolute inset-0 text-white">
            <KhatimPattern id={`hero-${i}`} opacity={0.08} size={76} />
          </span>
        </div>
      ))}

      {/* Legibility scrim — always over the art, never over the copy. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,43,85,.94)_0%,rgba(6,43,85,.82)_42%,rgba(6,43,85,.34)_72%,rgba(6,43,85,.6)_100%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-12 px-6 pb-20 pt-28 sm:px-8 lg:grid-cols-[1.05fr_minmax(0,430px)] lg:px-10 lg:pb-24 lg:pt-32">
        <div className="flex flex-col justify-center">
          {/* One live region for the whole slider, so it announces once. */}
          <div aria-live="polite" aria-atomic="true">
            <p className="inline-flex items-center gap-2.5 rounded-chip border border-white/20 bg-white/10 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-300 backdrop-blur-sm">
              {slide.eyebrow}
            </p>

            <h1 className="mt-6 font-display text-[clamp(2.3rem,5.6vw,4.1rem)] font-extrabold leading-[1.03] text-white">
              {slide.title}
              {slide.titleAccent && (
                <>
                  <br />
                  <span className="text-blue-300">{slide.titleAccent}</span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-[52ch] text-[1.06rem] leading-[1.7] text-white/75">
              {slide.body}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={slide.primary.href}
              className="inline-flex items-center gap-2.5 rounded-chip bg-white px-7 py-3.5 font-bold text-navy-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {slide.primary.label}
            </Link>
            {slide.secondary && (
              <Link
                href={slide.secondary.href}
                className="inline-flex items-center gap-2.5 rounded-chip border border-white/30 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                {slide.secondary.label}
              </Link>
            )}
          </div>

          {/* Controls */}
          {slides.length > 1 && (
            <div className="mt-12 flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous slide"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                >
                  <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 8H4M7.5 3.7 3.2 8l4.3 4.3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next slide"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                >
                  <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h9M8.5 3.7 12.8 8l-4.3 4.3" />
                  </svg>
                </button>
              </div>

              {/* Indicators double as progress bars. */}
              <div className="flex flex-1 gap-2" role="tablist" aria-label="Choose slide">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={s.title}
                    onClick={() => go(i)}
                    className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-300 transition-[width]"
                      style={{
                        width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                        transitionDuration: i === index ? "50ms" : "400ms",
                      }}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
              >
                {paused ? (
                  <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-current"><path d="M4.5 3v10l8-5z" /></svg>
                ) : (
                  <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-current"><path d="M5 3h2.2v10H5zM8.8 3H11v10H8.8z" /></svg>
                )}
              </button>
            </div>
          )}
        </div>

        {aside && <div className="lg:pt-2">{aside}</div>}
      </div>
    </section>
  );
}
