import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-muted-foreground border border-border",
        brand: "bg-ink-50 text-ink-700 dark:bg-ink-950 dark:text-ink-200",
        accent: "bg-sand-100 text-sand-800 dark:bg-sand-900/40 dark:text-sand-200",
        success:
          "bg-success-50 text-success-900 dark:bg-success-900/30 dark:text-success-50",
        warning:
          "bg-warning-50 text-warning-900 dark:bg-warning-900/30 dark:text-warning-50",
        danger:
          "bg-danger-50 text-danger-900 dark:bg-danger-900/30 dark:text-danger-50",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
