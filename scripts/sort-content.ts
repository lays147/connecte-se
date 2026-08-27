import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { parseContent } from "../src/data/content.ts";
import { stringifyContent } from "./lib/stringifyContent.ts";

const CONTENT_PATH = fileURLToPath(new URL("../sources/content.yaml", import.meta.url));

function main(): void {
  const raw = parse(readFileSync(CONTENT_PATH, "utf-8"));
  const content = parseContent(raw);

  let total = 0;
  for (const key of Object.keys(content) as (keyof typeof content)[]) {
    content[key].items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    total += content[key].items.length;
  }

  writeFileSync(CONTENT_PATH, stringifyContent(content));
  console.log(`Sorted ${total} items by name across ${Object.keys(content).length} sections in ${CONTENT_PATH}`);
}

main();
