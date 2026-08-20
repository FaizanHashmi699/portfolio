import Link from "next/link";
import { AlertTriangle, Check, Database, Mail, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { requireStaff } from "@/server/auth";
import { getRepositories } from "@/server/repositories";
import { features } from "@/server/env";
import { brand } from "@/config/brand";
import { RULES_VERSION } from "@/domain/eligibility/rules/routes";
import { services } from "@/domain/catalog/services";
import { countries } from "@/domain/geography/countries";
import { freeZones } from "@/domain/geography/free-zones";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireStaff();
  const { driver } = await getRepositories();

  const integrations = [
    {
      icon: Database,
      name: "Supabase",
      on: features.database,
      onText: "Connected — applications, documents and invoices persist.",
      offText:
        "Not configured. Running on seeded in-memory data; nothing survives a restart.",
      env: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    {
      icon: Sparkles,
      name: "Anthropic",
      on: features.ai,
      onText: "Connected — eligibility results are explained in plain language.",
      offText:
        "Not configured. Explanations fall back to deterministic templates. Eligibility itself is unaffected: the rules engine decides either way.",
      env: "ANTHROPIC_API_KEY",
    },
    {
      icon: Mail,
      name: "Resend",
      on: features.email,
      onText: "Connected — transactional email is delivered.",
      offText:
        "Not configured. Emails are logged to the server console instead of sent, which is what you want locally.",
      env: "RESEND_API_KEY, RESEND_FROM_EMAIL",
    },
  ];

  return (
    <Section className="py-10">
      <h1 className="text-h1">Settings</h1>
      <p className="text-muted-foreground mt-2">
        What this deployment is currently running against.
      </p>

      <h2 className="text-h2 mt-10">Integrations</h2>
      <ul className="mt-5 grid max-w-4xl gap-4 md:grid-cols-3">
        {integrations.map((integration) => (
          <li key={integration.name}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 font-medium">
                    <integration.icon className="text-primary size-5" />
                    {integration.name}
                  </span>
                  {integration.on ? (
                    <Badge tone="success">
                      <Check /> On
                    </Badge>
                  ) : (
                    <Badge tone="neutral">
                      <X /> Off
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {integration.on ? integration.onText : integration.offText}
                </p>
                <p className="text-muted-foreground mt-3 font-mono text-xs">
                  {integration.env}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="text-h2 mt-10">Data in this build</h2>
      <div className="mt-5 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Storage driver", value: driver },
          { label: "Rules version", value: RULES_VERSION },
          { label: "Services", value: String(services.length) },
          { label: "Countries", value: String(countries.length) },
          { label: "Free zones", value: String(freeZones.length) },
          { label: "VAT rate", value: `${brand.vatRate * 100}%` },
          { label: "Currency", value: brand.currency },
          { label: "Trade licence", value: brand.licenceNumber },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{item.label}</p>
              <p className="font-display mt-1.5 text-lg font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/*
        Business configuration lives in version-controlled code, not in a database table an
        operator can edit at 2am. Fees and eligibility thresholds are legally consequential
        and belong in a reviewed, diffable change with a test attached.
      */}
      <Card className="border-warning-500/50 mt-10 max-w-3xl">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="text-warning-600 mt-0.5 size-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">
              Fees and eligibility rules are not editable from this screen, by design.
            </p>
            <p className="text-muted-foreground mt-1.5">
              They live in version control as effective-dated data, so every change
              carries an author, a date, a cited source and a test. A wrong threshold
              here can cost a customer a non-refundable government fee — that is not a
              change anyone should be able to make from a settings form without review.
            </p>
            <p className="text-muted-foreground mt-2.5">
              To change one, edit{" "}
              <code className="font-mono text-xs">src/domain/catalog/services.ts</code>{" "}
              or{" "}
              <code className="font-mono text-xs">
                src/domain/eligibility/rules/routes.ts
              </code>
              , bump <code className="font-mono text-xs">RULES_VERSION</code>, and open
              a pull request. See{" "}
              <Link href="/legal/disclaimer" className="text-primary hover:underline">
                the disclaimer
              </Link>{" "}
              for how figures are presented to customers.
            </p>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
