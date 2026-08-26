import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { parseSources, type EventSource, type Frequency, type SourceType } from "../src/data/sources.ts";

const SOURCES_PATH = fileURLToPath(new URL("../sources/communities.yaml", import.meta.url));

interface CliArgs {
  name: string;
  url: string;
  type: SourceType;
  frequency: Frequency;
}

function parseCliArgs(argv: string[]): CliArgs {
  const get = (flag: string): string | undefined => {
    const prefix = `--${flag}=`;
    const arg = argv.find((a) => a.startsWith(prefix));
    return arg?.slice(prefix.length);
  };

  const name = get("name");
  const url = get("url");
  const type = get("type");
  const frequency = get("frequency");

  if (!name || !url || !type || !frequency) {
    throw new Error(
      "Usage: add-source --name=<name> --url=<url> --type=<community|event> --frequency=<monthly|yearly|occasionally>",
    );
  }

  return { name, url, type: type as SourceType, frequency: frequency as Frequency };
}

function main(): void {
  const args = parseCliArgs(process.argv.slice(2));

  const raw = parse(readFileSync(SOURCES_PATH, "utf-8"));
  const sources = parseSources(raw);

  if (sources.some((s) => s.url === args.url)) {
    throw new Error(`A source with url "${args.url}" already exists`);
  }
  if (sources.some((s) => s.name.toLowerCase() === args.name.toLowerCase())) {
    throw new Error(`A source named "${args.name}" already exists`);
  }

  const newSource: EventSource = {
    name: args.name,
    url: args.url,
    type: args.type,
    frequency: args.frequency,
  };

  // Re-validate through the same schema used at load time so a bad
  // workflow_dispatch input fails loudly instead of writing garbage.
  parseSources({ sources: [...sources, newSource] });

  const updated = [...sources, newSource].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  writeFileSync(SOURCES_PATH, stringify({ sources: updated }));
  console.log(`Added source "${args.name}" (${args.url}) to ${SOURCES_PATH}`);
}

main();
