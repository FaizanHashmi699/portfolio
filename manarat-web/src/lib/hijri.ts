/**
 * Hijri (Islamic) calendar.
 *
 * Uses the tabular Islamic calendar — the same arithmetic convention most
 * printed timetables and date converters use. Months actually begin on local
 * moon sighting, so an observed date can differ from this by a day; the UI
 * says so rather than pretending otherwise.
 */

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qa'dah",
  "Dhul Hijjah",
] as const;

export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
  monthName: string;
}

const floor = Math.floor;

/** Julian Day Number for a Gregorian civil date. */
export function gregorianToJDN(year: number, month: number, day: number): number {
  // The Fliegel-Van Flandern formula is written for integer division that
  // truncates toward zero, so this term is -1 only for January and February.
  // Using Math.floor here shifts every date by two days.
  const a = month <= 2 ? -1 : 0;
  return (
    floor((1461 * (year + 4800 + a)) / 4) +
    floor((367 * (month - 2 - 12 * a)) / 12) -
    floor((3 * floor((year + 4900 + a) / 100)) / 4) +
    day -
    32075
  );
}

/** Gregorian civil date from a Julian Day Number. */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  let l = jdn + 68569;
  const n = floor((4 * l) / 146097);
  l = l - floor((146097 * n + 3) / 4);
  const i = floor((4000 * (l + 1)) / 1461001);
  l = l - floor((1461 * i) / 4) + 31;
  const j = floor((80 * l) / 2447);
  const day = l - floor((2447 * j) / 80);
  l = floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;
  return { year, month, day };
}

/** Julian Day Number for a Hijri date, tabular convention. */
export function hijriToJDN(year: number, month: number, day: number): number {
  return (
    floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

/** Hijri date from a Julian Day Number. */
export function jdnToHijri(jdn: number): HijriDate {
  let l = jdn - 1948440 + 10632;
  const n = floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    floor((10985 - l) / 5316) * floor((50 * l) / 17719) +
    floor(l / 5670) * floor((43 * l) / 15238);
  l =
    l -
    floor((30 - j) / 15) * floor((17719 * j) / 50) -
    floor(j / 16) * floor((15238 * j) / 43) +
    29;
  const month = floor((24 * l) / 709);
  const day = l - floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day, monthName: HIJRI_MONTHS[month - 1] ?? "" };
}

export function gregorianToHijri(year: number, month: number, day: number): HijriDate {
  return jdnToHijri(gregorianToJDN(year, month, day));
}

export function hijriToGregorian(year: number, month: number, day: number) {
  return jdnToGregorian(hijriToJDN(year, month, day));
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

/* ---------------- Islamic events ---------------- */

export interface IslamicEventDef {
  slug: string;
  name: string;
  month: number;
  day: number;
  /** Days the observance runs for, inclusive of the start day. */
  days?: number;
  note: string;
  major?: boolean;
}

export const ISLAMIC_EVENTS: IslamicEventDef[] = [
  {
    slug: "islamic-new-year",
    name: "Islamic New Year",
    month: 1,
    day: 1,
    note: "The first day of Muharram opens the Hijri year.",
  },
  {
    slug: "ashura",
    name: "Day of Ashura",
    month: 1,
    day: 10,
    note: "A day of fasting, marking the deliverance of Musa (as) and his people.",
  },
  {
    slug: "mawlid",
    name: "Mawlid an-Nabi",
    month: 3,
    day: 12,
    note: "The birth of the Prophet Muhammad ﷺ, marked in many communities with gatherings and remembrance.",
  },
  {
    slug: "isra-miraj",
    name: "Isra' and Mi'raj",
    month: 7,
    day: 27,
    note: "The Night Journey and Ascension, on which the five daily prayers were ordained.",
  },
  {
    slug: "laylat-al-baraah",
    name: "Laylat al-Bara'ah",
    month: 8,
    day: 15,
    note: "The night of the middle of Sha'ban, spent by many in prayer and seeking forgiveness.",
  },
  {
    slug: "ramadan",
    name: "First day of Ramadan",
    month: 9,
    day: 1,
    days: 30,
    note: "The month of fasting, night prayer and increased giving.",
    major: true,
  },
  {
    slug: "laylat-al-qadr",
    name: "Laylat al-Qadr",
    month: 9,
    day: 27,
    note: "The Night of Decree, sought across the odd nights of the last ten of Ramadan.",
    major: true,
  },
  {
    slug: "eid-al-fitr",
    name: "Eid al-Fitr",
    month: 10,
    day: 1,
    note: "The festival closing Ramadan. Eid prayer is held in congregation in the morning.",
    major: true,
  },
  {
    slug: "day-of-arafah",
    name: "Day of Arafah",
    month: 12,
    day: 9,
    note: "The standing at Arafah during Hajj; a day of fasting for those not on pilgrimage.",
  },
  {
    slug: "eid-al-adha",
    name: "Eid al-Adha",
    month: 12,
    day: 10,
    days: 4,
    note: "The festival of sacrifice, coinciding with the days of Hajj.",
    major: true,
  },
];

export interface DatedIslamicEvent extends IslamicEventDef {
  hijriYear: number;
  gregorian: { year: number; month: number; day: number };
  /** Days from today. Negative once the event has passed. */
  daysAway: number;
  isToday: boolean;
  isActive: boolean;
}

/**
 * Every event for the Hijri years spanned by the next 18 months, sorted by
 * date, with past events dropped.
 */
export function upcomingEvents(today: Date, limit = 8): DatedIslamicEvent[] {
  const todayJDN = gregorianToJDN(
    today.getUTCFullYear(),
    today.getUTCMonth() + 1,
    today.getUTCDate(),
  );
  const thisHijri = jdnToHijri(todayJDN);

  const out: DatedIslamicEvent[] = [];
  for (const hijriYear of [thisHijri.year, thisHijri.year + 1, thisHijri.year + 2]) {
    for (const def of ISLAMIC_EVENTS) {
      const jdn = hijriToJDN(hijriYear, def.month, def.day);
      const span = def.days ?? 1;
      const daysAway = jdn - todayJDN;
      // Keep an event visible while it is still running.
      if (daysAway + span - 1 < 0) continue;
      out.push({
        ...def,
        hijriYear,
        gregorian: jdnToGregorian(jdn),
        daysAway,
        isToday: daysAway === 0,
        isActive: daysAway <= 0 && daysAway + span - 1 >= 0,
      });
    }
  }

  out.sort((a, b) => a.daysAway - b.daysAway);
  return out.slice(0, limit);
}

/** UTC midnight for a Gregorian date, for countdown maths on the client. */
export function toUTCDate(g: { year: number; month: number; day: number }): Date {
  return new Date(Date.UTC(g.year, g.month - 1, g.day, 0, 0, 0));
}
