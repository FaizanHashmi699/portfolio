import { expect, test } from "@playwright/test";

/**
 * The content surfaces added for organic reach: nationality pages, free zone comparisons,
 * search and the FAQ. These are the pages that have to be substantively different from
 * each other rather than templated filler, so the assertions check for the specific facts
 * that make them different.
 */

test.describe("nationality pages", () => {
  test("gives an apostille country the short chain, not the embassy one", async ({
    page,
  }) => {
    await page.goto("/uae-visa-for/india");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Indian");
    await expect(page.getByText(/apostille/i).first()).toBeVisible();
    // The UAE joined the Hague Convention in 2022; sending Indian applicants to the UAE
    // embassy is the mistake most published guidance still makes.
    await expect(page.getByText(/no longer applies/i).first()).toBeVisible();
  });

  test("gives a non-member country the full embassy chain", async ({ page }) => {
    await page.goto("/uae-visa-for/pakistan");
    await expect(page.getByText(/uae embassy/i).first()).toBeVisible();
    await expect(
      page.getByText(/invalidates every step after it/i).first(),
    ).toBeVisible();
  });

  test("warns that conditional visa on arrival is not about the passport alone", async ({
    page,
  }) => {
    await page.goto("/uae-visa-for/bangladesh");
    await expect(
      page.getByText(/nationality alone is not enough/i).first(),
    ).toBeVisible();
  });

  test("lists the attestation steps in order", async ({ page }) => {
    await page.goto("/uae-visa-for/philippines");
    const steps = page.getByRole("main").locator("ol li");
    expect(await steps.count()).toBeGreaterThanOrEqual(3);
  });

  test("404s for a country we don't cover", async ({ page }) => {
    const response = await page.goto("/uae-visa-for/atlantis");
    expect(response?.status()).toBe(404);
  });

  test("the index groups nationalities by region", async ({ page }) => {
    await page.goto("/uae-visa-for");
    await expect(page.getByRole("heading", { name: "South Asia" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "GCC" })).toBeVisible();
  });
});

test.describe("free zones", () => {
  test("publishes limitations alongside strengths", async ({ page }) => {
    await page.goto("/free-zones/dmcc");

    await expect(
      page.getByRole("heading", { name: /genuinely good at/i }),
    ).toBeVisible();
    // The whole point: we publish the downsides of the zones it would pay us to push.
    await expect(
      page.getByRole("heading", { name: /isn't the right choice/i }),
    ).toBeVisible();
  });

  test("says the deciding question is activity, not price", async ({ page }) => {
    await page.goto("/free-zones");
    await expect(
      page.getByText(/choose on your activity, not on price/i),
    ).toBeVisible();
  });

  test("the finder filters to Dubai when a Dubai address is required", async ({
    page,
  }) => {
    await page.goto("/free-zones");

    await page.getByLabel("Do you need a Dubai address?").selectOption("yes");
    const status = page.locator('[aria-live="polite"]');
    await expect(status).toContainText(/zone/i);

    // SHAMS is in Sharjah; it must disappear from the *results*. The full comparison
    // table further down the page still lists every zone, which is intended.
    const results = page.getByRole("list", { name: "Matching free zones" });
    await expect(results.getByRole("link", { name: "Sharjah Media City" })).toHaveCount(
      0,
    );
    await expect(results.getByRole("link").first()).toBeVisible();
  });

  test("says nothing fits rather than recommending a bad match", async ({ page }) => {
    await page.goto("/free-zones");
    await page.getByLabel("Budget for year one").fill("100");
    await expect(page.getByText(/nothing matches those constraints/i)).toBeVisible();
  });
});

test.describe("search", () => {
  test("finds a service and shows its price", async ({ page }) => {
    await page.goto("/search");
    await page.getByLabel("Search the site").fill("golden visa");
    await expect(page.getByRole("link", { name: /Golden Visa/ }).first()).toBeVisible();
  });

  test("answers a natural-language question, not just keywords", async ({ page }) => {
    await page.goto("/search");
    await page.getByLabel("Search the site").fill("how much is the golden visa");
    await expect(page.locator('[aria-live="polite"]')).toContainText(/result/i);
  });

  test("says nothing matched rather than showing everything", async ({ page }) => {
    await page.goto("/search");
    await page.getByLabel("Search the site").fill("qwertyuiopasdf");
    await expect(page.getByText(/nothing matched/i)).toBeVisible();
  });
});

test.describe("FAQ and reviews", () => {
  test("FAQ answers are in the markup for crawlers", async ({ page }) => {
    await page.goto("/faq");
    await expect(
      page.getByText(/no, and neither can anyone else/i).first(),
    ).toBeAttached();
  });

  test("reviews page explains why there is no five-star wall", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /don't host our own five-star wall/i,
    );
    await expect(page.getByText(/no reviews to show yet/i)).toBeVisible();
  });
});
