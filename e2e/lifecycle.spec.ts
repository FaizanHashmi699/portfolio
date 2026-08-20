import { expect, test } from "@playwright/test";

/**
 * The full customer journey added after the marketing site: signing in, starting an
 * application, uploading a document and having it checked, messaging, and invoices.
 *
 * These run in demo mode — the same configuration a new contributor gets on checkout —
 * so they also prove the zero-credential path still works end to end.
 */

test.describe("authentication", () => {
  test("sign-in page says plainly that demo mode checks nothing", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /welcome back/i,
    );
    await expect(page.getByText(/no credentials are checked/i)).toBeVisible();
  });

  test("never reveals whether an account exists", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("definitely-not-a-user@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    // Confirming or denying the address would turn this form into a user-enumeration
    // oracle, and confirming a named person holds a UAE visa application is itself a harm.
    await expect(
      page.getByText(/if there's an account for that address/i),
    ).toBeVisible();
  });

  test("sign-up requires accepting the terms", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("link", { name: /terms of service/i })).toBeVisible();
    await expect(page.locator('input[name="acceptedTerms"]')).toHaveAttribute(
      "required",
      "",
    );
  });

  test("eligibility stays reachable without an account", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /check your eligibility/i }).click();
    await expect(page).toHaveURL(/\/eligibility/);
  });

  test("signing out sends you to sign-in, and back in restores the portal", async ({
    page,
  }) => {
    await page.goto("/portal");
    // The account menu is a native <details>; open it by its summary.
    await page.locator("summary").filter({ hasText: "Amina" }).click();
    await page.getByRole("button", { name: /sign out/i }).click();

    await expect(page).toHaveURL(/\/sign-in/);

    await page.getByLabel("Email").fill("amina@example.com");
    await page.getByLabel("Password").fill("anything-in-demo-mode");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/portal/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hello");
  });
});

test.describe("starting an application", () => {
  test("quotes the itemised total before anything is committed", async ({ page }) => {
    await page.goto("/portal/start/tourist-visa-30-day");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Tourist Visa/);
    await expect(page.getByRole("heading", { name: /your quote/i })).toBeVisible();
    await expect(page.getByText("Our fee").first()).toBeVisible();
    await expect(page.getByText(/nothing is charged now/i)).toBeVisible();
  });

  test("recalculates when the applicant count changes", async ({ page }) => {
    await page.goto("/portal/start/tourist-visa-30-day");

    const submit = page.getByRole("button", { name: /start this application/i });
    const before = await submit.textContent();

    await page.getByLabel("How many applicants?").fill("3");
    await expect(submit).not.toHaveText(before ?? "");
  });

  test("creates the application and lands on its timeline", async ({ page }) => {
    await page.goto("/portal/start/tourist-visa-30-day");

    await page.getByLabel("Applicant's full name").fill("Test Applicant");
    await page.getByLabel("Applicant's email").fill("test-applicant@example.com");
    await page.getByRole("button", { name: /start this application/i }).click();

    await expect(page).toHaveURL(/\/portal\/applications\//);
    await expect(page.getByRole("main").getByText("Test Applicant")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /upload a document/i }),
    ).toBeVisible();
  });

  test("won't accept an application without an applicant name", async ({ page }) => {
    await page.goto("/portal/start/tourist-visa-30-day");
    await expect(page.getByLabel("Applicant's full name")).toHaveAttribute(
      "required",
      "",
    );
  });
});

test.describe("documents, messages and invoices", () => {
  test("upload asks for the fields it needs to actually check the document", async ({
    page,
  }) => {
    await page.goto("/portal/applications/app-2");

    const uploader = page.getByRole("heading", { name: /upload a document/i });
    await expect(uploader).toBeVisible();
    // We ask rather than guess: inventing a passport expiry would be far worse than
    // asking for one.
    await expect(page.getByLabel("What is this document?")).toBeVisible();
    await expect(page.getByText(/checked the moment you upload it/i)).toBeVisible();
  });

  test("customer sees a staff message on the thread", async ({ page }) => {
    await page.goto("/portal/applications/app-2");
    await expect(page.getByRole("heading", { name: /^messages$/i })).toBeVisible();
    await expect(page.getByText(/our checks flagged two things/i)).toBeVisible();
  });

  test("a message sent from the portal appears in the thread", async ({ page }) => {
    const body = `Test question ${Date.now()}`;

    await page.goto("/portal/applications/app-1");
    await page.getByLabel("Write a message").fill(body);
    await page.getByRole("button", { name: /^send$/i }).click();

    await expect(page.getByText(body)).toBeVisible();
  });

  test("invoices carry the same itemised lines as the quote", async ({ page }) => {
    await page.goto("/portal/invoices");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Invoices");
    await expect(page.getByText("INV-2026-0417")).toBeVisible();

    const main = page.getByRole("main");
    await main
      .getByText(/see every line/i)
      .first()
      .click();
    await expect(main.getByText("Our fee").first()).toBeVisible();
  });

  test("documents page flags the ones with problems", async ({ page }) => {
    await page.goto("/portal/documents");
    // Scoped to main: the notification bell mentions issues too, and its dropdown is in
    // the DOM but hidden.
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText("Documents");
    await expect(main.getByText(/issue/i).first()).toBeVisible();
  });

  test("account page surfaces data rights rather than burying them", async ({
    page,
  }) => {
    await page.goto("/portal/account");
    await expect(page.getByRole("link", { name: /request my data/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /delete my account/i })).toBeVisible();
  });
});

test.describe("admin additions", () => {
  test("reports separate what we earned from what passed through", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(
      page.getByRole("heading", { name: /what we actually earned/i }),
    ).toBeVisible();
    await expect(page.getByText(/passed through at cost/i)).toBeVisible();
  });

  test("uses median, not mean, for time to decision", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(page.getByText(/median, not mean/i)).toBeVisible();
  });

  test("audit log states it is append-only for everyone", async ({ page }) => {
    await page.goto("/admin/audit");
    await expect(page.getByText(/append-only/i).first()).toBeVisible();
    await expect(page.getByText(/including admins/i)).toBeVisible();
  });

  test("team page warns what console access actually grants", async ({ page }) => {
    await page.goto("/admin/team");
    await expect(
      page.getByText(/console access sees customer documents/i),
    ).toBeVisible();
  });

  test("settings shows the live storage driver and refuses to edit fees", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await expect(page.getByText("in-memory").first()).toBeVisible();
    await expect(
      page.getByText(/not editable from this screen, by design/i),
    ).toBeVisible();
  });

  test("document review requires a reason when rejecting", async ({ page }) => {
    await page.goto("/admin/applications/app-2");

    await page
      .getByText(/review this document/i)
      .first()
      .click();
    await page
      .getByRole("button", { name: /^reject$/i })
      .first()
      .click();

    // A rejection with no reason puts the customer straight back in the dark.
    await expect(page.getByText(/say why it was rejected/i)).toBeVisible();
  });
});
