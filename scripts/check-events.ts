import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { EventsByMonth } from "../src/types.ts";
import { checkUrl } from "./lib/checkUrl.ts";

const DATA_DIR = fileURLToPath(new URL("../src/data", import.meta.url));

interface EventUrlEntry {
  eventTitle: string;
  city: string | null;
  state: string | null;
  url: string;
}

function loadEventUrls(filePath: string): EventUrlEntry[] {
  const raw = readFileSync(filePath, "utf-8");
  const events = JSON.parse(raw) as EventsByMonth;

  const entries: EventUrlEntry[] = [];
  for (const bucket of Object.values(events)) {
    for (const event of bucket ?? []) {
      if (!("city" in event) || (event.city !== null && typeof event.city !== "string") ||
          !("state" in event) || (event.state !== null && !/^[A-Z]{2}$/.test(event.state))) {
        throw new Error(`Event "${event.title}" is missing a valid city or state value`);
      }
      entries.push({ eventTitle: event.title, city: event.city, state: event.state, url: event.url });
    }
  }
  return entries;
}

async function main(): Promise<void> {
  const files = globSync("events-*.json", { cwd: DATA_DIR });

  if (files.length === 0) {
    console.log("No event JSON files found in src/data - nothing to check.");
    return;
  }

  let anyFailed = false;

  for (const file of files) {
    const filePath = join(DATA_DIR, file);
    const entries = loadEventUrls(filePath);

    const seen = new Map<string, EventUrlEntry[]>();
    for (const entry of entries) {
      const group = seen.get(entry.url) ?? [];
      group.push(entry);
      seen.set(entry.url, group);
    }

    console.log(`\nChecking ${entries.length} event URLs (${seen.size} unique) from ${file}...\n`);

    const failed: { url: string; events: EventUrlEntry[]; status?: number; error?: string }[] = [];

    for (const [url, group] of seen) {
      const result = await checkUrl(url);
      const label = result.ok ? "OK" : "FAIL";
      const detail = result.status !== undefined ? String(result.status) : (result.error ?? "unknown error");
      console.log(`  [${label.padEnd(4)}] ${detail.padEnd(24)} ${url}`);

      if (!result.ok) {
        failed.push({ url, events: group, status: result.status, error: result.error });
      }
    }

    console.log(`\n${seen.size - failed.length}/${seen.size} unique URLs reachable in ${file}\n`);

    if (failed.length > 0) {
      anyFailed = true;
      console.log(`Broken URLs in ${file}:`);
      for (const f of failed) {
        const detail = f.status !== undefined ? `status ${f.status}` : (f.error ?? "unknown error");
        for (const event of f.events) {
          console.log(`  - "${event.eventTitle}" -> ${f.url} (${detail})`);
        }
      }
    }
  }

  if (anyFailed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
