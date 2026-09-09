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

test("filter bar has the region, type, paid, and modality selects", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("label", { hasText: "Região" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Tipo" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Pago?" }).locator("select")).toBeVisible();
  await expect(page.locator("label", { hasText: "Modalidade" }).locator("select")).toBeVisible();
});

test("modality filter removes non-matching cards from the DOM", async ({ page }) => {
  await page.goto("/");
  await page.locator("label", { hasText: "Modalidade" }).locator("select").selectOption("Online");

  const nonOnlineCards = page.locator("article:not([data-modality='Online'])");
  await expect(nonOnlineCards).toHaveCount(0);
});

test("current month renders first with a card for every event in it", async ({ page }) => {
  await page.goto("/");
  const currentSection = page.locator("section").first();
  await expect(currentSection.locator("h2")).toBeVisible();

  const countLabel = await currentSection.locator("span.font-mono-label").first().textContent();
  const expectedCount = Number(countLabel?.match(/\d+/)?.[0]);
  expect(expectedCount).toBeGreaterThan(0);

  await expect(currentSection.locator("article")).toHaveCount(expectedCount, { timeout: 10000 });
});

test("clicking a month heading collapses its card grid and the chevron rotates", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section").first();
  const heading = section.locator("button").first();

  await expect(section.locator("article").first()).toBeVisible();
  await expect(heading).toHaveAttribute("aria-expanded", "true");

  await heading.click();
  await expect(section.locator("article")).toHaveCount(0);
  await expect(heading).toHaveAttribute("aria-expanded", "false");

  await heading.click();
  await expect(section.locator("article").first()).toBeVisible();
  await expect(heading).toHaveAttribute("aria-expanded", "true");
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

test("CTA band links point to the add-event and add-source issue templates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Enviar um evento" }).first()).toHaveAttribute(
    "href",
    "https://github.com/lays147/connecte-se/issues/new?template=add-event.yml",
  );
  await expect(page.getByRole("link", { name: "Cadastrar comunidade" }).first()).toHaveAttribute(
    "href",
    "https://github.com/lays147/connecte-se/issues/new?template=add-source.yml",
  );
});

test("theme toggle switches to dark mode and persists across reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "Usar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Usar tema claro" })).toBeVisible();
});

test("featured carousel content is keyboard-operable and can be paused", async ({ page }) => {
  await page.goto("/");

  const infoRegion = page.getByRole("button", { name: /^Ver detalhes de /i }).filter({ hasText: "Em destaque" });

  await infoRegion.focus();
  await infoRegion.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const pauseBtn = page.getByRole("button", { name: "Pausar avanço automático" });
  await expect(pauseBtn).toBeVisible();
  await pauseBtn.click();
  await expect(page.getByRole("button", { name: "Retomar avanço automático" })).toBeVisible();
});

test("map zoom controls scale the map and reset returns to the original view", async ({ page }) => {
  await page.goto("/mapa.html");

  const svg = page.getByRole("img");
  const zoomLayer = svg.locator("> g").first();

  const resetBtn = page.getByRole("button", { name: "Redefinir zoom do mapa" });
  await expect(resetBtn).toBeDisabled();

  await page.getByRole("button", { name: "Aproximar o mapa" }).click();
  await expect(zoomLayer).toHaveAttribute("transform", /scale\(1\.6\)/);
  await expect(resetBtn).toBeEnabled();

  await resetBtn.click();
  await expect(zoomLayer).toHaveAttribute("transform", /scale\(1\)/);
  await expect(resetBtn).toBeDisabled();
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
