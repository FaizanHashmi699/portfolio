"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { respondAction, type PartnerActionState } from "@/app/[locale]/partner/actions";

export function RespondButtons({
  assignmentId,
  stage,
}: {
  assignmentId: string;
  stage: "new" | "accepted";
}) {
  const t = useTranslations();
  const [state, action] = useActionState<PartnerActionState, FormData>(
    respondAction,
    { status: "idle" },
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="assignment_id" value={assignmentId} />
      {stage === "new" ? (
        <>
          <button
            type="submit"
            name="response"
            value="accept"
            className="btn btn-primary text-sm"
          >
            {t("partner.accept")}
          </button>
          <button
            type="submit"
            name="response"
            value="decline"
            className="btn btn-ghost text-sm"
          >
            {t("partner.decline")}
          </button>
        </>
      ) : (
        <button
          type="submit"
          name="response"
          value="complete"
          className="btn btn-accent text-sm"
        >
          {t("partner.mark_complete")}
        </button>
      )}
      {state.status === "error" ? (
        <span className="text-sm text-[var(--color-sand-600)]">
          {state.message ? t(`errors.${state.message}`) : null}
        </span>
      ) : null}
    </form>
  );
}
