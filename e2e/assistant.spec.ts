import { expect, test } from "@playwright/test";

/**
 * The assistant.
 *
 * Runs with no Anthropic key, which is the important case: retrieval alone must still
 * produce a correct, useful answer, because the model contributes phrasing rather than
 * facts.
 */

test("answers from the catalog with no model configured", async ({ request }) => {
  const response = await request.post("/api/assistant", {
    data: { question: "how much is the golden visa" },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();

  expect(body.source).toBe("retrieval");
  expect(body.answer).toContain("Golden Visa");
  // The price is the answer. Retrieval alone carries it.
  expect(body.answer).toMatch(/AED\s?[\d,]+/);
  expect(body.sources.length).toBeGreaterThan(0);
});

test("never promises an outcome", async ({ request }) => {
  for (const question of [
    "will my golden visa be approved",
    "can you guarantee my visa",
    "what are my chances of approval",
  ]) {
    const response = await request.post("/api/assistant", { data: { question } });
    const body = await response.json();
    const answer = String(body.answer).toLowerCase();

    // Our own copy warns *against* firms promising guarantees, so this matches
    // first-person claims rather than the word appearing at all.
    expect(answer, question).not.toMatch(
      /we guarantee|we can guarantee|your visa will be approved|approval is guaranteed/,
    );
    // And it must always carry the disclaimer.
    expect(answer, question).toMatch(
      /cannot be guaranteed|no visa outcome can be guaranteed/,
    );
  }
});

test("points at a human rather than inventing an answer", async ({ request }) => {
  const response = await request.post("/api/assistant", {
    data: { question: "qwertyuiop asdfghjkl zxcvbnm" },
  });
  const body = await response.json();

  expect(body.answer).toContain("contact page");
  expect(body.answer).not.toMatch(/AED/);
});

test("rejects malformed input", async ({ request }) => {
  expect(
    (await request.post("/api/assistant", { data: { question: "" } })).status(),
  ).toBe(400);
  expect((await request.post("/api/assistant", { data: {} })).status()).toBe(400);
});

test("the widget opens and offers real starting questions", async ({ page }) => {
  await page.goto("/");

  const dialog = page.getByRole("dialog", { name: "Assistant" });
  await expect(async () => {
    await page.getByRole("button", { name: /ask about uae visas/i }).click();
    await expect(dialog).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });
  await expect(
    dialog.getByText(/what does a golden visa actually cost/i),
  ).toBeVisible();
  // It must not pretend to decide eligibility — that is the rules engine's job.
  await expect(dialog.getByText(/can't decide your eligibility/i)).toBeVisible();
});

test("the widget answers a question and cites its sources", async ({ page }) => {
  await page.goto("/");

  // The widget only responds once React has hydrated, and hydration is not directly
  // observable — so retry the open until the dialog is actually there rather than
  // racing it once and flaking on a slower mobile run.
  const dialog = page.getByRole("dialog", { name: "Assistant" });
  await expect(async () => {
    await page.getByRole("button", { name: /ask about uae visas/i }).click();
    await expect(dialog).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });

  // Wait on the response itself rather than a generous timeout.
  const answered = page.waitForResponse(
    (response) =>
      response.url().includes("/api/assistant") && response.status() === 200,
  );
  await dialog.getByText(/what does a golden visa actually cost/i).click();
  await answered;

  await expect(dialog.getByText(/AED\s?[\d,]+/).first()).toBeVisible();
  await expect(dialog.getByRole("link").first()).toBeVisible();
});
