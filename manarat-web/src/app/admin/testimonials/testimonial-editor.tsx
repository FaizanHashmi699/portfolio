"use client";

import { useActionState, useState } from "react";
import { saveTestimonial, deleteTestimonial } from "@/actions/admin";
import { adminField, adminLabel, adminButton } from "@/components/admin/ui";
import type { Testimonial } from "@/lib/types";

export function TestimonialEditor({ testimonial }: { testimonial: Testimonial | null }) {
  const isNew = testimonial === null;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveTestimonial, null);

  if (isNew && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-card border border-dashed border-rule bg-surface px-5 py-5 text-sm font-bold text-ink-soft transition-all duration-300 hover:border-brand hover:bg-brand-wash/40 hover:text-brand-deep"
      >
        + Add a testimonial
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
          {isNew ? "New testimonial" : testimonial.author_name}
        </span>
        {!isNew && !testimonial.published && (
          <span className="ml-2.5 rounded-chip border border-rule bg-surface-2 px-2.5 py-1 align-middle text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
            hidden
          </span>
        )}
      </summary>

      <form action={action} className="space-y-5 border-t border-rule bg-ground/50 px-6 py-6">
        {!isNew && <input type="hidden" name="id" value={testimonial.id} />}

        <div>
          <label className={adminLabel}>Quote *</label>
          <textarea
            name="quote"
            required
            rows={4}
            defaultValue={testimonial?.quote ?? ""}
            className={adminField}
          />
          <p className="mt-2 text-xs leading-[1.7] text-ink-mute">
            Use the person&rsquo;s own words, and only with their permission.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={adminLabel}>Name *</label>
            <input
              name="author_name"
              required
              defaultValue={testimonial?.author_name ?? ""}
              className={adminField}
            />
          </div>
          <div>
            <label className={adminLabel}>Role or context</label>
            <input
              name="author_role"
              placeholder="Parent, Hifz programme"
              defaultValue={testimonial?.author_role ?? ""}
              className={adminField}
            />
          </div>
          <div>
            <label className={adminLabel}>Sort order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={testimonial?.sort_order ?? 0}
              className={adminField}
            />
          </div>
          <label className="flex cursor-pointer items-end gap-2.5 pb-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="published"
              defaultChecked={testimonial?.published ?? false}
              className="h-4 w-4 shrink-0 accent-[#1591dc]"
            />
            Show on the public site
          </label>
        </div>

        {state && (
          <p
            role="status"
            className={`rounded-[10px] border-l-[3px] border-brand px-4 py-3 text-sm leading-[1.7] ${
              state.ok ? "bg-brand-wash text-brand-deep" : "bg-surface-2 text-ink"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2.5 border-t border-rule pt-5">
          <button type="submit" disabled={pending} className={adminButton}>
            {pending ? "Saving…" : isNew ? "Add testimonial" : "Save changes"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={deleteTestimonial} className="border-t border-rule bg-ground/50 px-6 py-4">
          <input type="hidden" name="id" value={testimonial.id} />
          <button className="text-xs font-bold text-ink-mute underline-offset-4 transition-colors hover:text-brand-deep hover:underline">
            Delete this testimonial
          </button>
        </form>
      )}
    </details>
  );
}
