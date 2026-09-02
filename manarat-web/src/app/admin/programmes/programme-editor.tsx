"use client";

import { useActionState, useState } from "react";
import { saveProgramme, deleteProgramme } from "@/actions/admin";
import { adminField, adminLabel, adminButton } from "@/components/admin/ui";
import type { Programme } from "@/lib/types";

export function ProgrammeEditor({ programme }: { programme: Programme | null }) {
  const isNew = programme === null;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveProgramme, null);

  if (isNew && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-card border border-dashed border-rule bg-surface px-5 py-5 text-sm font-bold text-ink-soft transition-all duration-300 hover:border-brand hover:bg-brand-wash/40 hover:text-brand-deep"
      >
        + Add a programme
      </button>
    );
  }

  return (
    <details
      open={isNew || open}
      className="group overflow-hidden rounded-card border border-rule bg-surface shadow-sm"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-6 py-5 transition-colors hover:bg-surface-2/50">
        <span className="font-display text-[1.1rem] font-extrabold tracking-tight text-brand-deep">
          {isNew ? "New programme" : programme.title}
        </span>
        {!isNew && !programme.published && (
          <span className="ml-2.5 rounded-chip border border-rule bg-surface-2 px-2.5 py-1 align-middle text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
            hidden
          </span>
        )}
        <span className="ml-3 text-xs font-bold text-ink-mute">{open ? "Close" : "Edit"}</span>
      </summary>

      <form action={action} className="space-y-5 border-t border-rule bg-ground/50 px-6 py-6">
        {!isNew && <input type="hidden" name="id" value={programme.id} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={adminLabel}>Title *</label>
            <input name="title" required defaultValue={programme?.title ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>URL slug *</label>
            <input
              name="slug"
              required
              defaultValue={programme?.slug ?? ""}
              pattern="[a-z0-9\-]+"
              title="Lower-case letters, numbers and hyphens only"
              className={adminField}
            />
          </div>
        </div>

        <div>
          <label className={adminLabel}>Summary *</label>
          <textarea name="summary" required rows={2} defaultValue={programme?.summary ?? ""} className={adminField} />
        </div>

        <div>
          <label className={adminLabel}>Full description</label>
          <textarea name="body" rows={5} defaultValue={programme?.body ?? ""} className={adminField} />
          <p className="mt-2 text-xs text-ink-mute">Leave a blank line between paragraphs.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={adminLabel}>Age range</label>
            <input name="age_range" defaultValue={programme?.age_range ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>Schedule</label>
            <input name="schedule" defaultValue={programme?.schedule ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>Fees</label>
            <input name="fee_text" defaultValue={programme?.fee_text ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>Teachers</label>
            <input name="teacher_note" defaultValue={programme?.teacher_note ?? ""} className={adminField} />
          </div>
          <div>
            <label className={adminLabel}>Sort order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={programme?.sort_order ?? 0}
              className={adminField}
            />
          </div>
          <label className="flex cursor-pointer items-end gap-2.5 pb-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="published"
              defaultChecked={programme?.published ?? true}
              className="h-4 w-4 shrink-0 accent-[#1591dc]"
            />
            Show on the public site
          </label>
        </div>

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

        <div className="flex flex-wrap gap-2.5 border-t border-rule pt-5">
          <button
            type="submit"
            disabled={pending}
            className={adminButton}
          >
            {pending ? "Saving…" : isNew ? "Create programme" : "Save changes"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteProgramme} className="border-t border-rule bg-ground/50 px-6 py-4">
          <input type="hidden" name="id" value={programme.id} />
          <button className="text-xs font-bold text-ink-mute underline-offset-4 transition-colors hover:text-brand-deep hover:underline">
            Delete this programme
          </button>
        </form>
      )}
    </details>
  );
}
