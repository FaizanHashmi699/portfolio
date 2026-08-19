import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * The mark is a stylised arch — the shape shared by a doorway, a passport stamp and
 * Islamic architecture — sitting on a baseline. "Maqam" means a place or standing;
 * the logo is a threshold you are about to cross.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group", className)}
      aria-label={`${brand.name} home`}
    >
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 27V15a10 10 0 0 1 20 0v12"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M13 27v-11a3 3 0 0 1 6 0v11"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="text-accent"
        />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">
        {brand.name}
      </span>
    </Link>
  );
}
