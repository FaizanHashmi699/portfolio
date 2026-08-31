import { getPrayerSettings } from "@/lib/settings";
import { PageTitle } from "@/components/admin/ui";
import { PrayerSettingsForm } from "./settings-form";
import { PrayerTimesCard } from "@/components/prayer-times-card";

export const dynamic = "force-dynamic";

export default async function PrayerSettingsPage() {
  const settings = await getPrayerSettings();

  return (
    <>
      <PageTitle
        title="Prayer times"
        note="The timetable is calculated from these settings every day, so it never goes stale. Jama'ah offsets are the minutes added to each beginning time."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-sm border border-rule bg-surface p-6">
          <PrayerSettingsForm settings={settings} />
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-ink-mute">
            Live preview
          </p>
          <PrayerTimesCard settings={settings} />
        </div>
      </div>
    </>
  );
}
