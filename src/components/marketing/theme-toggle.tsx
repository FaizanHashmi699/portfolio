"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Both icons are always rendered and CSS picks the visible one from the `dark` class on
 * <html>. That avoids a mounted flag entirely: the server and client render identical
 * markup, so there is no hydration mismatch and no icon flash on first paint.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      aria-label="Toggle between light and dark theme"
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
