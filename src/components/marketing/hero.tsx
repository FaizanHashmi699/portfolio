import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { HeroCanvas } from "@/components/three/hero-canvas";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-slate-50">
      {/*
        The static layer. This is a finished design, not a placeholder — it is what the
        crawler indexes, what renders on a slow connection, and what a reduced-motion
        user keeps. The 3D canvas only ever layers on top of it.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,oklch(0.417_0.129_257)_0%,oklch(0.186_0.048_259)_45%,oklch(0.146_0.010_260)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_60%_at_70%_100%,oklch(0.552_0.104_66/0.35)_0%,transparent_70%)]"
      />

      <HeroCanvas />

      {/* Keeps text contrast at AA no matter what the canvas is doing behind it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/80"
      />

      <div className="relative container-page py-24 md:py-36">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-sand-400" />
            <span>
              The UAE now screens applications with AI.{" "}
              <span className="text-slate-300">So do we — first.</span>
            </span>
          </p>

          <h1 className="mt-6 text-display font-semibold">
            Know before
            <br />
            <span className="text-gradient">you owe.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lead text-slate-300">
            Check which UAE visa you qualify for in about two minutes — no phone
            number, no sales call, no obligation. Then see the full cost broken down
            to the dirham, before you commit to anything.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/eligibility" variant="primary" size="lg">
              Check my eligibility
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/pricing"
              size="lg"
              className="border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
            >
              See every fee
            </ButtonLink>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="size-4 shrink-0 text-success-500" />
            Free, and you keep the result.{" "}
            <Link href="/legal/disclaimer" className="underline underline-offset-4 hover:text-slate-200">
              No outcome is ever guaranteed.
            </Link>
          </p>
        </div>
      </div>

      {/* Fade the hero into the page rather than ending it with a hard edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}
