/**
 * End-to-end smoke test for the paths that a unit test cannot reach:
 * the request form's server action, validation feedback, and the
 * directory → provider → request hand-off.
 *
 * Run against a started server:  npm start &  node scripts/smoke.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

// The environment ships Chromium at a fixed path; use it rather than
// downloading a matching build (see PLAYWRIGHT_BROWSERS_PATH).
const executablePath =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ locale: "ar-SA" });

try {
  // --- 1. Invalid phone must be rejected by the server action -------------
  await page.goto(`${BASE}/ar/request`, { waitUntil: "networkidle" });
  await page.fill("#customer_name", "فيصل");
  await page.fill("#phone", "12345"); // not a Saudi mobile
  await page.selectOption("#service_slug", "ac-repair");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const phoneError = await page
    .locator("text=الرجاء إدخال رقم جوال سعودي صحيح")
    .count();
  check("invalid phone is rejected", phoneError > 0, `error shown: ${phoneError}`);

  // Regression: React 19 resets a form after its action runs. The fields are
  // controlled precisely so a rejected submission does not wipe what the
  // customer already typed.
  await page.waitForSelector('button[type="submit"]:not([disabled])');
  const keptName = await page.inputValue("#customer_name");
  const keptService = await page.inputValue("#service_slug");
  check(
    "form keeps values after a validation error",
    keptName === "فيصل" && keptService === "ac-repair",
    `name="${keptName}" service="${keptService}"`,
  );

  // --- 2. Valid submission succeeds and returns a reference ---------------
  // The submit button disables itself while the action is in flight, so wait
  // for it to come back before clicking again.
  await page.waitForSelector('button[type="submit"]:not([disabled])');
  await page.fill("#phone", "0551234567");
  await page.click('button[type="submit"]');

  let succeeded = false;
  try {
    await page.waitForSelector('h2:has-text("تم استلام طلبك")', {
      state: "visible",
      timeout: 10000,
    });
    succeeded = true;
  } catch {
    succeeded = false;
  }
  check("valid submission succeeds", succeeded);

  const visible = await page.locator("main").innerText();
  const refMatch = visible.match(/L-[A-Z0-9]{6}/);
  check("reference number issued", Boolean(refMatch), refMatch?.[0] ?? "none");

  // Seed mode must be declared, not hidden.
  check(
    "seed mode disclosed on success",
    visible.includes("لم يتم حفظ هذا الطلب"),
  );

  // --- 3. Directory → provider → prefilled request ------------------------
  await page.goto(`${BASE}/ar/providers?service=ac-amc`, { waitUntil: "networkidle" });
  const cards = await page.locator('a[href^="/ar/providers/demo-"]').count();
  check("directory filters by service", cards > 0, `${cards} links`);

  await page.goto(`${BASE}/ar/request?provider=demo-jazeera`, { waitUntil: "networkidle" });
  const prefill = await page.locator('input[name="preferred_provider_slug"]').getAttribute("value");
  check("request prefills chosen provider", prefill === "demo-jazeera", prefill ?? "none");

  // --- 4. RTL/LTR direction actually applied -----------------------------
  const arDir = await page.getAttribute("html", "dir");
  check("arabic renders rtl", arDir === "rtl", arDir ?? "");

  await page.goto(`${BASE}/en/request`, { waitUntil: "networkidle" });
  const enDir = await page.getAttribute("html", "dir");
  check("english renders ltr", enDir === "ltr", enDir ?? "");

  // --- 5. No console errors on the main pages ----------------------------
  // Ignore failures for third-party assets (the sandbox blocks outbound
  // requests such as Google Fonts) and RSC prefetches aborted by navigation.
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    const url = r.url();
    const external = !url.startsWith(BASE);
    const prefetchAbort = url.includes("_rsc=");
    if (!external && !prefetchAbort) {
      errors.push(`requestfailed: ${url} ${r.failure()?.errorText ?? ""}`);
    }
  });
  for (const path of ["/ar", "/ar/providers", "/ar/providers/demo-nasim", "/en"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  }
  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
