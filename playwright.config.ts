import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Some sandboxes ship a preinstalled Chromium whose build number does not match the one
 * this Playwright version expects. Setting PLAYWRIGHT_CHROMIUM_EXECUTABLE points at it
 * directly; in CI the variable is unset and Playwright uses its own download.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const launch = executablePath ? { launchOptions: { executablePath } } : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...launch,
        // Rate limiting keys on the client IP. Every test otherwise arrives from
        // 127.0.0.1, so two projects running in parallel trip limits that a real pair
        // of users never would. A distinct forwarded IP per project models reality.
        extraHTTPHeaders: { "x-forwarded-for": "203.0.113.10" },
      },
    },
    // Our users are overwhelmingly on phones, so mobile is a first-class target
    // rather than an afterthought.
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        ...launch,
        extraHTTPHeaders: { "x-forwarded-for": "203.0.113.20" },
      },
    },
  ],

  webServer: {
    // Tests run against a production build: dev-only behaviour (unminified React,
    // no static optimisation) is not what we are shipping.
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
