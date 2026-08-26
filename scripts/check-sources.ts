import { loadSources } from "../src/data/sources.ts";

const TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; tech-brazil-source-check/1.0; +https://github.com/lays147/connecte-se)";

interface CheckResult {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.status === 405 || response.status === 403) {
      // Some sites block HEAD-like/unfamiliar requests; a plain GET with a
      // browser UA is enough to know whether the page genuinely exists.
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
    }

    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
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
