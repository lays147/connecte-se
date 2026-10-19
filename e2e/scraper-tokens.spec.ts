import { test, expect } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { filterLinks, hashPage, hasDateLikeText } from "../scripts/lib/pageFilters.ts";
import { readScrapeCache, writeScrapeCache } from "../scripts/lib/scrapeCache.ts";
import { addUsage, buildSystemPrompt, buildUserPrompt, emptyUsage } from "../scripts/lib/extractEvents.ts";
import type { EventSource } from "../src/data/sources.ts";

const SOURCE: EventSource = {
  name: "Python Floripa",
  url: "https://pythonfloripa.org/",
  type: "community",
  frequency: "occasionally",
};

test.describe("filterLinks", () => {
  test("drops duplicates, anchors, the source page and social profiles", () => {
    const links = filterLinks(
      [
        { href: "https://pythonfloripa.org/", text: "Home" },
        { href: "https://pythonfloripa.org/#agenda", text: "Agenda" },
        { href: "https://www.sympla.com.br/evento/meetup/123", text: "Meetup" },
        { href: "https://www.sympla.com.br/evento/meetup/123#ingressos", text: "Ingressos" },
        { href: "https://instagram.com/pythonfloripa", text: "Instagram" },
        { href: "https://www.linkedin.com/company/pythonfloripa", text: "LinkedIn" },
        { href: "https://www.linkedin.com/events/123456/", text: "Evento no LinkedIn" },
      ],
      SOURCE.url,
    );
    expect(links.map((l) => l.href)).toEqual([
      "https://www.sympla.com.br/evento/meetup/123",
      "https://www.linkedin.com/events/123456/",
    ]);
  });

  test("keeps only event pages for meetup.com groups", () => {
    const links = filterLinks(
      [
        { href: "https://www.meetup.com/some-group/members/", text: "Members" },
        { href: "https://www.meetup.com/some-group/events/987/", text: "Meetup #12" },
      ],
      "https://www.meetup.com/some-group/",
    );
    expect(links.map((l) => l.href)).toEqual(["https://www.meetup.com/some-group/events/987/"]);
  });

  test("collapses whitespace and truncates long link text", () => {
    const [link] = filterLinks(
      [{ href: "https://example.com/e", text: `Evento\n\n  ${"x".repeat(200)}` }],
      SOURCE.url,
    );
    expect(link.text.startsWith("Evento x")).toBe(true);
    expect(link.text.length).toBe(80);
  });
});

test.describe("hasDateLikeText", () => {
  for (const text of [
    "Próximo encontro: 15/03/2026",
    "Sábado, 22 de outubro às 19h",
    "qua., 22 out. · 19:00",
    "Wed, Oct 22 · 7:00 PM",
    "Starts 2026-11-05",
  ]) {
    test(`detects a date in "${text}"`, () => {
      expect(hasDateLikeText(text)).toBe(true);
    });
  }

  test("returns false when the page has no dates", () => {
    expect(hasDateLikeText("Somos uma comunidade de Python em Florianópolis. Junte-se a nós!")).toBe(false);
  });
});

test.describe("hashPage", () => {
  const links = [{ href: "https://example.com/e", text: "Evento" }];

  test("is stable for the same page and year", () => {
    expect(hashPage("texto", links, 2026)).toBe(hashPage("texto", links, 2026));
  });

  test("changes when the text, links or year change", () => {
    const base = hashPage("texto", links, 2026);
    expect(hashPage("texto novo", links, 2026)).not.toBe(base);
    expect(hashPage("texto", [{ href: "https://example.com/f", text: "Evento" }], 2026)).not.toBe(base);
    expect(hashPage("texto", links, 2027)).not.toBe(base);
  });
});

test.describe("scrape cache", () => {
  test("round-trips entries and returns empty when missing", () => {
    const path = join(mkdtempSync(join(tmpdir(), "scrape-cache-")), "cache.json");
    expect(readScrapeCache(path)).toEqual({});
    const cache = { "https://b.org/": { hash: "b", checkedAt: "2026-10-19T00:00:00.000Z" } };
    writeScrapeCache(path, cache);
    expect(readScrapeCache(path)).toEqual(cache);
  });
});

test.describe("prompts", () => {
  const today = new Date(2026, 9, 19);

  test("system prompt is identical across sources so it can be cached", () => {
    const system = buildSystemPrompt(2026, today);
    expect(system).toContain("19/10/2026");
    expect(system).not.toContain(SOURCE.name);
    expect(system).not.toContain(SOURCE.url);
    expect(buildSystemPrompt(2026, today)).toBe(system);
  });

  test("user prompt carries the source context, links and page text", () => {
    const user = buildUserPrompt("Meetup 22/10", [{ href: "https://example.com/e", text: "Evento" }], SOURCE);
    expect(user).toContain(`- url: ${SOURCE.url}`);
    expect(user).toContain(`- "Evento" -> https://example.com/e`);
    expect(user).toContain("Meetup 22/10");
  });
});

test("addUsage sums every token counter", () => {
  const total = addUsage(
    { input: 10, output: 5, cacheRead: 100, cacheWrite: 0 },
    addUsage(emptyUsage(), { input: 1, output: 2, cacheRead: 3, cacheWrite: 4 }),
  );
  expect(total).toEqual({ input: 11, output: 7, cacheRead: 103, cacheWrite: 4 });
});
