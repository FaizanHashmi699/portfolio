"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programmes", label: "Academy" },
  { href: "/calendar", label: "Calendar" },
  { href: "/appeal", label: "Appeal" },
  { href: "/contact", label: "Contact" },
];

/** Pages that render the navbar as glass over a dark hero. */
const OVERLAY_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const overlay = OVERLAY_ROUTES.has(pathname);

  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href)),
    [pathname],
  );

  /* ---------------- smart scroll ---------------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = window.scrollY;
    let ticking = false;

    const run = () => {
      const y = window.scrollY;
      setStuck(y > 8);
      if (!open && !reduced.matches && Math.abs(y - last) > 6) {
        setHidden(y > last && y > 140);
        last = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(run);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    run();
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  /* ---------------- sliding pill ---------------- */
  const measure = useCallback((el?: HTMLElement | null) => {
    const list = listRef.current;
    if (!list) return;
    const target = el ?? list.querySelector<HTMLElement>("[data-active='true']");
    if (!target) {
      setPill(null);
      return;
    }
    const lb = list.getBoundingClientRect();
    const tb = target.getBoundingClientRect();
    setPill({ x: tb.left - lb.left, w: tb.width });
  }, []);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    if (document.fonts?.ready) void document.fonts.ready.then(() => measure());
    window.addEventListener("resize", () => measure());
    return () => ro.disconnect();
  }, [measure, pathname]);

  /* ---------------- drawer ---------------- */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const glass = overlay && !stuck;

  return (
    <>
      <header
        className={[
          "z-50 transition-[transform,background-color,box-shadow,border-color] duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform",
          overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
          stuck
            ? "border-b border-rule bg-surface/85 shadow-[0_1px_2px_rgba(11,42,85,.06),0_12px_32px_-14px_rgba(11,42,85,.28)] backdrop-blur-xl backdrop-saturate-150"
            : overlay
              ? "border-b border-transparent bg-transparent"
              : "border-b border-rule bg-surface",
          hidden ? "-translate-y-full" : "translate-y-0",
          "motion-reduce:!translate-y-0 motion-reduce:transition-none",
        ].join(" ")}
      >
        <div className="mx-auto flex min-h-[78px] max-w-[1280px] items-center gap-3 px-4 sm:gap-6 sm:px-8">
          {/* Brand */}
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span
              aria-hidden
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-brand to-brand-deep shadow-[0_6px_18px_-8px_rgba(21,145,220,.9)] transition-transform duration-[400ms] group-hover:-rotate-6 group-hover:scale-105 sm:h-[42px] sm:w-[42px] sm:rounded-[13px]"
            >
              <svg viewBox="0 0 32 32" className="h-[22px] w-[22px] fill-white sm:h-[25px] sm:w-[25px]">
                <path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
                <circle cx="16" cy="16" r="2.6" className="fill-brand-deep" />
              </svg>
            </span>
            <span className="flex min-w-0 flex-col leading-[1.12]">
              <span className="flex items-baseline gap-2">
                <span
                  className={`truncate text-[.95rem] font-extrabold tracking-[-.015em] sm:text-[1.06rem] ${
                    glass ? "text-white" : "text-brand-deep"
                  }`}
                >
                  Manarat Foundation
                </span>
                <span
                  aria-hidden
                  className={`hidden font-arabic text-[1.1rem] leading-none min-[400px]:inline ${
                    glass ? "text-[#8fd0f7]" : "text-brand"
                  }`}
                >
                  منارة
                </span>
              </span>
              <span
                className={`hidden text-[.6rem] font-semibold uppercase tracking-[.15em] min-[560px]:block ${
                  glass ? "text-white/70" : "text-ink-mute"
                }`}
              >
                Masjid · Islamic Centre · Academy
              </span>
            </span>
          </Link>

          {/* Primary nav */}
          <nav
            aria-label="Primary"
            className={`relative mx-auto hidden rounded-full border p-[5px] lg:block ${
              glass ? "border-white/20 bg-white/10 backdrop-blur-md" : "border-rule bg-surface-2"
            }`}
          >
            {pill && (
              <span
                aria-hidden
                className="absolute top-[5px] h-[calc(100%-10px)] rounded-full bg-surface shadow-[0_1px_2px_rgba(11,42,85,.1),0_6px_16px_-10px_rgba(11,42,85,.5)] transition-[transform,width] duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
              />
            )}
            <ul
              ref={listRef}
              className="relative z-10 flex items-center gap-0.5"
              onPointerLeave={() => measure()}
              onBlur={() => measure()}
            >
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={(e) => measure(e.currentTarget)}
                      onFocus={(e) => measure(e.currentTarget)}
                      className={`block whitespace-nowrap rounded-full px-[18px] py-[9px] text-[.9rem] transition-colors ${
                        active
                          ? "font-bold text-brand-deep"
                          : glass
                            ? "font-medium text-white/80 hover:text-white"
                            : "font-medium text-ink-soft hover:text-brand-deep"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <Link
              href="/prayer-times"
              className={`hidden items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[.85rem] font-semibold transition-colors min-[1180px]:inline-flex ${
                glass
                  ? "text-white/85 hover:bg-white/15 hover:text-white"
                  : "text-ink-soft hover:bg-surface-2 hover:text-brand-deep"
              }`}
            >
              <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-[1.6]" strokeLinecap="round">
                <circle cx="10" cy="10" r="7.4" />
                <path d="M10 5.6V10l3 1.8" />
              </svg>
              Prayer Times
            </Link>

            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-[.85rem] font-bold text-white shadow-[0_6px_18px_-8px_rgba(21,145,220,.9)] transition-all hover:-translate-y-px hover:bg-brand-mid sm:gap-2.5 sm:py-[11px] sm:pl-[22px] sm:pr-3 sm:text-[.9rem]"
            >
              Donate
              <span
                aria-hidden
                className="hidden h-[26px] w-[26px] place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1 sm:grid"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.9]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8" />
                </svg>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="manarat-drawer"
              className={`grid h-[42px] w-[42px] place-items-center rounded-xl border transition-colors lg:hidden ${
                glass ? "border-white/25 bg-white/15" : "border-rule bg-surface"
              }`}
            >
              <span className="flex flex-col gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`block h-0.5 w-[18px] rounded-sm ${glass ? "bg-white" : "bg-brand-deep"}`} />
                ))}
              </span>
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" id="manarat-drawer">
          <button
            className="absolute inset-0 bg-brand-deep/55"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col overflow-y-auto bg-surface p-5 shadow-[-20px_0_60px_-30px_rgba(6,43,85,.6)]"
          >
            <div className="mb-2 flex items-center border-b border-rule pb-4">
              <span className="font-extrabold text-brand-deep">Manarat Foundation</span>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto grid h-9 w-9 place-items-center rounded-[10px] border border-rule"
              >
                <svg viewBox="0 0 20 20" aria-hidden className="h-[18px] w-[18px] fill-none stroke-brand-deep stroke-[1.7]" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5 5 15" />
                </svg>
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav aria-label="Mobile">
              <ul className="py-2">
                {NAV.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-[10px] px-3 py-3.5 font-semibold transition-colors ${
                          active
                            ? "bg-surface-2 text-brand shadow-[inset_3px_0_0_var(--color-brand)]"
                            : "text-brand-deep hover:bg-surface-2"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto grid gap-2.5 border-t border-rule pt-5">
              <Link
                href="/prayer-times"
                className="rounded-full border border-rule px-6 py-3.5 text-center font-bold text-brand-deep"
              >
                Prayer Times
              </Link>
              <Link
                href="/donate"
                className="rounded-full bg-brand px-6 py-3.5 text-center font-bold text-white"
              >
                Donate
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
