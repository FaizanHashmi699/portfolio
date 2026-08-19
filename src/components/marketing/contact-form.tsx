"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitContact, type ActionState } from "@/server/actions/leads";
import { pillars } from "@/domain/catalog/pillars";
import { services } from "@/domain/catalog/services";

const INITIAL: ActionState = { status: "idle" };

export function ContactForm({ initialService }: { initialService?: string }) {
  const [state, action, pending] = useActionState(submitContact, INITIAL);

  if (state.status === "success") {
    return (
      <Card className="border-success-500/40">
        <CardContent className="flex items-start gap-3 pt-6">
          <CheckCircle2 className="text-success-500 mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">{state.message}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              If it&apos;s urgent, WhatsApp is faster than email.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={state.errors?.name?.[0]}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" error={state.errors?.email?.[0]}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Phone"
          htmlFor="phone"
          hint="Optional — we'll only call if you ask us to."
          error={state.errors?.phone?.[0]}
        >
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
        <Field label="What's this about?" htmlFor="serviceSlug">
          <Select
            id="serviceSlug"
            name="serviceSlug"
            defaultValue={initialService ?? ""}
          >
            <option value="">Not sure yet</option>
            {pillars.map((pillar) => (
              <optgroup key={pillar.slug} label={pillar.name}>
                {services
                  .filter((s) => s.pillar === pillar.slug)
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="How can we help?"
        htmlFor="message"
        hint="The more specific you are, the more useful our first reply will be."
        error={state.errors?.message?.[0]}
      >
        <Textarea id="message" name="message" required minLength={10} rows={6} />
      </Field>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-danger-600 dark:text-danger-500 text-sm">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>

      <p className="text-muted-foreground text-sm">
        We reply within one working day. We never sell your details, and we won&apos;t
        add you to a marketing list from this form.
      </p>
    </form>
  );
}
