"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { assignLeadAction, type ActionState } from "@/app/[locale]/admin/actions";

interface PartnerOption { id: string; label: string; disabled: boolean }

export function AssignForm({
  leadId,
  partners,
}: {
  leadId: string;
  partners: PartnerOption[];
}) {
  const t = useTranslations();
  const [state, action] = useActionState<ActionState, FormData>(assignLeadAction, {
    status: "idle",
  });

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="lead_id" value={leadId} />
      <div className="min-w-52">
        <label className="label" htmlFor={`assign-${leadId}`}>
          {t("admin.assign_to")}
        </label>
        <select id={`assign-${leadId}`} name="tenant_id" className="field" required>
          <option value="">{t("request.choose")}</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id} disabled={p.disabled}>
              {p.label}
              {p.disabled ? ` — ${t("admin.no_credits")}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`credits-cost-${leadId}`}>
          {t("admin.credits_cost")}
        </label>
        <input
          id={`credits-cost-${leadId}`}
          name="credits"
          type="number"
          min={1}
          defaultValue={1}
          className="field w-20 tabular-nums"
        />
      </div>
      <button type="submit" className="btn btn-primary text-sm">
        {t("admin.assign")}
      </button>

      {state.status === "ok" ? (
        <span className="w-full text-sm text-[var(--color-verified-500)]">
          {t("admin.assigned")}
          {state.detail?.startsWith("https://wa.me/") ? (
            <a
              href={state.detail}
              target="_blank"
              rel="noopener noreferrer"
              className="ms-2 underline"
            >
              {t("admin.open_whatsapp")}
            </a>
          ) : null}
        </span>
      ) : null}
      {state.status === "error" ? (
        <span className="w-full text-sm text-[var(--color-sand-600)]">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
