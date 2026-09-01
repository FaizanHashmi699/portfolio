import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnquiryForm } from "@/components/enquiry-form";
import { createClient } from "@/lib/supabase/server";
import type { Programme } from "@/lib/types";

export const revalidate = 300;

async function getProgramme(slug: string): Promise<Programme | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Programme) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const programme = await getProgramme(slug);
  if (!programme) return { title: "Programme not found" };
  return { title: programme.title, description: programme.summary };
}

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const programme = await getProgramme(slug);
  if (!programme) notFound();

  const facts = [
    { label: "Ages", value: programme.age_range },
    { label: "When", value: programme.schedule },
    { label: "Fees", value: programme.fee_text },
    { label: "Teachers", value: programme.teacher_note },
  ].filter((f) => f.value);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <Link href="/programmes" className="text-sm text-ink-mute hover:text-brand">
          ← All programmes
        </Link>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-balance">
          {programme.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{programme.summary}</p>

        {facts.length > 0 && (
          <dl className="mt-8 grid gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="bg-surface p-5">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-mute">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {programme.body && (
          <div className="mt-10 max-w-2xl space-y-4 leading-relaxed text-ink-soft">
            {programme.body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        <section className="mt-14 rounded-sm border border-rule bg-surface p-7">
          <h2 className="font-display text-2xl font-medium tracking-tight">
            Enquire about a place
          </h2>
          <p className="mt-2 mb-6 max-w-xl text-sm text-ink-soft">
            Tell us a little about your child and we will let you know what is available.
          </p>
          <EnquiryForm programmeId={programme.id} programmeTitle={programme.title} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
