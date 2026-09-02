"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * One-open-at-a-time accordion.
 *
 * Built on buttons with aria-expanded rather than <details>, so the open panel
 * can animate its height and only one answer is ever open.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-rule overflow-hidden rounded-panel border border-rule bg-surface shadow-sm">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                className="flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-surface-2/60 sm:px-8 sm:py-6"
              >
                <span
                  className={`font-display text-[1.02rem] font-extrabold leading-snug tracking-tight transition-colors sm:text-[1.1rem] ${
                    isOpen ? "text-brand" : "text-brand-deep"
                  }`}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={`ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                    isOpen
                      ? "rotate-45 border-brand bg-brand text-white"
                      : "border-rule bg-surface text-brand-deep"
                  }`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.2]"
                    strokeLinecap="round"
                  >
                    <path d="M8 3.2v9.6M3.2 8h9.6" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              className={`grid transition-[grid-template-rows,opacity] duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[0.96rem] leading-[1.75] text-ink-soft sm:px-8 sm:pb-7 sm:pr-20">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
