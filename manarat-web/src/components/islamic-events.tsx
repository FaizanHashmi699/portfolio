import { upcomingEvents, type DatedIslamicEvent } from "@/lib/hijri";

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
    <ol className="grid gap-3 sm:grid-cols-2">
      {events.map((e) => (
        <li
          key={`${e.slug}-${e.hijriYear}`}
          className={`flex flex-col gap-1.5 rounded-md border p-5 transition-colors ${
            e.isActive || e.isToday
              ? "border-brand bg-brand-wash"
              : e.major
                ? "border-rule bg-surface hover:border-brand/50"
                : "border-rule bg-surface"
          }`}
        >
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-lg font-medium">{e.name}</h3>
            <span
              className={`ml-auto shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                e.isActive || e.isToday ? "bg-brand text-white" : "bg-surface-2 text-ink-mute"
              }`}
            >
              {awayLabel(e)}
            </span>
          </div>
          <p className="text-sm font-medium text-ink-soft">
            {gregorianLabel(e.gregorian)}
            <span className="text-ink-mute"> · {e.day} {["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Ula","Jumada al-Akhirah","Rajab","Sha'ban","Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah"][e.month-1]} {e.hijriYear}</span>
          </p>
          <p className="text-sm leading-relaxed text-ink-mute">{e.note}</p>
        </li>
      ))}
    </ol>
  );
}
