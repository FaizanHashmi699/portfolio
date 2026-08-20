import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Cookies",
  description: `Which cookies ${brand.name} sets, why, and why there is no consent banner on this site.`,
  alternates: { canonical: "/legal/cookies" },
};

const cookies = [
  {
    name: "theme",
    purpose: "Remembers whether you chose the light or dark appearance.",
    duration: "1 year",
    kind: "Functional",
  },
  {
    name: "sb-* (Supabase auth)",
    purpose:
      "Keeps you signed in to your portal. Without it you would have to sign in on every page.",
    duration: "Session and refresh token lifetime",
    kind: "Strictly necessary",
  },
  {
    name: "maqam-demo-role",
    purpose:
      "Only present in demo mode, where it remembers whether you are viewing the customer portal or the staff console.",
    duration: "Session",
    kind: "Functional",
  },
];

export default function CookiesPage() {
  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-h1">Cookies</h1>

        {/*
          The honest version of a cookie page. Most exist to justify a banner; this one
          exists to explain why there isn't one.
        */}
        <p className="text-lead text-muted-foreground mt-4">
          There is no consent banner on this site. Not because we found a loophole —
          because we do not set anything that requires consent.
        </p>

        <section className="mt-12">
          <h2 className="text-h2">What we don&apos;t do</h2>
          <ul className="text-muted-foreground mt-4 space-y-3">
            <li>No advertising or retargeting pixels. None.</li>
            <li>
              No third-party analytics, tag manager, session recorder or chat widget.
            </li>
            <li>No cross-site tracking, no data brokers, no audience sharing.</li>
            <li>
              No third-party scripts at all. The content security policy on this site
              would block them.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-h2">How we count visits instead</h2>
          <p className="text-muted-foreground mt-4">
            We keep basic page-view numbers so we know which guides are worth writing.
            It is first-party and cookieless. Rather than storing an identifier, we
            derive a short-lived hash from your IP address and browser mixed with a
            secret that is regenerated whenever our server restarts and is never written
            down. Once it rotates, yesterday&apos;s hashes cannot be matched to
            today&apos;s.
          </p>
          <p className="text-muted-foreground mt-4">
            The practical effect is that we can see roughly how many people read a page,
            and we cannot see who they were or follow them between visits. That is a
            real limitation for us — it rules out funnels and cohorts — and it is the
            trade we chose deliberately for a site whose visitors are largely migrants.
          </p>
          <p className="text-muted-foreground mt-4">
            Pages inside your portal and the staff console are never recorded at all.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-h2">The cookies we do set</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-border-strong border-b text-left">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Cookie
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Purpose
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Duration
                  </th>
                  <th scope="col" className="py-3 font-medium">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {cookies.map((cookie) => (
                  <tr key={cookie.name}>
                    <td className="py-3 pr-4 font-mono text-xs">{cookie.name}</td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {cookie.purpose}
                    </td>
                    <td className="text-muted-foreground py-3 pr-4">
                      {cookie.duration}
                    </td>
                    <td className="py-3">{cookie.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            All of these are strictly necessary or functional. Under UAE, UK and EU
            rules none of them require consent, which is why you are not being asked for
            any.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-h2">If that ever changes</h2>
          <p className="text-muted-foreground mt-4">
            If we ever add something that genuinely needs consent, you will get a real
            choice with a working reject button — not a pre-ticked dialogue. This page
            will be updated before it ships, not after.
          </p>
          <p className="text-muted-foreground mt-4">
            See also the{" "}
            <Link
              href="/legal/privacy"
              className="text-primary underline underline-offset-4"
            >
              privacy policy
            </Link>
            .
          </p>
        </section>
      </article>
    </Section>
  );
}
