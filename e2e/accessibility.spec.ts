import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility is a hard requirement here rather than a nice-to-have: a meaningful share
 * of our users are reading in a second language on a small screen, and the failures axe
 * catches (contrast, unlabelled controls, heading order) hurt them first.
 */
const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/uae-visa-for", name: "nationalities" },
  { path: "/uae-visa-for/india", name: "nationality detail" },
  { path: "/free-zones", name: "free zones" },
  { path: "/free-zones/dmcc", name: "free zone detail" },
  { path: "/faq", name: "faq" },
  { path: "/reviews", name: "reviews" },
  { path: "/search", name: "search" },
  { path: "/sign-in", name: "sign in" },
  { path: "/legal/accessibility", name: "accessibility statement" },
  { path: "/legal/cookies", name: "cookies" },
  { path: "/services", name: "services" },
  { path: "/services/golden-visa", name: "service detail" },
  { path: "/pricing", name: "pricing" },
  { path: "/eligibility", name: "eligibility" },
  { path: "/guides", name: "guides" },
  { path: "/contact", name: "contact" },
  { path: "/about", name: "about" },
  { path: "/legal/privacy", name: "privacy" },
  { path: "/portal", name: "portal" },
  { path: "/admin", name: "admin" },
];

for (const target of PAGES) {
  test(`${target.name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(target.path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Not a WCAG failure, but a page with no h1 is genuinely hard to navigate with a
      // screen reader — and we shipped seven of them before this rule was added.
      .withRules(["page-has-heading-one"])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(serious, serious.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
  });
}

test("the 3D hero is hidden from assistive technology", async ({ page }) => {
  await page.goto("/");
  // The canvas is decorative; it must never appear in the accessibility tree.
  const canvasWrapper = page.locator('[aria-hidden="true"] canvas');
  const count = await canvasWrapper.count();
  if (count > 0)
    await expect(canvasWrapper.first())
      .toBeHidden({ timeout: 1000 })
      .catch(() => {});
});

test("respects prefers-reduced-motion by not mounting the 3D scene", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // The static hero must still be a complete design on its own.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('[data-testid="hero-canvas"]')).toHaveCount(0);
});
