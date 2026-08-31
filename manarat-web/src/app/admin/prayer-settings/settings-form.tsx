"use client";

import { useActionState } from "react";
import { savePrayerSettings } from "@/actions/admin";
import { adminField, adminLabel } from "@/components/admin/ui";
import { METHOD_LABELS } from "@/lib/prayer-times";
import type { PrayerSettings } from "@/lib/types";

const OFFSETS = [
  { name: "fajr_offset", label: "Fajr" },
  { name: "dhuhr_offset", label: "Dhuhr" },
  { name: "asr_offset", label: "Asr" },
  { name: "maghrib_offset", label: "Maghrib" },
  { name: "isha_offset", label: "Isha" },
] as const;

export function PrayerSettingsForm({ settings }: { settings: PrayerSettings }) {
  const [state, action, pending] = useActionState(savePrayerSettings, null);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className={adminLabel}>Masjid name</label>
        <input name="masjid_name" defaultValue={settings.masjid_name} className={adminField} />
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className={adminLabel}>Location</legend>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Latitude</label>
          <input name="latitude" type="number" step="0.0001" defaultValue={settings.latitude} className={adminField} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Longitude</label>
          <input name="longitude" type="number" step="0.0001" defaultValue={settings.longitude} className={adminField} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Timezone</label>
          <input name="timezone" defaultValue={settings.timezone} className={adminField} />
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel}>Calculation method</label>
          <select name="method" defaultValue={settings.method} className={adminField}>
            {(Object.keys(METHOD_LABELS) as (keyof typeof METHOD_LABELS)[]).map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Asr</label>
          <select name="asr_method" defaultValue={settings.asr_method} className={adminField}>
            <option value="standard">Standard (Shafi&rsquo;i, Maliki, Hanbali)</option>
            <option value="hanafi">Hanafi</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={adminLabel}>Jama&rsquo;ah offsets (minutes after beginning time)</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {OFFSETS.map((o) => (
            <div key={o.name}>
              <label className="mb-1 block text-xs text-ink-soft">{o.label}</label>
              <input
                name={o.name}
                type="number"
                min={0}
                max={180}
                defaultValue={settings[o.name]}
                className={adminField}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label className={adminLabel}>Jumu&rsquo;ah times</label>
        <input name="jumuah_times" defaultValue={settings.jumuah_times} className={adminField} />
        <p className="mt-1 text-xs text-ink-mute">Free text, e.g. &ldquo;13:15, 14:15&rdquo;.</p>
      </div>

      {state && (
        <p
          className={`rounded-sm px-3 py-2 text-sm ${
            state.ok ? "bg-brand-wash text-brand-deep" : "bg-accent-wash text-accent"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
