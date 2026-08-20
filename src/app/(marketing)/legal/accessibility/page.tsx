import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: `How ${brand.name} approaches accessibility, what we test, what we know is not yet right, and how to tell us.`,
  alternates: { canonical: "/legal/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-h1">Accessibility</h1>
        <p className="text-lead text-muted-foreground mt-4">
          A large share of our customers read this site in a second or third language,
          on a mid-range phone, often under time pressure. The failures that
          accessibility testing catches hurt those people first — so we treat it as a
          functional requirement, not a compliance exercise.
        </p>

        <section className="mt-12">
          <h2 className="text-h2">What we aim for</h2>
          <p className="text-muted-foreground mt-4">
            WCAG 2.1 Level AA. This is checked automatically on every commit: an
            accessibility scan runs against eleven key pages in continuous integration,
            and any serious or critical violation fails the build rather than being
            filed for later.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-h2">What that means in practice</h2>
          <ul className="text-muted-foreground mt-4 space-y-3">
            <li>
              <strong className="text-foreground">Keyboard.</strong> Every interactive
              element is reachable and operable by keyboard, with a visible focus ring.
              A skip link is the first thing you reach on every page.
            </li>
            <li>
              <strong className="text-foreground">Contrast.</strong> Body text meets
              4.5:1 and large text 3:1, in both light and dark themes. Our brand gold
              does not meet that on white, so it is used as a fill colour and never for
              body text — a separate darker token exists for that.
            </li>
            <li>
              <strong className="text-foreground">Motion.</strong> The animated hero is
              never loaded for anyone whose system requests reduced motion. The static
              version is a finished design in its own right, not a placeholder.
            </li>
            <li>
              <strong className="text-foreground">Structure.</strong> Real headings,
              real lists, real tables with captions and scoped headers. Form fields have
              proper labels, and errors are announced rather than only coloured red.
            </li>
            <li>
              <strong className="text-foreground">
                No JavaScript required to read.
              </strong>{" "}
              Content, including FAQ answers, is in the HTML. Menus and accordions are
              built on native elements that work before the page hydrates.
            </li>
            <li>
              <strong className="text-foreground">Direction.</strong> Arabic and Urdu
              render right-to-left, with layout driven by logical properties rather than
              mirrored by hand.
            </li>
          </ul>
        </section>

        {/*
          Naming known gaps is the part that makes the rest of an accessibility statement
          believable. A statement that claims full conformance with no exceptions is
          almost always describing an aspiration.
        */}
        <section className="mt-10">
          <h2 className="text-h2">What we know isn&apos;t right yet</h2>
          <ul className="text-muted-foreground mt-4 space-y-3">
            <li>
              Automated testing catches roughly a third of accessibility issues. We have
              not yet completed a manual audit with screen reader users, and we will not
              claim conformance we have not verified that way.
            </li>
            <li>
              Service descriptions, fees and legal text are English-only. Translating
              them badly would be worse than leaving them, but it does mean non-English
              speakers rely on the navigation being translated and the detail not being.
            </li>
            <li>
              Some data tables scroll horizontally on narrow screens. They are marked up
              correctly and are readable, but a genuinely responsive alternative would
              be better.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-h2">Tell us</h2>
          <p className="text-muted-foreground mt-4">
            If something on this site is difficult or impossible to use, please tell us
            and we will fix it. Email{" "}
            <a
              href={`mailto:${brand.email.support}`}
              className="text-primary underline underline-offset-4"
            >
              {brand.email.support}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              contact form
            </Link>
            . Say what you were trying to do and what got in the way — that is far more
            useful than a standard reference, and we will reply within one working day.
          </p>
          <p className="text-muted-foreground mt-4">
            If you need information from this site in another format, ask and we will
            provide it.
          </p>
        </section>
      </article>
    </Section>
  );
}
