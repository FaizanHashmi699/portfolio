import Link from "next/link";
import { GIVING_OPTIONS, donateHref } from "@/lib/giving";
import { Card, ArrowIcon } from "@/components/ui";
import { Reveal } from "@/components/motion";

/**
 * The main conversion block: four giving categories, each with amount chips
 * that jump straight into a prefilled donate form.
 */
export function WaysToGive() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {GIVING_OPTIONS.map((o, i) => (
        <Reveal key={o.slug} delay={i * 70}>
          <Card interactive className="group flex h-full flex-col p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-brand-wash text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-none stroke-current stroke-[1.6]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={o.d} />
                </svg>
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[1.3rem] font-extrabold tracking-tight text-brand-deep">
                  {o.label}
                </h3>
                <p aria-hidden className="mt-0.5 font-arabic text-[1.15rem] leading-none text-brand">
                  {o.arabic}
                </p>
              </div>
              {o.monthly && (
                <span className="ml-auto shrink-0 rounded-chip border border-brand bg-brand-wash px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand-deep">
                  Monthly
                </span>
              )}
            </div>

            <p className="mt-5 text-[0.95rem] leading-[1.75] text-ink-soft">{o.blurb}</p>

            <div className="mt-auto pt-7">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                Give {o.monthly ? "monthly" : "now"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.amounts.map((a) => (
                  <Link
                    key={a}
                    href={donateHref(o, a)}
                    className="rounded-chip border border-rule bg-surface px-4 py-2 text-sm font-bold tabular-nums text-brand-deep transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                  >
                    £{a}
                    {o.monthly && <span className="font-medium">/mo</span>}
                  </Link>
                ))}
                <Link
                  href={donateHref(o)}
                  className="inline-flex items-center gap-2 rounded-chip px-4 py-2 text-sm font-bold text-brand transition-colors hover:text-brand-deep"
                >
                  Other <ArrowIcon />
                </Link>
              </div>
            </div>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
