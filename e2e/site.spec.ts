import { test, expect } from "@playwright/test";

test("header shows the site title and subtitle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Conecte-se Brasil");
  await expect(page.locator("header p")).toHaveText(
    "As conexões que você faz em eventos, podem mudar sua carreira!",
  );
});

test("current month renders first with its cards", async ({ page }) => {
  await page.goto("/");
  const firstSection = page.locator("main section").first();
  await expect(firstSection.locator("h2")).toHaveText("Agosto 2026");
  await expect(firstSection.locator("article")).toHaveCount(3);
});

test("future months load by default alongside the current month", async ({ page }) => {
  await page.goto("/");
  const monthHeadings = await page.locator("main section h2").allTextContents();
  expect(monthHeadings).toEqual(["Agosto 2026", "Setembro 2026", "Novembro 2026"]);
});

test("load more reveals the previous month, prepended before the current month, and fades past events", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Carregar meses anteriores" }).click();

  const monthHeadings = await page.locator("main section h2").allTextContents();
  expect(monthHeadings).toEqual([
    "Julho 2026",
    "Agosto 2026",
    "Setembro 2026",
    "Novembro 2026",
  ]);

  const julySection = page.locator("main section", { hasText: "Julho" });
  const opacity = await julySection
    .locator("article")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThan(1);
});

test("paid filter hides paid cards", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("label", { hasText: "Pago?" })
    .locator("select")
    .selectOption("Gratuito");

  const visiblePaidCards = page.locator('main article:not(.hidden)[data-paid="true"]');
  await expect(visiblePaidCards).toHaveCount(0);
});
