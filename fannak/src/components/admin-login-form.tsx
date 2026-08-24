"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginAction, type ActionState } from "@/app/[locale]/admin/actions";

export function AdminLoginForm({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "ok") router.replace(`/${locale}/admin`);
  }, [state.status, locale, router]);

  return (
    <form action={action} className="card grid gap-3 p-5">
      <div>
        <label className="label" htmlFor="key">
          {t("admin.access_key")}
        </label>
        <input id="key" name="key" type="password" className="field" required autoFocus />
      </div>
      {state.status === "error" ? (
        <p className="text-sm text-[var(--color-sand-600)]">
          {t("admin.invalid_key")}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary">
        {t("admin.sign_in")}
      </button>
    </form>
  );
}
