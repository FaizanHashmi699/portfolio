"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createPartnerAction, type ActionState } from "@/app/[locale]/admin/actions";

interface Option { slug: string; label: string }

export function CreatePartnerForm({
  services,
  districts,
}: {
  services: Option[];
  districts: Option[];
}) {
  const t = useTranslations();
  const [state, action] = useActionState<ActionState, FormData>(
    createPartnerAction,
    { status: "idle" },
  );

  return (
    <form action={action} className="card grid gap-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name_ar">{t("admin.name_ar")}</label>
          <input id="name_ar" name="name_ar" className="field" required />
        </div>
        <div>
          <label className="label" htmlFor="name_en">{t("admin.name_en")}</label>
          <input id="name_en" name="name_en" className="field" dir="ltr" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">{t("admin.phone")}</label>
          <input id="phone" name="phone" className="field" dir="ltr" placeholder="05XXXXXXXX" />
        </div>
        <div>
          <label className="label" htmlFor="cr_number">{t("admin.cr_number")}</label>
          <input
            id="cr_number"
            name="cr_number"
            className="field"
            dir="ltr"
            inputMode="numeric"
            placeholder="1010XXXXXX"
          />
          <p className="mt-1 text-xs text-[var(--color-ink-500)]">
            {t("admin.cr_hint")}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="label">{t("admin.services")}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {services.map((s) => (
            <label key={s.slug} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="service_slugs" value={s.slug} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">{t("admin.districts")}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {districts.map((d) => (
            <label key={d.slug} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="district_slugs" value={d.slug} />
              {d.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state.status === "ok" ? (
        <p className="text-sm text-[var(--color-verified-500)]">
          {t("admin.partner_created")}
          {state.detail ? (
            <span className="ms-2 text-xs text-[var(--color-ink-500)]">
              {t(`errors.${state.detail}`)}
            </span>
          ) : null}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-sm text-[var(--color-sand-600)]">
          {state.message ? t(`errors.${state.message}`, state.params ?? {}) : null}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary">{t("admin.create")}</button>
      </div>
    </form>
  );
}
