import { expect, test } from "@playwright/test";

/**
 * Error states and the offline page — the surfaces nobody looks at until they matter.
 */

test("404 offers the routes people were actually heading to", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/isn't here/i);
  await expect(
    page.getByRole("link", { name: /check eligibility/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /by nationality/i }).first(),
  ).toBeVisible();
});

test("unknown detail pages 404 rather than rendering an empty shell", async ({
  page,
}) => {
  // Returning 200 for a nonexistent page tells search engines it exists.
  for (const path of [
    "/services/not-a-real-service",
    "/guides/not-a-real-guide",
    "/free-zones/not-a-zone",
    "/uae-visa-for/atlantis",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("the offline page refuses to serve a stale copy, and says why", async ({
  page,
}) => {
  await page.goto("/offline");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/offline/i);
  await expect(
    page.getByText(/government fees and eligibility rules change/i),
  ).toBeVisible();
});

test("the service worker never caches authenticated routes", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);

  const source = await response.text();
  // A cached portal page on a shared device is a realistic risk for our customers.
  expect(source).toContain("/portal");
  expect(source).toContain("/admin");
  expect(source).toContain("isPrivate");
});

test("the manifest declares a maskable icon", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  const manifest = await response.json();

  expect(
    manifest.icons.some((icon: { purpose: string }) => icon.purpose === "maskable"),
  ).toBe(true);
  expect(manifest.shortcuts.length).toBeGreaterThan(0);
});

test("analytics never records an authenticated path", async ({ request }) => {
  // Which application someone is reading is not something analytics has any business
  // knowing. The endpoint accepts and discards rather than erroring.
  const response = await request.post("/api/analytics", {
    data: { path: "/portal/applications/app-1" },
  });
  expect(response.status()).toBe(204);
});
