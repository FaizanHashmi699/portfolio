"use client";

import { useActionState, useState } from "react";
import { saveCampaign } from "@/actions/admin";
import { adminField, adminLabel } from "@/components/admin/ui";
import { money, moneyShort } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export function CampaignEditor({ campaign }: { campaign: Campaign | null }) {
  const isNew = campaign === null;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveCampaign, null);

  if (isNew && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-sm border border-dashed border-rule bg-surface px-5 py-4 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
      >
        + Add an appeal
      </button>
    );
  }

  const pct =
    campaign && campaign.target_pence > 0
      ? Math.min(100, (campaign.raised_pence / campaign.target_pence) * 100)
      : 0;

  return (
    <details
      open={isNew || open}
      className="rounded-sm border border-rule bg-surface"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-5 py-4">
        <span className="font-display text-lg font-medium">
          {isNew ? "New appeal" : campaign.title}
        </span>
        {!isNew && campaign.is_primary && (
          <span className="ml-2 rounded-sm bg-brand px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white">
            live appeal
          </span>
        )}
        {!isNew && (
          <span className="ml-3 text-xs tabular-nums text-ink-mute">
            {money(campaign.raised_pence)} of {moneyShort(campaign.target_pence)} · {pct.toFixed(1)}%
          </span>
        )}
      </summary>

      <form action={action} className="space-y-4 border-t border-rule-soft px-5 py-5">
        {!isNew && <input type="hidden" name="id" value={campaign.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={adminLabel}>Title *</label>
            <input name="title" required defaultValue={campaign?.title ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>URL slug *</label>
            <input
              name="slug"
              required
              defaultValue={campaign?.slug ?? ""}
              pattern="[a-z0-9\-]+"
              className={adminField}
            />
          </div>
        </div>

        <div>
          <label className={adminLabel}>Summary *</label>
          <textarea name="summary" required rows={2} defaultValue={campaign?.summary ?? ""} className={adminField} />
        </div>

        <div>
          <label className={adminLabel}>What it funds</label>
          <textarea name="body" rows={6} defaultValue={campaign?.body ?? ""} className={adminField} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={adminLabel}>Target (£)</label>
            <input
              name="target_pounds"
              type="number"
              min={0}
              step="1"
              defaultValue={campaign ? campaign.target_pence / 100 : 0}
              className={adminField}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_primary"
                defaultChecked={campaign?.is_primary ?? false}
                className="h-4 w-4 accent-[#00655a]"
              />
              This is the live appeal
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="published"
                defaultChecked={campaign?.published ?? true}
                className="h-4 w-4 accent-[#00655a]"
              />
              Show on the public site
            </label>
          </div>
        </div>

        {!isNew && (
          <p className="rounded-sm bg-ground px-3 py-2 text-xs text-ink-soft">
            Raised so far: <strong className="tabular-nums">{money(campaign.raised_pence)}</strong>.
            This is calculated from confirmed donations and cannot be edited by hand.
          </p>
        )}

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
          className="rounded-sm bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : isNew ? "Create appeal" : "Save changes"}
        </button>
      </form>
    </details>
  );
}
