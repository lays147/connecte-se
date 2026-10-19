import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Page hash per source url from the last successful extraction, so unchanged
// pages skip the Claude API call on the next run.
export interface ScrapeCacheEntry {
  hash: string;
  checkedAt: string;
}

export type ScrapeCache = Record<string, ScrapeCacheEntry>;

export function readScrapeCache(path: string): ScrapeCache {
  if (!existsSync(path)) {
    return {};
  }
  return JSON.parse(readFileSync(path, "utf-8")) as ScrapeCache;
}

export function writeScrapeCache(path: string, cache: ScrapeCache): void {
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(path, `${JSON.stringify(sorted, null, 2)}\n`);
}
