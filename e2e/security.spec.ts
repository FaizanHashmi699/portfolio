import { expect, test } from "@playwright/test";

/**
 * Regression guard for the whole class of "the page renders but nothing works" bugs.
 *
 * A misconfigured Content Security Policy blocks every script while leaving the
 * server-rendered HTML looking perfectly correct. Content assertions all still pass; the
 * site just ships dead. That happened here once, and only a test that exercised a client
 * component caught it — so these tests assert it directly and loudly.
 */

const PAGES = [
  "/",
  "/services",
  "/pricing",
  "/eligibility",
  "/guides",
  "/portal",
  "/admin",
];

for (const path of PAGES) {
  test(`${path} loads with no console or CSP errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(`Uncaught: ${error.message}`));

    await page.goto(path, { waitUntil: "networkidle" });

    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test("React actually hydrates — a client component responds to interaction", async ({
  page,
}) => {
  await page.goto("/");

  const toggle = page.getByRole("button", {
    name: /toggle between light and dark theme/i,
  });
  await expect(toggle).toBeVisible();

  const before = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );

  // If scripts are blocked this click does nothing and the assertion below fails.
  await expect(async () => {
    await toggle.click();
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(after).toBe(!before);
  }).toPass({ timeout: 15_000 });
});

test("sends the security headers we rely on", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["content-security-policy"]).toContain("base-uri 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});

test("never allows an intermediary to cache pages that render customer data", async ({
  request,
}) => {
  for (const path of ["/portal", "/admin"]) {
    const response = await request.get(path);
    expect(response.headers()["cache-control"], path).toContain("no-store");
  }
});

test("does not leak server-only configuration into the client bundle", async ({
  page,
}) => {
  await page.goto("/");
  const leaked = await page.evaluate(() => {
    const source = document.documentElement.outerHTML;
    return [
      "SUPABASE_SERVICE_ROLE_KEY",
      "ANTHROPIC_API_KEY",
      "RESEND_API_KEY",
      "sk-ant-",
    ].filter((needle) => source.includes(needle));
  });
  expect(leaked).toEqual([]);
});
