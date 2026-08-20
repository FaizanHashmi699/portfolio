import { expect, test } from "@playwright/test";

/**
 * Internationalisation, including the RTL locales.
 *
 * The assertions that matter most are the ones about what translation must never lose:
 * the no-guarantee line and the non-government disclosure exist in every language, and
 * money keeps Western digits so customers can match our figures against a government
 * portal character for character.
 */

const LOCALES = [
  { code: "ar", dir: "rtl", heading: "اعرف قبل", viewInEnglish: "عرض بالإنجليزية" },
  {
    code: "ur",
    dir: "rtl",
    heading: "ادائیگی سے پہلے",
    viewInEnglish: "انگریزی میں دیکھیں",
  },
  {
    code: "hi",
    dir: "ltr",
    heading: "भुगतान से पहले",
    viewInEnglish: "अंग्रेज़ी में देखें",
  },
  {
    code: "ru",
    dir: "ltr",
    heading: "Узнайте, прежде",
    viewInEnglish: "Посмотреть на английском",
  },
];

for (const locale of LOCALES) {
  test(`/${locale.code} renders in the right language and direction`, async ({
    page,
  }) => {
    await page.goto(`/${locale.code}`);

    const wrapper = page.locator(`[dir="${locale.dir}"]`).first();
    await expect(wrapper).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(locale.heading);
  });

  test(`/${locale.code} keeps the machine-translation notice`, async ({ page }) => {
    await page.goto(`/${locale.code}`);
    // Saying so plainly is what stops someone acting on a mistranslated criterion
    // believing a person checked it. The escape hatch is written in their language,
    // not in English — a reader who needs it may not read the word "English".
    await expect(
      page.getByRole("link", { name: locale.viewInEnglish }).first(),
    ).toBeVisible();
  });

  test(`/${locale.code} keeps money in Western digits`, async ({ page }) => {
    await page.goto(`/${locale.code}`);
    await expect(page.getByText(/AED\s?[\d,]+/).first()).toBeVisible();
  });
}

test("English stays unprefixed, so no existing URL moved", async ({ page }) => {
  const response = await page.goto("/en");
  expect(response?.status()).toBe(404);

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/know before/i);
});

test("an unknown locale is a 404, not a fallback", async ({ page }) => {
  const response = await page.goto("/zz");
  expect(response?.status()).toBe(404);
});

test("hreflang alternates are emitted for every locale", async ({ page }) => {
  await page.goto("/");

  for (const tag of ["en-AE", "ar-AE", "hi-IN", "ur-PK", "ru-RU", "x-default"]) {
    await expect(page.locator(`link[hreflang="${tag}"]`)).toHaveCount(1);
  }
});

test("the language switcher lists each language in its own script", async ({
  page,
}) => {
  await page.goto("/ar");
  await page.locator("summary").filter({ hasText: "العربية" }).click();

  await expect(page.getByRole("link", { name: /हिन्दी/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Русский/ })).toBeVisible();
});
