/**
 * Language purity.
 *
 * Each locale must render in one language only. This walks every surface in
 * both locales and fails if the wrong script appears in the page body, which
 * catches the leaks a human reviewer misses: untranslated status enums, raw
 * server error strings, and hardcoded labels.
 *
 * Requires the server to run with ADMIN_ACCESS_KEY and FANNAK_SECRET set.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const KEY = process.env.ADMIN_ACCESS_KEY ?? "test-admin-key";
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]/;

/**
 * Text that is legitimately script-neutral and must not count as a leak:
 * identifiers, phone numbers, prices, and the brand's own Latin name.
 */
function stripNeutral(text) {
  return (
    text
      // URLs first: stripping digits earlier would break "localhost:4200"
      // apart and leave the path behind, which then reads as English words.
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/L-[A-Z0-9]{6}/g, " ") // lead references
      .replace(/\+?\d[\d\s-]*/g, " ") // phone numbers and figures
      .replace(/[\d\s\p{P}\p{S}]+/gu, " ") // digits, punctuation, symbols
      .trim()
  );
}

const executablePath =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();

/** Reads only <main>: the header holds the language toggle, which shows the
 *  OTHER language's name by design and is not a leak. */
async function bodyText(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  return page.locator("main").innerText();
}

/**
 * Same, minus anything a customer or partner typed. A lead from a customer
 * called "زبون" is Arabic no matter which language the operator reads in;
 * that is data, not an untranslated string.
 */
async function bodyTextNoUserContent(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  return page.locator("main").evaluate((main) => {
    const clone = main.cloneNode(true);
    clone.querySelectorAll("[data-user-content]").forEach((n) => n.remove());
    return clone.innerText;
  });
}

try {
  // Sign in so the operator surfaces can be inspected too.
  await page.goto(`${BASE}/en/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#key", KEY);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Generate content that exercises the enums and error paths. Waiting for
  // the confirmation matters: if the lead is never created, the pages below
  // are scanned empty and every check passes without testing anything.
  await page.goto(`${BASE}/ar/request`, { waitUntil: "networkidle" });
  await page.fill("#customer_name", "زبون");
  await page.fill("#phone", "0561112233");
  await page.selectOption("#service_slug", "ac-repair");
  await page.click('button[type="submit"]');
  await page.waitForSelector('h2:has-text("تم استلام طلبك")', { timeout: 10000 });

  // Trigger a real failure so the error string is on screen when scanned.
  // Scope every action to the assign form itself: the first submit button on
  // this page belongs to the nav's sign-out form, and clicking that logs the
  // session out, leaving the pages below to be scanned empty.
  await page.goto(`${BASE}/ar/admin/leads`, { waitUntil: "networkidle" });
  const assignForm = page.locator("form:has(select[name='tenant_id'])").first();
  const select = assignForm.locator("select[name='tenant_id']");
  const value = await select.locator("option").nth(1).getAttribute("value");
  if (value) {
    await select.evaluate((sel, v) => {
      const opt = Array.from(sel.options).find((o) => o.value === v);
      if (opt) opt.disabled = false;
      sel.value = v;
    }, value);
    await assignForm.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  }

  check("still signed in after assign attempt", !page.url().includes("/admin/login"));

  // Fixtures must actually be on screen, or the scans below prove nothing.
  const leadsText = await bodyText("/ar/admin/leads");
  check(
    "leads page has a lead to inspect",
    /L-[A-Z0-9]{6}/.test(leadsText),
    `${leadsText.length} chars`,
  );
  check(
    "lead status badge is rendered",
    leadsText.includes("جديد") || leadsText.includes("مُسند"),
  );

  const partnersText = await bodyText("/ar/admin/partners");
  check(
    "partners page has partners to inspect",
    partnersText.length > 400,
    `${partnersText.length} chars`,
  );

  const arabicPages = [
    "/ar",
    "/ar/providers",
    "/ar/providers?service=ac-amc&district=yasmin",
    "/ar/providers/demo-jazeera",
    "/ar/request",
    "/ar/admin",
    "/ar/admin/partners",
    "/ar/admin/leads",
  ];

  for (const path of arabicPages) {
    const text = await bodyTextNoUserContent(path);
    const stripped = stripNeutral(text);
    const latin = stripped.match(/[A-Za-z][A-Za-z]+/g) ?? [];
    check(
      `arabic page has no english text: ${path}`,
      latin.length === 0,
      latin.slice(0, 6).join(", "),
    );
  }

  const englishPages = [
    "/en",
    "/en/providers",
    "/en/providers?service=ac-amc&district=yasmin",
    "/en/providers/demo-jazeera",
    "/en/request",
    "/en/admin",
    "/en/admin/partners",
    "/en/admin/leads",
  ];

  for (const path of englishPages) {
    const text = await bodyTextNoUserContent(path);
    const arabic = stripNeutral(text).match(/[؀-ۿ]+/g) ?? [];
    check(
      `english page has no arabic text: ${path}`,
      arabic.length === 0,
      arabic.slice(0, 6).join(", "),
    );
  }

  // --- The switch must keep you where you are --------------------------
  await page.goto(`${BASE}/ar/providers?service=ac-amc&district=yasmin`, {
    waitUntil: "networkidle",
  });
  await page.click('header a[lang="en"]');
  await page.waitForTimeout(1500);
  const url = new URL(page.url());
  check(
    "switching language keeps the page and its filters",
    url.pathname === "/en/providers" &&
      url.searchParams.get("service") === "ac-amc" &&
      url.searchParams.get("district") === "yasmin",
    page.url(),
  );

  const dirAfter = await page.getAttribute("html", "dir");
  check("direction flips with the language", dirAfter === "ltr", dirAfter ?? "");

  // And back again, from a deep page.
  await page.goto(`${BASE}/en/providers/demo-nasim`, { waitUntil: "networkidle" });
  await page.click('header a[lang="ar"]');
  await page.waitForTimeout(1500);
  check(
    "switching back keeps the provider page",
    new URL(page.url()).pathname === "/ar/providers/demo-nasim",
    page.url(),
  );
  check(
    "direction flips back to rtl",
    (await page.getAttribute("html", "dir")) === "rtl",
  );
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
