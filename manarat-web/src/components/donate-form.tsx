"use client";

import { useActionState, useState } from "react";
import { recordDonation } from "@/actions/public";
import { giftAidBonus, money } from "@/lib/format";

const PRESETS_ONE_OFF = [10, 25, 50, 100, 250];
const PRESETS_MONTHLY = [5, 10, 15, 25, 50];

const field =
  "w-full rounded-sm border border-rule bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const label = "block text-[11px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

export function DonateForm({
  campaignId,
  campaignTitle,
  paymentsLive,
}: {
  campaignId: string | null;
  campaignTitle: string | null;
  paymentsLive: boolean;
}) {
  const [state, action, pending] = useActionState(recordDonation, null);
  const [frequency, setFrequency] = useState<"one_off" | "monthly">("one_off");
  const [amount, setAmount] = useState<string>("25");
  const [giftAid, setGiftAid] = useState(false);

  const presets = frequency === "monthly" ? PRESETS_MONTHLY : PRESETS_ONE_OFF;
  const numeric = Number(amount);
  const pence = Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) : 0;

  if (state?.ok) {
    return (
      <div className="rounded-sm border border-brand/30 bg-brand-wash p-6">
        <p className="font-display text-xl font-medium text-brand-deep">
          Jazakum Allahu khayran
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Your pledge of <strong>{money(pence)}</strong>
          {frequency === "monthly" ? " per month" : ""} has been recorded under reference{" "}
          <span className="font-mono font-semibold text-ink">{state.reference}</span>.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          {paymentsLive
            ? "You will be redirected to complete payment."
            : "Card payment is not yet switched on for this site. A member of the team will be in touch to arrange your gift, or you can give at the masjid quoting this reference."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {campaignId && <input type="hidden" name="campaign_id" value={campaignId} />}
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
              className={`rounded-sm border px-4 py-3 text-left transition-colors ${
                frequency === opt.key
                  ? "border-brand bg-brand-wash"
                  : "border-rule bg-surface hover:border-brand/50"
              }`}
            >
              <span className="block text-sm font-semibold text-ink">{opt.title}</span>
              <span className="block text-xs text-ink-mute">{opt.note}</span>
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
              className={`rounded-sm border px-4 py-2 text-sm font-medium tabular-nums transition-colors ${
                amount === String(p)
                  ? "border-brand bg-brand text-white"
                  : "border-rule bg-surface text-ink hover:border-brand/50"
              }`}
            >
              £{p}
            </button>
          ))}
          <div className="flex items-center gap-2 rounded-sm border border-rule bg-surface px-3">
            <span className="text-sm text-ink-mute">£</span>
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
              className="w-20 bg-transparent py-2 text-sm tabular-nums outline-none"
            />
          </div>
        </div>
        {frequency === "monthly" && pence > 0 && (
          <p className="mt-2 text-xs text-ink-mute">
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

      <div className="rounded-sm border border-rule bg-surface p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="gift_aid"
            checked={giftAid}
            onChange={(e) => setGiftAid(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#00655a]"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              Add Gift Aid
              {pence > 0 && (
                <span className="ml-1 font-normal text-brand">
                  — worth another {money(giftAidBonus(pence))} at no cost to you
                </span>
              )}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-mute">
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
        <p className="rounded-sm bg-accent-wash px-3 py-2 text-sm text-accent">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || pence === 0}
        className="w-full rounded-sm bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending
          ? "Please wait…"
          : `Give ${money(pence)}${frequency === "monthly" ? " a month" : ""}${
              campaignTitle ? ` to ${campaignTitle}` : ""
            }`}
      </button>

      {!paymentsLive && (
        <p className="rounded-sm border border-rule bg-surface-2 px-3 py-2 text-xs leading-relaxed text-ink-soft">
          <strong className="font-semibold">Card payments are not switched on.</strong> This form
          records your pledge and reference; it does not take card details or move money. Add Stripe
          keys to enable live collection.
        </p>
      )}
    </form>
  );
}
