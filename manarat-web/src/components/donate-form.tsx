"use client";

import { useActionState, useEffect, useState } from "react";
import { recordDonation } from "@/actions/public";
import { giftAidBonus, money } from "@/lib/format";

const PRESETS_ONE_OFF = [10, 25, 50, 100, 250];
const PRESETS_MONTHLY = [5, 10, 15, 25, 50];

const field =
  "w-full rounded-[10px] border border-rule bg-surface px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-brand focus:ring-4 focus:ring-brand/15";
const label =
  "mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute";

export function DonateForm({
  campaignId,
  campaignTitle,
  paymentsLive,
  initialAmount,
  initialFrequency = "one_off",
  causeSlug,
  designation,
}: {
  campaignId: string | null;
  campaignTitle: string | null;
  paymentsLive: boolean;
  /** Prefill from a "ways to give" card, in whole pounds. */
  initialAmount?: number;
  initialFrequency?: "one_off" | "monthly";
  /** Slug of the giving category the donor arrived from, posted with the form. */
  causeSlug?: string | null;
  /** Human label for that category, shown to the donor. */
  designation?: string | null;
}) {
  const [state, action, pending] = useActionState(recordDonation, null);
  const [frequency, setFrequency] = useState<"one_off" | "monthly">(initialFrequency);
  const [amount, setAmount] = useState<string>(
    String(initialAmount ?? (initialFrequency === "monthly" ? 15 : 25)),
  );
  const [giftAid, setGiftAid] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [handoff, setHandoff] = useState<string | null>(null);

  const presets = frequency === "monthly" ? PRESETS_MONTHLY : PRESETS_ONE_OFF;
  const numeric = Number(amount);
  const pence = Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) : 0;

  // When a gateway is live, the recorded pledge is handed straight to it.
  useEffect(() => {
    if (!state?.ok || !paymentsLive || !state.reference) return;
    let cancelled = false;
    setRedirecting(true);
    (async () => {
      try {
        const res = await fetch("/api/donations/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: state.reference }),
        });
        const body = (await res.json()) as { url?: string; error?: string };
        if (cancelled) return;
        if (res.ok && body.url) {
          window.location.assign(body.url);
          return;
        }
        setHandoff(body.error ?? "We could not open the payment page.");
      } catch {
        if (!cancelled) setHandoff("We could not reach the payment page.");
      }
      if (!cancelled) setRedirecting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [state, paymentsLive]);

  if (state?.ok) {
    return (
      <div className="rounded-card border border-brand/40 bg-brand-wash p-7 shadow-sm">
        <p className="font-display text-[1.4rem] font-extrabold tracking-tight text-brand-deep">
          Jazakum Allahu khayran
        </p>
        <p className="mt-3 text-[0.95rem] leading-[1.7] text-ink-soft">
          Your pledge of <strong>{money(pence)}</strong>
          {frequency === "monthly" ? " per month" : ""} has been recorded under reference{" "}
          <span className="font-mono font-semibold text-ink">{state.reference}</span>.
        </p>
        {paymentsLive ? (
          handoff ? (
            <p className="mt-4 rounded-[10px] border-l-[3px] border-brand bg-surface px-4 py-3 text-sm leading-[1.7] text-brand-deep">
              {handoff} Your reference is saved — quote it at the masjid, or try again.
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-soft" aria-live="polite">
              {redirecting ? "Opening the secure payment page…" : "Redirecting you to pay…"}
            </p>
          )
        ) : (
          <p className="mt-4 text-sm leading-[1.7] text-ink-soft">
            Card payment is not switched on for this site yet. A member of the team will be in
            touch to arrange your gift, or you can give at the masjid quoting this reference.
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {campaignId && <input type="hidden" name="campaign_id" value={campaignId} />}
      {causeSlug && <input type="hidden" name="designation" value={causeSlug} />}

      {designation && (
        <p className="flex flex-wrap items-center gap-2.5 rounded-card border border-brand/40 bg-brand-wash px-5 py-4 text-sm">
          <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
            Giving as
          </span>
          <strong className="font-display text-[1rem] font-extrabold tracking-tight text-brand-deep">
            {designation}
          </strong>
          <a
            href="/donate"
            className="ml-auto text-xs font-bold text-brand underline-offset-4 hover:underline"
          >
            Change
          </a>
        </p>
      )}
      <input type="hidden" name="frequency" value={frequency} />
      <input type="hidden" name="amount_pounds" value={amount} />

      <fieldset>
        <legend className={label}>How often</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "one_off", title: "One-off", note: "A single gift" },
              { key: "monthly", title: "Monthly", note: "Steady, predictable support" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setFrequency(opt.key);
                setAmount(opt.key === "monthly" ? "15" : "25");
              }}
              aria-pressed={frequency === opt.key}
              className={`rounded-card border px-5 py-4 text-left transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                frequency === opt.key
                  ? "border-brand bg-brand-wash shadow-sm"
                  : "border-rule bg-surface hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-sm"
              }`}
            >
              <span className="block font-display text-[0.95rem] font-extrabold text-brand-deep">
                {opt.title}
              </span>
              <span className="mt-0.5 block text-xs text-ink-mute">{opt.note}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Amount</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              aria-pressed={amount === String(p)}
              className={`rounded-chip border px-5 py-2.5 text-sm font-bold tabular-nums transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                amount === String(p)
                  ? "border-brand bg-brand text-white shadow-brand"
                  : "border-rule bg-surface text-brand-deep hover:-translate-y-0.5 hover:border-brand/50"
              }`}
            >
              £{p}
            </button>
          ))}
          <div className="flex items-center gap-1.5 rounded-chip border border-rule bg-surface px-4 focus-within:border-brand">
            <span className="text-sm font-bold text-ink-mute">£</span>
            <label htmlFor="custom-amount" className="sr-only">
              Custom amount in pounds
            </label>
            <input
              id="custom-amount"
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-20 bg-transparent py-2.5 text-sm font-bold tabular-nums text-brand-deep outline-none"
            />
          </div>
        </div>
        {frequency === "monthly" && pence > 0 && (
          <p className="mt-3 text-xs text-ink-mute">
            That&rsquo;s about {money(Math.round(pence / 30))} a day, and{" "}
            {money(pence * 12)} over a year.
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="donor_name">
            Your name
          </label>
          <input id="donor_name" name="donor_name" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="donor_email">
            Email
          </label>
          <input id="donor_email" name="donor_email" type="email" className={field} />
        </div>
      </div>

      <div className="rounded-card border border-rule bg-brand-wash/45 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="gift_aid"
            checked={giftAid}
            onChange={(e) => setGiftAid(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#1591dc]"
          />
          <span>
            <span className="block text-[0.95rem] font-bold text-brand-deep">
              Add Gift Aid
              {pence > 0 && (
                <span className="ml-1 font-bold text-brand">
                  — worth another {money(giftAidBonus(pence))} at no cost to you
                </span>
              )}
            </span>
            <span className="mt-2 block text-xs leading-[1.7] text-ink-mute">
              I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains
              Tax than the amount of Gift Aid claimed on all my donations in that tax year, it is my
              responsibility to pay any difference.
            </span>
          </span>
        </label>

        {giftAid && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="donor_postcode">
                Postcode *
              </label>
              <input id="donor_postcode" name="donor_postcode" required className={field} />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={label} htmlFor="message">
          Message (optional)
        </label>
        <textarea id="message" name="message" rows={3} className={field} />
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
        disabled={pending || pence === 0}
        className="w-full rounded-chip bg-brand px-6 py-4 text-[0.95rem] font-bold text-white shadow-brand transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none"
      >
        {pending
          ? "Please wait…"
          : paymentsLive
            ? `Continue to pay ${money(pence)}${frequency === "monthly" ? " a month" : ""}`
            : `Pledge ${money(pence)}${frequency === "monthly" ? " a month" : ""}${
                campaignTitle ? ` to ${campaignTitle}` : ""
              }`}
      </button>

      {!paymentsLive && (
        <p className="rounded-[10px] border border-rule bg-surface-2 px-4 py-3 text-xs leading-[1.7] text-ink-soft">
          <strong className="font-bold text-brand-deep">Card payments are not switched on.</strong> This form
          records your pledge and reference; it does not take card details or move money. Add Stripe
          keys to enable live collection.
        </p>
      )}
    </form>
  );
}
