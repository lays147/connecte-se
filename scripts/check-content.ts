import { parseContent, type ContentItem } from "../src/data/content.ts";
import { checkUrl } from "./lib/checkUrl.ts";
import { diffByUrl, readFileAtRef } from "./lib/gitDiff.ts";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface CheckResult {
  section: string;
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

const CONTENT_RELATIVE_PATH = "sources/content.yaml";
const CONTENT_PATH = fileURLToPath(new URL("../sources/content.yaml", import.meta.url));

function loadItemsToCheck(baseRef: string | undefined): (ContentItem & { section: string })[] {
  const current = parseContent(parse(readFileSync(CONTENT_PATH, "utf-8")));
  const currentItems = Object.entries(current).flatMap(([section, { items }]) =>
    items.map((item) => ({ ...item, section })),
  );
  if (!baseRef) return currentItems;

  const baseRaw = readFileAtRef(baseRef, CONTENT_RELATIVE_PATH);
  if (!baseRaw) return currentItems;

  const base = parseContent(parse(baseRaw));
  const baseItems = Object.entries(base).flatMap(([section, { items }]) =>
    items.map((item) => ({ ...item, section })),
  );
  return diffByUrl(baseItems, currentItems);
}

async function main(): Promise<void> {
  const baseRef = process.env.CHECK_BASE_REF;
  const items = loadItemsToCheck(baseRef);

  if (baseRef && items.length === 0) {
    console.log("No new or changed content items compared to base ref - nothing to check.");
    return;
  }

  const results: CheckResult[] = [];

  for (const item of items) {
    const section = item.section;
    const result = await checkUrl(item.url);
    results.push({ section, name: item.name, url: item.url, ...result });
    const label = result.ok ? "OK" : "FAIL";
    const detail = result.status !== undefined ? String(result.status) : (result.error ?? "unknown error");
    console.log(`  [${label.padEnd(4)}] ${detail.padEnd(24)} ${item.name} (${section}) - ${item.url}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} content items reachable\n`);

  if (failed.length > 0) {
    console.log("Failed content items:");
    for (const f of failed) {
      console.log(`  - ${f.name} (${f.section}, ${f.url}): ${f.status ?? f.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
