"use client";

import { useActionState, useState } from "react";
import { saveCampaign } from "@/actions/admin";
import { adminField, adminLabel, adminButton } from "@/components/admin/ui";
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
        className="w-full rounded-card border border-dashed border-rule bg-surface px-5 py-5 text-sm font-bold text-ink-soft transition-all duration-300 hover:border-brand hover:bg-brand-wash/40 hover:text-brand-deep"
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
      className="group overflow-hidden rounded-card border border-rule bg-surface shadow-sm"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-6 py-5 transition-colors hover:bg-surface-2/50">
        <span className="font-display text-[1.1rem] font-extrabold tracking-tight text-brand-deep">
          {isNew ? "New appeal" : campaign.title}
        </span>
        {!isNew && campaign.is_primary && (
          <span className="ml-2.5 rounded-chip bg-brand px-2.5 py-1 align-middle text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">
            live appeal
          </span>
        )}
        {!isNew && (
          <span className="ml-3 text-xs font-medium tabular-nums text-ink-soft">
            {money(campaign.raised_pence)} of {moneyShort(campaign.target_pence)} · {pct.toFixed(1)}%
          </span>
        )}
      </summary>

      <form action={action} className="space-y-5 border-t border-rule bg-ground/50 px-6 py-6">
        {!isNew && <input type="hidden" name="id" value={campaign.id} />}

        <div className="grid gap-5 sm:grid-cols-2">
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

        <div className="grid gap-5 sm:grid-cols-2">
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
          <div className="flex flex-col justify-end gap-3 pb-1 text-sm">
            <label className="flex cursor-pointer items-center gap-2.5 font-medium text-ink">
              <input
                type="checkbox"
                name="is_primary"
                defaultChecked={campaign?.is_primary ?? false}
                className="h-4 w-4 shrink-0 accent-[#1591dc]"
              />
              This is the live appeal
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 font-medium text-ink">
              <input
                type="checkbox"
                name="published"
                defaultChecked={campaign?.published ?? true}
                className="h-4 w-4 shrink-0 accent-[#1591dc]"
              />
              Show on the public site
            </label>
          </div>
        </div>

        {!isNew && (
          <p className="rounded-[10px] border border-rule bg-surface px-4 py-3 text-xs leading-[1.7] text-ink-soft">
            Raised so far:{" "}
            <strong className="font-bold tabular-nums text-brand-deep">
              {money(campaign.raised_pence)}
            </strong>
            .
            This is calculated from confirmed donations and cannot be edited by hand.
          </p>
        )}

        {state && (
          <p
            role="status"
            className={`rounded-[10px] border-l-[3px] px-4 py-3 text-sm leading-[1.7] ${
              state.ok
                ? "border-brand bg-brand-wash text-brand-deep"
                : "border-brand bg-surface-2 text-ink"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={adminButton}
        >
          {pending ? "Saving…" : isNew ? "Create appeal" : "Save changes"}
        </button>
      </form>
    </details>
  );
}
