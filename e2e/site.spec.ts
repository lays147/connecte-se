import { test, expect } from "@playwright/test";

test("header shows the site title and the h1 headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header").getByText("Conecte-se Brasil")).toBeVisible();
  await expect(page.locator("h1")).toHaveText(
    "As conexões que você faz em eventos podem mudar sua carreira",
  );
});

test("featured carousel renders with a modality badge and navigation controls", async ({ page }) => {
  await page.goto("/");
  const carousel = page.locator("text=Em destaque").locator("..");
  await expect(carousel).toBeVisible();
  await expect(page.getByText(/^(Online|Presencial)$/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximo destaque" })).toBeVisible();

  const positionBefore = await page.locator("text=/^1 \\/ \\d+$/").first().textContent();
  // The carousel auto-advances every 7s and rebuilds the DOM on each tick; click
  // through a locator (re-resolved on retry) rather than a held element handle.
  await page.getByRole("button", { name: "Próximo destaque" }).click({ timeout: 5000 });
  await expect(page.locator("text=/^2 \\/ \\d+$/").first()).toBeVisible();
  expect(positionBefore).toContain("1 /");
});

test("filter bar has exactly the region, type, and paid selects", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("label", { hasText: "Região" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Tipo" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Pago?" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Modalidade" })).toHaveCount(0);
});

test("current month renders first with its capped card grid and overflow note", async ({ page }) => {
  await page.goto("/");
  const augustSection = page.locator("section", { has: page.locator("h2", { hasText: "Agosto 2026" }) });
  await expect(augustSection).toBeVisible();
  await expect(augustSection.locator("article")).toHaveCount(9, { timeout: 10000 });
  await expect(augustSection.getByText("+ 2 eventos neste mês")).toBeVisible();
});

test("clicking the header Comunidades link navigates to the communities directory", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Comunidades" }).click();
  await expect(page).toHaveURL(/\/comunidades\.html$/);
  await expect(page.locator("h1")).toHaveText("Comunidades e organizadores de tecnologia");
});

test("locked past months load on click and insert a real section", async ({ page }) => {
  await page.goto("/");
  const julySection = page.locator("h2", { hasText: "Julho 2026" });
  await expect(julySection).toHaveCount(0);

  await page.getByRole("button", { name: /^Julho \+\d+$/ }).click();
  await expect(julySection).toBeVisible();
});

test("paid filter removes non-matching cards from the DOM", async ({ page }) => {
  await page.goto("/");
  await page.locator("label", { hasText: "Pago?" }).locator("select").selectOption("Gratuito");

  const paidCards = page.locator("article", { hasText: "Pago" });
  await expect(paidCards).toHaveCount(0);
});

test("Pix copy button flips its label after clicking", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const copyButton = page.getByRole("button", { name: "Copiar" });
  await copyButton.click();
  await expect(page.getByRole("button", { name: "Copiada" })).toBeVisible();
});

test("CTA band links point to the add-event and add-source workflows", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Enviar um evento" }).first()).toHaveAttribute(
    "href",
    "https://github.com/lays147/connecte-se/actions/workflows/add-event.yml",
  );
  await expect(page.getByRole("link", { name: "Cadastrar comunidade" }).first()).toHaveAttribute(
    "href",
    "https://github.com/lays147/connecte-se/actions/workflows/add-source.yml",
  );
});

test("communities page lists all registered sources and filters by type and search", async ({ page }) => {
  await page.goto("/comunidades.html");
  await expect(page.locator("h1")).toHaveText("Comunidades e organizadores de tecnologia");

  const cardsBefore = await page.locator("a.rounded-card-13").count();
  expect(cardsBefore).toBeGreaterThan(50);

  await page.getByRole("button", { name: "Eventos recorrentes" }).click();
  const eventCards = await page.locator("a.rounded-card-13").count();
  expect(eventCards).toBeLessThan(cardsBefore);
  expect(eventCards).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Tudo" }).click();
  await page.getByPlaceholder("Buscar por nome").fill("AWS User Group Belo Horizonte");
  await expect(page.locator("a.rounded-card-13")).toHaveCount(1);
});
