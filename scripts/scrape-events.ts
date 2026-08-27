import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { loadSources, type EventSource, type Frequency } from "../src/data/sources.ts";
import type { EventsByMonth, TechEvent } from "../src/types.ts";
import { extractEventsFromPage, type ExtractedEvent } from "./lib/extractEvents.ts";
import { buildEventId, monthNameFromDate, sortEventsByMonth } from "./lib/events.ts";

function eventsPathForYear(year: number): string {
  return fileURLToPath(new URL(`../src/data/events-${year}.json`, import.meta.url));
}

const PAGE_TEXT_LIMIT = 15000;
const NAV_TIMEOUT_MS = 30000;
const RENDER_SETTLE_MS = 4000;

const FREQUENCIES: Frequency[] = ["monthly", "yearly", "occasionally"];

interface CliOptions {
  dryRun: boolean;
  only?: string;
  limit?: number;
  year: number;
  frequency?: Frequency;
  force: boolean;
}

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, year: new Date().getFullYear(), force: false };
  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg.startsWith("--only=")) {
      options.only = arg.slice("--only=".length);
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.slice("--limit=".length));
    } else if (arg.startsWith("--year=")) {
      options.year = Number(arg.slice("--year=".length));
    } else if (arg.startsWith("--frequency=")) {
      const value = arg.slice("--frequency=".length);
      if (!FREQUENCIES.includes(value as Frequency)) {
        throw new Error(`Invalid --frequency value "${value}". Must be one of ${FREQUENCIES.join(", ")}`);
      }
      options.frequency = value as Frequency;
    }
  }
  return options;
}

function readCurrentEvents(path: string): EventsByMonth {
  if (!existsSync(path)) {
    return {};
  }
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as EventsByMonth;
}

function writeEvents(path: string, events: EventsByMonth): void {
  writeFileSync(path, `${JSON.stringify(sortEventsByMonth(events), null, 2)}\n`);
}

interface SourceResult {
  source: string;
  status: "ok" | "no-events" | "failed" | "skipped-yearly";
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
  const eventsPath = eventsPathForYear(options.year);

  let sources: EventSource[] = loadSources();
  if (options.only) {
    sources = sources.filter((s) => s.name === options.only);
    if (sources.length === 0) {
      console.error(`No source found with name "${options.only}"`);
      process.exitCode = 1;
      return;
    }
  }
  if (options.frequency) {
    sources = sources.filter((s) => s.frequency === options.frequency);
  }
  if (options.limit !== undefined) {
    sources = sources.slice(0, options.limit);
  }

  const events = readCurrentEvents(eventsPath);
  const existingIds = new Set<string>();
  const existingUrlDateKeys = new Set<string>();
  const existingUrlsByYear = new Set<string>();
  for (const bucket of Object.values(events)) {
    for (const event of bucket ?? []) {
      existingIds.add(event.id);
      existingUrlDateKeys.add(`${event.url}|${event.date}`);
      existingUrlsByYear.add(`${event.url}|${event.date.slice(0, 4)}`);
    }
  }

  const results: SourceResult[] = [];

  const browser = await chromium.launch({ headless: true });
  try {
    for (const [index, source] of sources.entries()) {
      const progress = `[${index + 1}/${sources.length}]`;
      const result: SourceResult = {
        source: source.name,
        status: "failed",
        found: 0,
        added: 0,
        skippedDuplicate: 0,
      };

      if (
        !options.force &&
        source.frequency === "yearly" &&
        existingUrlsByYear.has(`${source.url}|${options.year}`)
      ) {
        result.status = "skipped-yearly";
        results.push(result);
        console.log(`${progress} ${source.name} - skipped (already covered for this year)`);
        continue;
      }

      console.log(`${progress} ${source.name} - scraping...`);

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
          options.year,
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

      console.log(
        `${progress} ${source.name} - ${result.status} (found ${result.found}, added ${result.added})`,
      );
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  if (!options.dryRun) {
    writeEvents(eventsPath, events);
  }

  printSummary(results, options.dryRun);

  if (results.length > 0 && results.every((r) => r.status === "failed")) {
    process.exitCode = 1;
  }
}

function printSummary(results: SourceResult[], dryRun: boolean): void {
  console.log(dryRun ? "\n(dry run - no changes written)\n" : "\nScrape summary:\n");
  for (const r of results) {
    const line =
      r.status === "skipped-yearly"
        ? `  [${r.status.padEnd(14)}] ${r.source} - already covered for this year`
        : `  [${r.status.padEnd(14)}] ${r.source} - found ${r.found}, added ${r.added}, skipped ${r.skippedDuplicate}`;
    console.log(r.error ? `${line} (${r.error})` : line);
  }

  const succeeded = results.filter((r) => r.status === "ok").length;
  const noEvents = results.filter((r) => r.status === "no-events").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skippedYearly = results.filter((r) => r.status === "skipped-yearly").length;
  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skippedDuplicate, 0);

  console.log(
    `\n${succeeded} ok, ${noEvents} no-events, ${failed} failed, ${skippedYearly} skipped-yearly | ${totalAdded} events added, ${totalSkipped} duplicates skipped\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
