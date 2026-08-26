import { loadSources } from "../src/data/sources.ts";
import { checkUrl } from "./lib/checkUrl.ts";

interface CheckResult {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

async function main(): Promise<void> {
  const sources = loadSources();
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
