import { createClient } from "@/lib/supabase/server";
import type { PrayerSettings } from "@/lib/types";
import type { PrayerConfig } from "@/lib/prayer-times";

export const FALLBACK_SETTINGS: PrayerSettings = {
  id: 1,
  masjid_name: "Manarat Foundation",
  latitude: 52.4569,
  longitude: -1.809,
  timezone: "Europe/London",
  method: "MWL",
  asr_method: "standard",
  fajr_offset: 20,
  dhuhr_offset: 10,
  asr_offset: 10,
  maghrib_offset: 5,
  isha_offset: 15,
  jumuah_times: "13:15, 14:15",
};

export async function getPrayerSettings(): Promise<PrayerSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("prayer_settings").select("*").eq("id", 1).single();
    return (data as PrayerSettings) ?? FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export function toPrayerConfig(s: PrayerSettings): PrayerConfig {
  return {
    latitude: s.latitude,
    longitude: s.longitude,
    timezone: s.timezone,
    method: s.method,
    asrMethod: s.asr_method,
    offsets: {
      fajr: s.fajr_offset,
      dhuhr: s.dhuhr_offset,
      asr: s.asr_offset,
      maghrib: s.maghrib_offset,
      isha: s.isha_offset,
    },
  };
}
