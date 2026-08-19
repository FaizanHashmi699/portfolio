import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /* The single most important action on any screen. Gold, and rare. */
        primary:
          "bg-accent text-accent-foreground shadow-sm hover:brightness-105 hover:shadow-md",
        /* The default action. Brand blue. */
        solid:
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110 hover:shadow-md",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-surface",
        ghost: "bg-transparent text-foreground hover:bg-surface",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto rounded-none",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

type BaseProps = VariantProps<typeof buttonVariants> & { className?: string };

export type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export type ButtonLinkProps = BaseProps &
  React.ComponentProps<typeof Link>;

/** A link that looks like a button. Kept distinct so navigation stays a real anchor. */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
