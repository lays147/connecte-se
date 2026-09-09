import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", canonical: "https://connect.lays147.dev.br/" },
  { path: "/mapa.html", canonical: "https://connect.lays147.dev.br/mapa.html" },
  { path: "/comunidades.html", canonical: "https://connect.lays147.dev.br/comunidades.html" },
  { path: "/conteudos.html", canonical: "https://connect.lays147.dev.br/conteudos.html" },
];

for (const { path, canonical } of PAGES) {
  test(`${path} has a unique title, description, canonical, and OG/Twitter tags`, async ({ page }) => {
    await page.goto(path);

    await expect(page).toHaveTitle(/.+/);
    const title = await page.title();

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://connect.lays147.dev.br/og-image.png",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(jsonLd ?? "{}");
    expect(data["@context"]).toBe("https://schema.org");
    expect(typeof data["@type"]).toBe("string");
  });
}

test("robots.txt points to the sitemap", async ({ page, request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("Sitemap: https://connect.lays147.dev.br/sitemap.xml");
});

test("sitemap.xml lists every page with a valid loc", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();

  for (const { canonical } of PAGES) {
    expect(body).toContain(`<loc>${canonical}</loc>`);
  }
});

test("og-image.png is reachable", async ({ request }) => {
  const response = await request.get("/og-image.png");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("image/png");
});
