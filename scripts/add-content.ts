import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { parseContent, type ContentSectionKey } from "../src/data/content.ts";
import { stringifyContent } from "./lib/stringifyContent.ts";

const CONTENT_PATH = fileURLToPath(new URL("../sources/content.yaml", import.meta.url));

interface CliArgs {
  section: ContentSectionKey;
  name: string;
  desc: string;
  themes: string[];
  url: string;
}

function parseCliArgs(argv: string[]): CliArgs {
  const get = (flag: string): string | undefined => {
    const prefix = `--${flag}=`;
    const arg = argv.find((a) => a.startsWith(prefix));
    return arg?.slice(prefix.length);
  };

  const section = get("section");
  const name = get("name");
  const desc = get("desc");
  const themes = get("themes");
  const url = get("url");

  if (!section || !name || !desc || !themes || !url) {
    throw new Error(
      "Usage: add-content --section=<youtube|newsletter|blog|podcast|curso> --name=<name> --desc=<desc> --themes=<theme1,theme2> --url=<url>",
    );
  }

  return {
    section: section as ContentSectionKey,
    name,
    desc,
    themes: themes.split(",").map((t) => t.trim()).filter(Boolean),
    url,
  };
}

function main(): void {
  const args = parseCliArgs(process.argv.slice(2));

  const raw = parse(readFileSync(CONTENT_PATH, "utf-8"));
  const content = parseContent(raw);

  const section = content[args.section];
  if (!section) {
    throw new Error(`Invalid section "${args.section}"`);
  }

  if (section.items.some((item) => item.url === args.url)) {
    throw new Error(`An item with url "${args.url}" already exists in section "${args.section}"`);
  }
  if (section.items.some((item) => item.name.toLowerCase() === args.name.toLowerCase())) {
    throw new Error(`An item named "${args.name}" already exists in section "${args.section}"`);
  }

  section.items.push({ name: args.name, desc: args.desc, themes: args.themes, url: args.url });
  section.items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  // Re-validate through the same schema used at load time so a bad
  // workflow_dispatch input fails loudly instead of writing garbage.
  parseContent(content);

  writeFileSync(CONTENT_PATH, stringifyContent(content));
  console.log(`Added "${args.name}" (${args.url}) to section "${args.section}" in ${CONTENT_PATH}`);
}

main();
