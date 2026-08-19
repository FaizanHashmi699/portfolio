import { Section, SectionHeading } from "@/components/ui/section";
import type { Faq } from "@/content/faqs";

/**
 * Native <details> rather than a JS accordion: it is keyboard accessible and
 * screen-reader correct for free, it works before hydration, and search engines can read
 * the answers without executing anything.
 */
export function FaqSection({
  items,
  title = "Questions people actually ask",
  eyebrow = "FAQ",
}: {
  items: Faq[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <Section className="bg-surface">
      <SectionHeading eyebrow={eyebrow} title={title} />

      <div className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
        {items.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-h3 marker:hidden">
              {faq.question}
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
