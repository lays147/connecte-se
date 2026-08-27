import { loadContent } from "../src/data/content.ts";
import { checkUrl } from "./lib/checkUrl.ts";

interface CheckResult {
  section: string;
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

async function main(): Promise<void> {
  const content = loadContent();
  const results: CheckResult[] = [];

  for (const [section, { items }] of Object.entries(content)) {
    for (const item of items) {
      const result = await checkUrl(item.url);
      results.push({ section, name: item.name, url: item.url, ...result });
      const label = result.ok ? "OK" : "FAIL";
      const detail = result.status !== undefined ? String(result.status) : (result.error ?? "unknown error");
      console.log(`  [${label.padEnd(4)}] ${detail.padEnd(24)} ${item.name} (${section}) - ${item.url}`);
    }
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
