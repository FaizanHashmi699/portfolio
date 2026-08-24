"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitRequest, type RequestState } from "@/app/[locale]/request/actions";

interface Option {
  slug: string;
  label: string;
}

function SubmitButton() {
  const t = useTranslations();
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? t("request.submitting") : t("request.submit")}
    </button>
  );
}

export function RequestForm({
  services,
  districts,
  preferredProvider,
  preferredProviderName,
}: {
  services: Option[];
  districts: Option[];
  preferredProvider?: string;
  preferredProviderName?: string;
}) {
  const t = useTranslations();
  const [state, action] = useActionState<RequestState, FormData>(submitRequest, {
    status: "idle",
  });

  // React 19 auto-resets the form once the action completes, which would wipe
  // every field the moment validation rejects one of them — a single mistyped
  // digit costing the customer the whole form. Holding the values in state and
  // driving the inputs from it survives that reset, while keeping the action
  // on <form action> so submission still works with JavaScript disabled.
  const [values, setValues] = useState({
    customer_name: "",
    phone: "",
    service_slug: "",
    district_slug: "",
    address: "",
    notes: "",
  });

  // React's post-action form reset clears a <select> even when it is
  // controlled — text inputs recover from state on re-render, selects do not.
  // Re-apply them from state after each attempt so a rejected submission never
  // silently drops the service or district the customer chose.
  const serviceRef = useRef<HTMLSelectElement>(null);
  const districtRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (serviceRef.current) serviceRef.current.value = values.service_slug;
    if (districtRef.current) districtRef.current.value = values.district_slug;
    // Re-runs per submission; `values` is intentionally read, not depended on.
  }, [state.attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [field]: e.target.value }));


  if (state.status === "success") {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold text-[var(--color-verified-500)]">
          {t("request.success_title")}
        </h2>
        <p className="mt-2">
          {t("request.success_body", { ref: state.ref ?? "" })}
        </p>
        {state.persisted === false ? (
          <p className="mt-3 rounded border border-[var(--color-sand-500)] px-3 py-2 text-sm text-[var(--color-sand-600)]">
            {t("request.success_demo")}
          </p>
        ) : null}
        <a href="" className="btn btn-ghost mt-4">
          {t("request.another")}
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4 p-6">
      {preferredProvider ? (
        <>
          <input
            type="hidden"
            name="preferred_provider_slug"
            value={preferredProvider}
          />
          <p className="rounded bg-[var(--color-brand-50)] px-3 py-2 text-sm font-semibold text-[var(--color-brand-600)]">
            {t("request.for_provider", { name: preferredProviderName ?? "" })}
          </p>
        </>
      ) : null}

      <div>
        <label className="label" htmlFor="customer_name">
          {t("request.name")}
        </label>
        <input
          id="customer_name"
          name="customer_name"
          className="field"
          value={values.customer_name}
          onChange={set("customer_name")}
          required
          aria-invalid={state.fieldErrors?.customer_name ? true : undefined}
        />
        {state.fieldErrors?.customer_name ? (
          <p className="mt-1 text-sm text-[var(--color-sand-600)]">
            {t("request.error_name")}
          </p>
        ) : null}
      </div>

      <div>
        <label className="label" htmlFor="phone">
          {t("request.phone")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          className="field"
          placeholder={t("request.phone_hint")}
          value={values.phone}
          onChange={set("phone")}
          required
          aria-invalid={state.fieldErrors?.phone ? true : undefined}
        />
        {state.fieldErrors?.phone ? (
          <p className="mt-1 text-sm text-[var(--color-sand-600)]">
            {t("request.error_phone")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="service_slug">
            {t("request.service")}
          </label>
          <select
            ref={serviceRef}
            id="service_slug"
            name="service_slug"
            className="field"
            value={values.service_slug}
            onChange={set("service_slug")}
            required
          >
            <option value="">{t("request.choose")}</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.service_slug ? (
            <p className="mt-1 text-sm text-[var(--color-sand-600)]">
              {t("request.error_service")}
            </p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="district_slug">
            {t("request.district")}
          </label>
          <select
            ref={districtRef}
            id="district_slug"
            name="district_slug"
            className="field"
            value={values.district_slug}
            onChange={set("district_slug")}
          >
            <option value="">{t("request.choose")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="address">
          {t("request.address")}
        </label>
        <input
          id="address"
          name="address"
          className="field"
          value={values.address}
          onChange={set("address")}
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          {t("request.notes")}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="field"
          placeholder={t("request.notes_hint")}
          value={values.notes}
          onChange={set("notes")}
        />
      </div>

      {state.message ? (
        <p className="text-sm text-[var(--color-sand-600)]">{state.message}</p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
