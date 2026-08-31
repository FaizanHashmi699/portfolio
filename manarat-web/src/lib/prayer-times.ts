/**
 * Prayer time calculation.
 *
 * Self-contained astronomical implementation — no external API, so the
 * timetable cannot go stale the way a PDF does. Based on the standard
 * sun-position equations used by the common calculation conventions.
 */

export type Method = "MWL" | "ISNA" | "Egypt" | "Karachi" | "MakkahUmmAlQura";
export type AsrMethod = "standard" | "hanafi";

/** Fajr and Isha sun depression angles, in degrees below the horizon. */
const ANGLES: Record<Method, { fajr: number; isha: number; ishaInterval?: number }> = {
  MWL: { fajr: 18, isha: 17 },
  ISNA: { fajr: 15, isha: 15 },
  Egypt: { fajr: 19.5, isha: 17.5 },
  Karachi: { fajr: 18, isha: 18 },
  // Umm al-Qura uses a fixed 90 minutes after Maghrib rather than an angle.
  MakkahUmmAlQura: { fajr: 18.5, isha: 0, ishaInterval: 90 },
};

export const METHOD_LABELS: Record<Method, string> = {
  MWL: "Muslim World League",
  ISNA: "Islamic Society of North America",
  Egypt: "Egyptian General Authority",
  Karachi: "University of Islamic Sciences, Karachi",
  MakkahUmmAlQura: "Umm al-Qura, Makkah",
};

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_ORDER: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export interface PrayerConfig {
  latitude: number;
  longitude: number;
  timezone: string;
  method: Method;
  asrMethod: AsrMethod;
  offsets: Record<Exclude<PrayerKey, "sunrise">, number>;
}

/** Minutes past local midnight for each prayer. */
export interface DayTimes {
  begins: Record<PrayerKey, number>;
  jamaah: Record<Exclude<PrayerKey, "sunrise">, number>;
}

const DEG = Math.PI / 180;
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const arcsin = (x: number) => Math.asin(x) / DEG;
const arccos = (x: number) => Math.acos(x) / DEG;
const arccot = (x: number) => Math.atan(1 / x) / DEG;

const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

/** Julian day number for a civil date. */
function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    b -
    1524.5
  );
}

/** Sun declination and equation of time for a Julian day. */
function sunPosition(jd: number): { declination: number; equation: number } {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const L = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;

  const declination = arcsin(sin(e) * sin(L));
  const rightAscension = arctan2(cos(e) * sin(L), cos(L)) / 15;
  const equation = q / 15 - fixHour(rightAscension);

  return { declination, equation };
}

function arctan2(y: number, x: number): number {
  return fixAngle(Math.atan2(y, x) / DEG);
}

/** Hour angle for the sun at a given altitude, in hours. */
function hourAngle(altitude: number, latitude: number, declination: number): number | null {
  const numerator = sin(altitude) - sin(latitude) * sin(declination);
  const denominator = cos(latitude) * cos(declination);
  const ratio = numerator / denominator;
  if (ratio > 1 || ratio < -1) return null; // sun never reaches this altitude today
  return arccos(ratio) / 15;
}

/**
 * Offset in hours between UTC and the given IANA timezone on the given date,
 * derived from Intl so DST is handled without a tz database dependency.
 */
export function timezoneOffsetHours(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 3600000;
}

/**
 * Calculate prayer times for one local calendar date.
 * Returns minutes past local midnight.
 */
export function calculateTimes(
  date: { year: number; month: number; day: number },
  config: PrayerConfig,
): DayTimes {
  const { latitude, longitude, method, asrMethod } = config;
  const angles = ANGLES[method];

  const jd = julianDay(date.year, date.month, date.day);
  const noonProbe = new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0));
  const tzOffset = timezoneOffsetHours(noonProbe, config.timezone);

  const { declination, equation } = sunPosition(jd + 0.5 - longitude / 360);

  // Solar noon in local clock hours.
  const dhuhrHour = 12 - equation - longitude / 15 + tzOffset;

  const angleTime = (altitude: number, direction: "before" | "after"): number | null => {
    const ha = hourAngle(altitude, latitude, declination);
    if (ha === null) return null;
    return direction === "before" ? dhuhrHour - ha : dhuhrHour + ha;
  };

  // Asr: shadow length equals object length (standard) or twice it (Hanafi).
  const shadowFactor = asrMethod === "hanafi" ? 2 : 1;
  const asrAltitude = arccot(shadowFactor + tan(Math.abs(latitude - declination)));

  // -0.833° accounts for refraction and the sun's disc at the horizon.
  const HORIZON = -0.833;

  const sunriseHour = angleTime(HORIZON, "before");
  const maghribHour = angleTime(HORIZON, "after");
  const fajrHour = angleTime(-angles.fajr, "before");
  const asrHour = angleTime(asrAltitude, "after");
  const ishaHour =
    angles.ishaInterval !== undefined
      ? maghribHour === null
        ? null
        : maghribHour + angles.ishaInterval / 60
      : angleTime(-angles.isha, "after");

  /**
   * At UK latitudes Fajr and Isha angles are not reached for part of the
   * summer. Fall back to the "one-seventh of the night" convention, which is
   * what British masjids in practice use.
   */
  const resolve = (
    value: number | null,
    fallback: "fajr" | "isha",
  ): number => {
    if (value !== null) return value;
    if (sunriseHour === null || maghribHour === null) {
      return fallback === "fajr" ? 4 : 22;
    }
    const nightLength = 24 - (maghribHour - sunriseHour);
    const seventh = nightLength / 7;
    return fallback === "fajr" ? sunriseHour - seventh : maghribHour + seventh;
  };

  const toMinutes = (hour: number) => Math.round(fixHour(hour) * 60);

  const begins: Record<PrayerKey, number> = {
    fajr: toMinutes(resolve(fajrHour, "fajr")),
    sunrise: toMinutes(sunriseHour ?? 6),
    dhuhr: toMinutes(dhuhrHour),
    asr: toMinutes(asrHour ?? dhuhrHour + 3),
    maghrib: toMinutes(maghribHour ?? 18),
    isha: toMinutes(resolve(ishaHour, "isha")),
  };

  const jamaah = {
    fajr: begins.fajr + config.offsets.fajr,
    dhuhr: begins.dhuhr + config.offsets.dhuhr,
    asr: begins.asr + config.offsets.asr,
    maghrib: begins.maghrib + config.offsets.maghrib,
    isha: begins.isha + config.offsets.isha,
  };

  return { begins, jamaah };
}

/** Format minutes past midnight as 24-hour HH:MM. */
export function formatMinutes(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Today's date in the masjid's timezone, as civil date parts. */
export function localDateParts(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Minutes past local midnight, right now, in the masjid's timezone. */
export function nowMinutes(timeZone: string, date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return (get("hour") % 24) * 60 + get("minute");
}

/** Which prayer is next, given today's jamaah times. */
export function nextPrayer(
  times: DayTimes,
  currentMinutes: number,
): { key: Exclude<PrayerKey, "sunrise">; at: number; tomorrow: boolean } {
  const order: Exclude<PrayerKey, "sunrise">[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  for (const key of order) {
    if (times.jamaah[key] > currentMinutes) {
      return { key, at: times.jamaah[key], tomorrow: false };
    }
  }
  return { key: "fajr", at: times.jamaah.fajr, tomorrow: true };
}
