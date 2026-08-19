import { expect, test } from "@playwright/test";

/**
 * The eligibility journey is the product's core promise: a real answer with no sign-up
 * and no phone number. These tests assert that promise end to end, because it is the
 * thing most likely to be quietly eroded by a future change.
 */

async function answerSingle(page: import("@playwright/test").Page, label: RegExp) {
  await page.getByText(label).first().click();
  await page.getByRole("button", { name: /continue|see my result/i }).click();
}

async function answerNumber(page: import("@playwright/test").Page, value: string) {
  await page.locator('input[type="number"]').fill(value);
  await page.getByRole("button", { name: /continue|see my result/i }).click();
}

test("a high earner with an offer is walked to a result with no sign-up", async ({
  page,
}) => {
  await page.goto("/eligibility");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/no sign-up/i).first()).toBeVisible();

  await answerSingle(page, /^Long-term residence$/);
  await answerSingle(page, /^Outside the UAE$/);
  await answerNumber(page, "35");
  await answerSingle(page, /^Bachelor's degree$/);
  await answerSingle(page, /^Yes$/); // degree attested
  await answerNumber(page, "10"); // years experience
  await answerNumber(page, "40000"); // salary
  await answerSingle(page, /^Yes$/); // job offer
  await answerNumber(page, "0"); // property
  await answerNumber(page, "0"); // business value
  await answerSingle(page, /^No \/ not sure$/); // recognition

  await expect(page.getByRole("heading", { name: /where you stand/i })).toBeVisible();

  // At no point were we asked for an email or phone number to see the answer.
  await expect(page.getByText(/golden visa/i).first()).toBeVisible();
  await expect(page.getByText(/criteria met/i).first()).toBeVisible();
});

test("never promises an approval anywhere in the result", async ({ page }) => {
  await page.goto("/eligibility");

  await answerSingle(page, /^A job$/);
  await answerSingle(page, /^Outside the UAE$/);
  await answerNumber(page, "29");
  await answerSingle(page, /^Bachelor's degree$/);
  await answerSingle(page, /^No \/ not sure$/);
  await answerNumber(page, "4");
  await answerNumber(page, "12000");
  await answerSingle(page, /^Yes$/);

  await expect(page.getByRole("heading", { name: /where you stand/i })).toBeVisible();

  const body = (await page.locator("body").innerText()).toLowerCase();
  expect(body).not.toContain("guaranteed approval");
  expect(body).not.toContain("we guarantee");
  expect(body).toContain("not an approval");
});

test("an unattested degree is surfaced as a blocker with a concrete fix", async ({
  page,
}) => {
  await page.goto("/eligibility");

  await answerSingle(page, /^A job$/);
  await answerSingle(page, /^Outside the UAE$/);
  await answerNumber(page, "31");
  await answerSingle(page, /^Master's degree$/);
  await answerSingle(page, /^No \/ not sure$/); // not attested
  await answerNumber(page, "8");
  await answerNumber(page, "20000");
  await answerSingle(page, /^Yes$/);

  await expect(page.getByRole("heading", { name: /where you stand/i })).toBeVisible();
  await expect(page.getByText(/degree attested for uae use/i).first()).toBeVisible();
  await expect(page.getByText(/notary, home country mofa/i).first()).toBeVisible();
});

test("blocks progress until the current question is answered", async ({ page }) => {
  await page.goto("/eligibility");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByText(/please answer this to continue/i)).toBeVisible();
});

test("lets you go back and change an answer", async ({ page }) => {
  await page.goto("/eligibility");

  await answerSingle(page, /^A job$/);
  await expect(
    page.getByRole("heading", { name: /where are you right now/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /back/i }).click();
  await expect(
    page.getByRole("heading", { name: /what brings you to the uae/i }),
  ).toBeVisible();
});
