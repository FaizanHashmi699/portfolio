"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/actions/public";

const field =
  "w-full rounded-[10px] border border-rule bg-surface px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-brand focus:ring-4 focus:ring-brand/15";
const label =
  "mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute";

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
      <div className="rounded-card border border-brand/40 bg-brand-wash p-7 shadow-sm">
        <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-brand-deep">
          Enquiry received
        </p>
        <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
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
        <p
          role="alert"
          className="rounded-[10px] border border-brand/40 border-l-[3px] border-l-brand bg-brand-wash px-4 py-3 text-sm leading-[1.7] text-brand-deep"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-chip bg-brand px-7 py-3.5 text-[0.92rem] font-bold text-white shadow-brand transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none"
      >
        {pending ? "Sending…" : `Enquire about ${programmeTitle}`}
      </button>
      <p className="text-xs leading-[1.7] text-ink-mute">
        We use your details only to answer this enquiry. We never sell or share them.
      </p>
    </form>
  );
}
