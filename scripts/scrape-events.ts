import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { loadSources, type EventSource } from "../src/data/sources.ts";
import { MONTH_NAMES, type EventsByMonth, type MonthName, type TechEvent } from "../src/types.ts";
import { extractEventsFromPage, type ExtractedEvent } from "./lib/extractEvents.ts";

const EVENTS_PATH = fileURLToPath(
  new URL("../src/data/events-2026.json", import.meta.url),
);

const PAGE_TEXT_LIMIT = 15000;
const NAV_TIMEOUT_MS = 30000;
const RENDER_SETTLE_MS = 4000;

interface CliOptions {
  dryRun: boolean;
  only?: string;
  limit?: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--only=")) {
      options.only = arg.slice("--only=".length);
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length));
    }
  }
  return options;
}

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEventId(date: string, title: string): string {
  const [year, month] = date.split("-");
  return `${year}-${month}-${slugify(title)}`;
}

function monthNameFromDate(date: string): MonthName {
  const monthIndex = Number(date.split("-")[1]) - 1;
  return MONTH_NAMES[monthIndex];
}

function readCurrentEvents(): EventsByMonth {
  const raw = readFileSync(EVENTS_PATH, "utf-8");
  return JSON.parse(raw) as EventsByMonth;
}

function writeEvents(events: EventsByMonth): void {
  const ordered: EventsByMonth = {};
  for (const month of MONTH_NAMES) {
    const bucket = events[month];
    if (bucket && bucket.length > 0) {
      ordered[month] = bucket;
    }
  }
  writeFileSync(EVENTS_PATH, `${JSON.stringify(ordered, null, 2)}\n`);
}

interface SourceResult {
  source: string;
  status: "ok" | "no-events" | "failed";
  found: number;
  added: number;
  skippedDuplicate: number;
  error?: string;
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "Missing ANTHROPIC_API_KEY. Set it in your environment or in a local .env file.",
    );
    process.exitCode = 1;
    return;
  }

  const options = parseCliOptions(process.argv.slice(2));

  let sources: EventSource[] = loadSources();
  if (options.only) {
    sources = sources.filter((s) => s.name === options.only);
    if (sources.length === 0) {
      console.error(`No source found with name "${options.only}"`);
      process.exitCode = 1;
      return;
    }
  }
  if (options.limit !== undefined) {
    sources = sources.slice(0, options.limit);
  }

  const events = readCurrentEvents();
  const existingIds = new Set<string>();
  const existingUrlDateKeys = new Set<string>();
  for (const bucket of Object.values(events)) {
    for (const event of bucket ?? []) {
      existingIds.add(event.id);
      existingUrlDateKeys.add(`${event.url}|${event.date}`);
    }
  }

  const results: SourceResult[] = [];

  const browser = await chromium.launch({ headless: true });
  try {
    for (const source of sources) {
      const result: SourceResult = {
        source: source.name,
        status: "failed",
        found: 0,
        added: 0,
        skippedDuplicate: 0,
      };

      const page = await browser.newPage();
      try {
        await page.goto(source.url, {
          waitUntil: "domcontentloaded",
          timeout: NAV_TIMEOUT_MS,
        });
        await page.waitForTimeout(RENDER_SETTLE_MS);
        const pageText = (await page.evaluate(() => document.body.innerText)).slice(
          0,
          PAGE_TEXT_LIMIT,
        );
        const pageLinks = await page.evaluate(() =>
          Array.from(document.querySelectorAll("a"))
            .map((a) => ({ href: a.href, text: a.textContent?.trim() ?? "" }))
            .filter((l) => l.text && l.href.startsWith("http")),
        );

        const candidates: ExtractedEvent[] = await extractEventsFromPage(
          pageText,
          pageLinks,
          source,
        );
        result.found = candidates.length;
        result.status = candidates.length > 0 ? "ok" : "no-events";

        for (const candidate of candidates) {
          const id = buildEventId(candidate.date, candidate.title);
          const urlDateKey = `${candidate.url}|${candidate.date}`;

          if (existingIds.has(id) || existingUrlDateKeys.has(urlDateKey)) {
            result.skippedDuplicate += 1;
            continue;
          }

          const event: TechEvent = { id, ...candidate };
          const month = monthNameFromDate(event.date);
          const bucket = events[month] ?? [];
          bucket.push(event);
          events[month] = bucket;

          existingIds.add(id);
          existingUrlDateKeys.add(urlDateKey);
          result.added += 1;
        }
      } catch (error) {
        result.status = "failed";
        result.error = error instanceof Error ? error.message : String(error);
      } finally {
        await page.close();
      }

      results.push(result);
    }
  } finally {
    await browser.close();
  }

  if (!options.dryRun) {
    writeEvents(events);
  }

  printSummary(results, options.dryRun);

  if (results.length > 0 && results.every((r) => r.status === "failed")) {
    process.exitCode = 1;
  }
}

function printSummary(results: SourceResult[], dryRun: boolean): void {
  console.log(dryRun ? "\n(dry run - no changes written)\n" : "\nScrape summary:\n");
  for (const r of results) {
    const line = `  [${r.status.padEnd(9)}] ${r.source} - found ${r.found}, added ${r.added}, skipped ${r.skippedDuplicate}`;
    console.log(r.error ? `${line} (${r.error})` : line);
  }

  const succeeded = results.filter((r) => r.status === "ok").length;
  const noEvents = results.filter((r) => r.status === "no-events").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skippedDuplicate, 0);

  console.log(
    `\n${succeeded} ok, ${noEvents} no-events, ${failed} failed | ${totalAdded} events added, ${totalSkipped} duplicates skipped\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
