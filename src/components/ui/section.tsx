import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  /**
   * Every page needs exactly one h1. Where this component *is* the page title rather
   * than a section within it, pass `as="h1"` — otherwise the page ships with no h1 at
   * all, which hurts both screen reader navigation and search engines.
   */
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-accent-text mb-3 text-sm font-semibold tracking-[0.14em] uppercase">
          {eyebrow}
        </p>
      )}
      <Heading className={Heading === "h1" ? "text-h1" : "text-h2"}>{title}</Heading>
      {description && (
        <p className="text-lead text-muted-foreground mt-4">{description}</p>
      )}
    </div>
  );
}
