import { upcomingEvents, HIJRI_MONTHS, type DatedIslamicEvent } from "@/lib/hijri";

function gregorianLabel(g: { year: number; month: number; day: number }) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(g.year, g.month - 1, g.day)));
}

function awayLabel(e: DatedIslamicEvent) {
  if (e.isToday) return "Today";
  if (e.isActive) return "Now";
  if (e.daysAway === 1) return "Tomorrow";
  if (e.daysAway < 31) return `In ${e.daysAway} days`;
  const months = Math.round(e.daysAway / 30.44);
  return `In ${months} month${months === 1 ? "" : "s"}`;
}

export function IslamicEvents({ limit = 6, today }: { limit?: number; today: Date }) {
  const events = upcomingEvents(today, limit);

  return (
    <ol className="grid gap-5 sm:grid-cols-2">
      {events.map((e) => {
        const live = e.isActive || e.isToday;
        return (
          <li
            key={`${e.slug}-${e.hijriYear}`}
            className={`group relative flex flex-col overflow-hidden rounded-card border bg-surface p-6 shadow-sm transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-lg sm:p-7 ${
              live ? "border-brand shadow-md" : "border-rule hover:border-brand/40"
            }`}
          >
            {/* A thin brand rule that fills in on hover — the only decoration. */}
            <span
              aria-hidden
              className={`absolute inset-x-0 top-0 h-[3px] bg-brand transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
                live ? "scale-x-100" : "origin-left scale-x-0 group-hover:scale-x-100"
              }`}
            />

            <div className="flex items-start gap-4">
              <h3 className="font-display text-[1.15rem] font-extrabold leading-snug tracking-tight text-brand-deep">
                {e.name}
              </h3>
              <span
                className={`ml-auto shrink-0 rounded-chip px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${
                  live ? "bg-brand text-white" : "bg-brand-wash text-brand-mid"
                }`}
              >
                {awayLabel(e)}
              </span>
            </div>

            <p className="mt-4 font-display text-[0.95rem] font-bold text-ink">
              {gregorianLabel(e.gregorian)}
            </p>
            <p className="mt-1 text-sm text-ink-mute">
              {e.day} {HIJRI_MONTHS[e.month - 1]} {e.hijriYear} AH
              {e.days && e.days > 1 ? ` · ${e.days} days` : ""}
            </p>

            <p className="mt-4 border-t border-rule-soft pt-4 text-sm leading-[1.7] text-ink-soft">
              {e.note}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
