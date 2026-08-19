import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with correct conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as an AED currency string. */
export function formatAed(amount: number, locale = "en-AE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date, locale = "en-AE"): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Stable slug for URLs and ids. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
