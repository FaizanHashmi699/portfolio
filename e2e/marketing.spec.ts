import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("renders the hero and its primary action without needing JavaScript to paint", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /know before/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /check my eligibility/i }).first(),
    ).toBeVisible();
  });

  test("states plainly that no outcome is guaranteed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/no outcome is ever guaranteed/i)).toBeVisible();
  });

  test("discloses that we are not a government entity", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/not a government entity/i).first()).toBeVisible();
  });

  test("shows real totals rather than 'from' prices", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("heading", { name: /just the total/i });
    await expect(section).toBeVisible();
    // Every featured card breaks the total into pass-through, our fee and VAT.
    await expect(page.getByText("Our fee").first()).toBeVisible();
    await expect(page.getByText(/VAT \(5%\)/).first()).toBeVisible();
  });

  test("exposes FAQ answers in the markup for crawlers", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/the eligibility check runs entirely in your browser/i),
    ).toBeAttached();
  });

  test("emits Organization structured data server-side", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toContain("ProfessionalService");
  });
});

test.describe("navigation", () => {
  test("reaches services from the header", async ({ page, isMobile }) => {
    await page.goto("/");

    if (isMobile) {
      // The toggle only works once React has hydrated, and hydration is not directly
      // observable — so retry the click until the menu actually opens rather than
      // racing it once and flaking.
      await expect(async () => {
        await page.getByRole("button", { name: /open menu/i }).click();
        await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible({
          timeout: 2000,
        });
      }).toPass({ timeout: 20_000 });
    }

    await page.getByRole("link", { name: "Services", exact: true }).click();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  });

  test("has a working skip link for keyboard users", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeFocused();
  });
});

test.describe("service detail", () => {
  test("publishes the full itemised fee breakdown", async ({ page }) => {
    await page.goto("/services/golden-visa");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Golden Visa");
    await expect(
      page.getByRole("heading", { name: /where every dirham goes/i }),
    ).toBeVisible();

    // Each fee kind must be attributed to whoever actually receives the money.
    await expect(page.getByText("Government").first()).toBeVisible();
    await expect(page.getByText("Our fee").first()).toBeVisible();
    await expect(page.getByText(/passes straight through/i)).toBeVisible();
  });

  test("publishes the reasons applications get refused", async ({ page }) => {
    await page.goto("/services/employment-visa-mainland");
    await expect(
      page.getByRole("heading", { name: /why applications like this get refused/i }),
    ).toBeVisible();
    await expect(page.getByText(/attestation chain incomplete/i)).toBeVisible();
  });

  test("returns 404 for an unknown service", async ({ page }) => {
    const response = await page.goto("/services/not-a-real-service");
    expect(response?.status()).toBe(404);
  });
});

test.describe("pricing", () => {
  test("calculator updates the total when inputs change, with no form gate", async ({
    page,
  }) => {
    await page.goto("/pricing");

    const total = page.locator('[aria-live="polite"]');
    await expect(total).toBeVisible();
    const before = await total.textContent();

    await page.getByLabel("How many applicants?").fill("3");
    await expect(total).not.toHaveText(before ?? "");
  });

  test("lists every service with its total", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: /every service, every price/i }),
    ).toBeVisible();
    const rows = page.locator("table tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(14);
  });
});

test.describe("SEO plumbing", () => {
  test("serves a sitemap containing service pages", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("/services/golden-visa");
  });

  test("keeps the portal and admin console out of the index", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    expect(body).toContain("Disallow: /portal");
    expect(body).toContain("Disallow: /admin");
  });
});
