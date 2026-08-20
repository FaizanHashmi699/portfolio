import { expect, test } from "@playwright/test";

/**
 * The portal runs in demo mode in CI (no Supabase credentials), which is exactly the
 * configuration a new contributor gets on checkout. Testing it here means the
 * zero-credential path stays working.
 */

test.describe("customer portal", () => {
  test("makes demo mode unmistakable", async ({ page }) => {
    await page.goto("/portal");
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test("lists applications and flags the ones needing attention", async ({ page }) => {
    await page.goto("/portal");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hello");
    // Scoped to main: the notification bell also mentions these references, and its
    // dropdown contents are in the DOM but hidden.
    const main = page.getByRole("main");
    await expect(main.getByText("MQ-2026-0417").first()).toBeVisible();
    await expect(main.getByRole("heading", { name: /to fix/i })).toBeVisible();
  });

  test("shows the glass-box timeline on an application", async ({ page }) => {
    await page.goto("/portal");
    await page
      .getByRole("link", { name: /employment visa/i })
      .first()
      .click();

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: /progress/i })).toBeVisible();
    await expect(main.getByText(/under review by mohre/i).first()).toBeVisible();
    // Whose turn it is must be visible, not inferred.
    await expect(main.getByText("Authority").first()).toBeVisible();
  });

  test("scores rejection risk and gives a fix for every finding", async ({ page }) => {
    // MQ-2026-0431 is seeded with a short-validity passport and a broken
    // attestation chain, so it must fail closed.
    await page.goto("/portal");
    await page
      .getByRole("link", { name: /family sponsorship/i })
      .first()
      .click();

    await expect(page.getByRole("heading", { name: /rejection risk/i })).toBeVisible();
    await expect(
      page.getByText(/attestation chain is incomplete/i).first(),
    ).toBeVisible();
    // The fix text must name the steps in plain language, not internal slugs.
    await expect(page.getByText(/UAE embassy in that country/i)).toBeVisible();
    await expect(
      page.getByText(/legalisation must be completed in order/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/won't submit while a blocker/i)).toBeVisible();
  });

  test("a clean application reports nothing flagged", async ({ page }) => {
    // MQ-2026-0417 is seeded complete and in progress.
    await page.goto("/portal/applications/app-1");
    await expect(page.getByRole("heading", { name: /rejection risk/i })).toBeVisible();
    await expect(page.getByText(/nothing flagged/i)).toBeVisible();
  });

  test("a decided application does not show rejection risk at all", async ({
    page,
  }) => {
    // MQ-2026-0388 was approved a month ago. Flagging "blockers" on an issued visa
    // would be alarming and meaningless.
    await page.goto("/portal/applications/app-3");
    await expect(page.getByText(/visa issued/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /rejection risk/i })).toHaveCount(0);
  });
});

test.describe("admin console", () => {
  test("shows pipeline stats and the active storage driver", async ({ page }) => {
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible();
    await expect(page.getByText("Open applications")).toBeVisible();
    await expect(page.getByText("in-memory")).toBeVisible();
  });

  test("surfaces applications blocked on documents", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: /blocked on documents/i }),
    ).toBeVisible();
  });

  test("requires an explanation before a status can change", async ({ page }) => {
    await page.goto("/admin/applications/app-2");

    await expect(page.getByRole("heading", { name: /update status/i })).toBeVisible();
    // The customer-visible headline and description are both required fields.
    await expect(page.getByLabel("Headline")).toHaveAttribute("required", "");
    await expect(page.getByLabel("What happened")).toHaveAttribute("required", "");
  });

  test("records a status change onto the customer's timeline", async ({ page }) => {
    // The in-memory store is shared across the whole server process, so a fixed
    // headline would collide with the same test running in another project.
    const headline = `Reopened for a document check ${Date.now()}`;

    await page.goto("/admin/applications/app-1");

    await page.getByLabel("New status").selectOption("in-review");
    await page.getByLabel("Headline").fill(headline);
    await page
      .getByLabel("What happened")
      .fill("We are re-checking one document. Nothing is needed from you.");
    await page.getByRole("button", { name: /update status/i }).click();

    await expect(page.getByRole("status")).toContainText(/updated/i);
    await expect(page.getByText(headline)).toBeVisible();

    // And the customer sees the same event on their own timeline.
    await page.goto("/portal/applications/app-1");
    await expect(page.getByText(headline)).toBeVisible();
  });
});
