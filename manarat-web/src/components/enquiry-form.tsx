"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/actions/public";

const field =
  "w-full rounded-sm border border-rule bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "block text-[11px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

export function EnquiryForm({
  programmeId,
  programmeTitle,
}: {
  programmeId: string;
  programmeTitle: string;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, null);

  if (state?.ok) {
    return (
      <div className="rounded-sm border border-brand/30 bg-brand-wash p-6">
        <p className="font-display text-lg font-medium text-brand-deep">Enquiry received</p>
        <p className="mt-1 text-sm text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="programme_id" value={programmeId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="parent_name">
            Your name *
          </label>
          <input id="parent_name" name="parent_name" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="email">
            Email *
          </label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="child_name">
            Child&rsquo;s name
          </label>
          <input id="child_name" name="child_name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="child_age">
            Child&rsquo;s age
          </label>
          <input id="child_age" name="child_age" type="number" min={3} max={25} className={field} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="message">
          Anything you&rsquo;d like us to know
        </label>
        <textarea id="message" name="message" rows={4} className={field} />
      </div>

      {state && !state.ok && (
        <p className="rounded-sm bg-accent-wash px-3 py-2 text-sm text-accent">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Sending…" : `Enquire about ${programmeTitle}`}
      </button>
      <p className="text-xs text-ink-mute">
        We use your details only to answer this enquiry. We never sell or share them.
      </p>
    </form>
  );
}
