"use client";

import { useActionState, useState } from "react";
import { saveProgramme, deleteProgramme } from "@/actions/admin";
import { adminField, adminLabel } from "@/components/admin/ui";
import type { Programme } from "@/lib/types";

export function ProgrammeEditor({ programme }: { programme: Programme | null }) {
  const isNew = programme === null;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveProgramme, null);

  if (isNew && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-sm border border-dashed border-rule bg-surface px-5 py-4 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
      >
        + Add a programme
      </button>
    );
  }

  return (
    <details
      open={isNew || open}
      className="rounded-sm border border-rule bg-surface"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none px-5 py-4">
        <span className="font-display text-lg font-medium">
          {isNew ? "New programme" : programme.title}
        </span>
        {!isNew && !programme.published && (
          <span className="ml-2 rounded-sm bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ink-mute">
            hidden
          </span>
        )}
        <span className="ml-3 text-xs text-ink-mute">{open ? "Close" : "Edit"}</span>
      </summary>

      <form action={action} className="space-y-4 border-t border-rule-soft px-5 py-5">
        {!isNew && <input type="hidden" name="id" value={programme.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
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
          <p className="mt-1 text-xs text-ink-mute">Leave a blank line between paragraphs.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={programme?.published ?? true}
              className="h-4 w-4 accent-[#00655a]"
            />
            Show on the public site
          </label>
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

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {pending ? "Saving…" : isNew ? "Create programme" : "Save changes"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteProgramme} className="border-t border-rule-soft px-5 py-3">
          <input type="hidden" name="id" value={programme.id} />
          <button className="text-xs text-ink-mute hover:text-accent">Delete this programme</button>
        </form>
      )}
    </details>
  );
}
