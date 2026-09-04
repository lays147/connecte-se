import { parseSources, type EventSource } from "../src/data/sources.ts";
import { checkUrl } from "./lib/checkUrl.ts";
import { diffByUrl, readFileAtRef } from "./lib/gitDiff.ts";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface CheckResult {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

const SOURCES_RELATIVE_PATH = "sources/communities.yaml";
const SOURCES_PATH = fileURLToPath(new URL("../sources/communities.yaml", import.meta.url));

function loadSourcesToCheck(baseRef: string | undefined): EventSource[] {
  const current = parseSources(parse(readFileSync(SOURCES_PATH, "utf-8")));
  if (!baseRef) return current;

  const baseRaw = readFileAtRef(baseRef, SOURCES_RELATIVE_PATH);
  const base = baseRaw ? parseSources(parse(baseRaw)) : [];
  return diffByUrl(base, current);
}

async function main(): Promise<void> {
  const baseRef = process.env.CHECK_BASE_REF;
  const sources = loadSourcesToCheck(baseRef);

  if (baseRef && sources.length === 0) {
    console.log("No new or changed sources compared to base ref - nothing to check.");
    return;
  }

  const results: CheckResult[] = [];

  for (const source of sources) {
    const result = await checkUrl(source.url);
    results.push({ name: source.name, url: source.url, ...result });
    const label = result.ok ? "OK" : "FAIL";
    const detail = result.status !== undefined ? String(result.status) : (result.error ?? "unknown error");
    console.log(`  [${label.padEnd(4)}] ${detail.padEnd(24)} ${source.name} - ${source.url}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} sources reachable\n`);

  if (failed.length > 0) {
    console.log("Failed sources:");
    for (const f of failed) {
      console.log(`  - ${f.name} (${f.url}): ${f.status ?? f.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
