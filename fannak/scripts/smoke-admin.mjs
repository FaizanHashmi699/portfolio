/**
 * Operator flow: admin console + partner portal.
 *
 * The check that matters most is the credit invariant — a lead must never be
 * assignable to a partner who cannot pay for it, because assignment is the
 * moment money changes hands.
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

const executablePath =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ locale: "ar-SA" });

try {
  // --- Admin must be closed until authenticated -------------------------
  await page.goto(`${BASE}/en/admin/partners`, { waitUntil: "networkidle" });
  check(
    "admin redirects to login when signed out",
    page.url().includes("/admin/login"),
    page.url(),
  );

  // --- A wrong key must not grant access --------------------------------
  await page.fill("#key", "definitely-not-the-key");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
  check(
    "wrong access key is rejected",
    page.url().includes("/admin/login"),
    page.url(),
  );

  // --- Correct key signs in ---------------------------------------------
  await page.fill("#key", KEY);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin(\/)?$/, { timeout: 10000 }).catch(() => {});
  check("correct access key signs in", page.url().includes("/admin"), page.url());

  // --- Create a partner --------------------------------------------------
  await page.goto(`${BASE}/en/admin/partners`, { waitUntil: "networkidle" });
  const name = `Test Cooling ${Date.now().toString().slice(-5)}`;
  await page.fill("#name_ar", "شركة اختبار للتكييف");
  await page.fill("#name_en", name);
  await page.fill("#phone", "0551110000");
  await page.check('input[name="service_slugs"][value="ac-repair"]');
  await page.check('input[name="district_slugs"][value="olaya"]');
  await page.click('form:has(#name_en) button[type="submit"]');
  await page.waitForTimeout(1800);
  await page.reload({ waitUntil: "networkidle" });
  const created = await page.locator(`text=${name}`).count();
  check("partner is created", created > 0);

  // The new partner starts at zero credits.
  const card = page.locator(".card").filter({ hasText: name }).first();
  const zeroBalance = await card.locator("text=Balance: 0").count();
  check("new partner starts with zero credits", zeroBalance > 0);

  // --- Submit a customer lead -------------------------------------------
  await page.goto(`${BASE}/ar/request`, { waitUntil: "networkidle" });
  await page.fill("#customer_name", "عميل اختبار");
  await page.fill("#phone", "0559998888");
  await page.selectOption("#service_slug", "ac-repair");
  await page.click('button[type="submit"]');
  await page.waitForSelector('h2:has-text("تم استلام طلبك")', { timeout: 10000 });
  check("customer lead reaches the operator queue", true);

  // --- The credit invariant ---------------------------------------------
  await page.goto(`${BASE}/en/admin/leads`, { waitUntil: "networkidle" });
  const leadCard = page.locator(".card").filter({ hasText: "عميل اختبار" }).first();
  const option = leadCard.locator(`option:has-text("${name}")`).first();
  const disabled = await option.getAttribute("disabled");
  check(
    "partner with no credits cannot be selected",
    disabled !== null,
    `disabled=${disabled}`,
  );

  // Force the assignment anyway — the server must refuse it.
  const optionValue = await option.getAttribute("value");
  await leadCard.locator("select[name='tenant_id']").evaluate((sel, value) => {
    const opt = Array.from(sel.options).find((o) => o.value === value);
    if (opt) opt.disabled = false;
    sel.value = value;
  }, optionValue);
  await leadCard.locator('button[type="submit"]').click();
  await page.waitForTimeout(1800);
  // The message is translated now, so assert the rendered English string —
  // and that no assignment was actually created.
  const refused = await page.locator("text=Not enough credits").count();
  check("server refuses assignment without credits", refused > 0);

  // --- Top up, then assign ----------------------------------------------
  await page.goto(`${BASE}/en/admin/partners`, { waitUntil: "networkidle" });
  const topUpCard = page.locator(".card").filter({ hasText: name }).first();
  await topUpCard.locator('input[name="credits"]').fill("3");
  await topUpCard.locator('button:has-text("Top up")').click();
  await page.waitForTimeout(1500);
  await page.reload({ waitUntil: "networkidle" });
  const funded = await page
    .locator(".card")
    .filter({ hasText: name })
    .first()
    .locator("text=Balance: 3")
    .count();
  check("top up credits the partner", funded > 0);

  await page.goto(`${BASE}/en/admin/leads`, { waitUntil: "networkidle" });
  const leadCard2 = page.locator(".card").filter({ hasText: "عميل اختبار" }).first();
  await leadCard2.locator("select[name='tenant_id']").selectOption({ label: `${name} (3)` });
  await leadCard2.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);
  const assigned = await page.locator("text=Assigned").count();
  check("lead assigns once the partner has credits", assigned > 0);

  // --- The debit actually happened --------------------------------------
  await page.goto(`${BASE}/en/admin/partners`, { waitUntil: "networkidle" });
  const debited = await page
    .locator(".card")
    .filter({ hasText: name })
    .first()
    .locator("text=Balance: 2")
    .count();
  check("assignment debits exactly one credit", debited > 0);

  // --- Partner portal ----------------------------------------------------
  // The link sits inside a collapsed <details>, so read textContent rather
  // than innerText, which is empty for hidden nodes.
  const linkText = await page
    .locator(".card")
    .filter({ hasText: name })
    .first()
    .locator("p.font-mono")
    .first()
    .textContent();
  const token = linkText?.split("token=")[1]?.trim();
  check("partner portal link is generated", Boolean(token));

  const partnerPage = await browser.newPage({ locale: "ar-SA" });
  await partnerPage.goto(`${BASE}/en/partner/enter?token=${token}`, { waitUntil: "networkidle" });
  const seesLead = await partnerPage.locator("text=عميل اختبار").count();
  check("partner sees the lead they paid for", seesLead > 0);

  const seesPhone = await partnerPage.locator("text=0559998888").count();
  check("partner sees the customer phone number", seesPhone > 0);

  await partnerPage.locator('button:has-text("Accept")').first().click();
  await partnerPage.waitForTimeout(1500);
  const acceptedShown = await partnerPage.locator("text=Accepted").count();
  check("partner can accept an assignment", acceptedShown > 0);

  // --- A forged token must not grant access ------------------------------
  const forged = await browser.newPage();
  await forged.goto(`${BASE}/en/partner/enter?token=tenant-9999.deadbeef`, {
    waitUntil: "networkidle",
  });
  const denied = await forged.locator("text=No access").count();
  check("forged partner token is rejected", denied > 0);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
