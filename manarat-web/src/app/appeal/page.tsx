import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CampaignProgress } from "@/components/campaign-progress";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our appeal",
  description:
    "The Manarat Expansion — extending the prayer hall and building dedicated classrooms for Sheldon and Solihull.",
};

export const revalidate = 60;

export default async function AppealPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_primary", true)
    .eq("published", true)
    .maybeSingle();

  const appeal = data as Campaign | null;
  if (!appeal) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">Our current appeal</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {appeal.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{appeal.summary}</p>

        <div className="mt-10 rounded-sm border border-rule bg-surface p-7">
          <CampaignProgress raisedPence={appeal.raised_pence} targetPence={appeal.target_pence} />
          <Link
            href="/donate"
            className="mt-6 inline-block rounded-sm bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-deep"
          >
            Give to this appeal
          </Link>
        </div>

        {appeal.body && (
          <div className="mt-12 max-w-2xl space-y-4 leading-relaxed text-ink-soft">
            {appeal.body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
