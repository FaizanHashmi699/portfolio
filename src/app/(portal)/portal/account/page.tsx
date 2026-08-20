import type { Metadata } from "next";
import Link from "next/link";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { AccountForms } from "@/components/portal/account-forms";
import { requireUser } from "@/server/auth";
import { features } from "@/server/env";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <Section className="py-10">
      <h1 className="text-h1">Account settings</h1>
      <p className="text-muted-foreground mt-2">
        Your details, your notification preferences, and your data.
      </p>

      <div className="mt-10 max-w-2xl space-y-6">
        <AccountForms
          initialName={user.name}
          initialEmail={user.email}
          isDemo={user.isDemo}
        />

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-display text-h3 flex items-center gap-2.5">
              <ShieldCheck className="text-primary size-5" />
              Security
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Password</dt>
                <dd>
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Change password
                  </Link>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Account type</dt>
                <dd>
                  <Badge tone="neutral">{user.role}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Authentication</dt>
                <dd>{features.database ? "Email and password" : "Demo mode — none"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/*
          Data rights are a legal obligation under the UAE PDPL, and burying them behind a
          support email is the standard way of technically complying while practically
          discouraging use. They belong on the settings page.
        */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-display text-h3">Your data</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              You can ask for a copy of everything we hold about you, or ask us to
              delete it, at any time. We answer within 30 days. Where a legal obligation
              requires us to keep a record, we tell you which one and delete the rest.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${brand.email.support}?subject=Data%20export%20request`}
                className="border-border hover:bg-surface inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <Download className="size-4" />
                Request my data
              </a>
              <a
                href={`mailto:${brand.email.support}?subject=Account%20deletion%20request`}
                className="border-danger-500/40 text-danger-600 dark:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <Trash2 className="size-4" />
                Delete my account
              </a>
            </div>

            <p className="text-muted-foreground mt-4 text-sm">
              Read the{" "}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                privacy policy
              </Link>{" "}
              for what we hold and for how long.
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
