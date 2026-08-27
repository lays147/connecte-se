import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { parseSources } from "../src/data/sources.ts";

const SOURCES_PATH = fileURLToPath(new URL("../sources/communities.yaml", import.meta.url));

function main(): void {
  const raw = parse(readFileSync(SOURCES_PATH, "utf-8"));
  const sources = parseSources(raw);

  const sorted = [...sources].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  writeFileSync(SOURCES_PATH, stringify({ sources: sorted }));
  console.log(`Sorted ${sorted.length} sources by name in ${SOURCES_PATH}`);
}

main();
