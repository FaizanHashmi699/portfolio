"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addCreditsAction, type ActionState } from "@/app/[locale]/admin/actions";

export function CreditsForm({ tenantId }: { tenantId: string }) {
  const t = useTranslations();
  const [state, action] = useActionState<ActionState, FormData>(addCreditsAction, {
    status: "idle",
  });

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <div>
        <label className="label" htmlFor={`credits-${tenantId}`}>
          {t("admin.add_credits")}
        </label>
        <input
          id={`credits-${tenantId}`}
          name="credits"
          type="number"
          min={1}
          defaultValue={10}
          className="field w-24 tabular-nums"
        />
      </div>
      <button type="submit" className="btn btn-ghost text-sm">
        {t("admin.top_up")}
      </button>
      {state.status === "ok" ? (
        <span className="text-sm text-[var(--color-verified-500)] tabular-nums">
          → {state.detail}
        </span>
      ) : null}
      {state.status === "error" ? (
        <span className="text-sm text-[var(--color-sand-600)]">
          {state.message ? t(`errors.${state.message}`, state.params ?? {}) : null}
        </span>
      ) : null}
    </form>
  );
}
