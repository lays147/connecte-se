import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export type SourceType = "community" | "event";
export type Frequency = "monthly" | "yearly" | "occasionally";

export interface EventSource {
  name: string;
  url: string;
  type: SourceType;
  frequency: Frequency;
}

const SOURCE_TYPES: SourceType[] = ["community", "event"];
const FREQUENCIES: Frequency[] = ["monthly", "yearly", "occasionally"];

const DEFAULT_SOURCES_PATH = fileURLToPath(
  new URL("../../sources/communities.yaml", import.meta.url),
);

export function parseSources(raw: unknown): EventSource[] {
  if (typeof raw !== "object" || raw === null || !("sources" in raw)) {
    throw new Error("Invalid sources file: expected a top-level 'sources' list");
  }

  const list = (raw as { sources: unknown }).sources;
  if (!Array.isArray(list)) {
    throw new Error("Invalid sources file: 'sources' must be a list");
  }

  return list.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`Invalid source at index ${index}: expected an object`);
    }

    const { name, url, type, frequency } = entry as Record<string, unknown>;

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`Invalid source at index ${index}: 'name' must be a non-empty string`);
    }

    if (typeof url !== "string" || !isValidUrl(url)) {
      throw new Error(`Invalid source "${name}": 'url' must be a valid URL`);
    }

    if (typeof type !== "string" || !SOURCE_TYPES.includes(type as SourceType)) {
      throw new Error(
        `Invalid source "${name}": 'type' must be one of ${SOURCE_TYPES.join(", ")}`,
      );
    }

    if (typeof frequency !== "string" || !FREQUENCIES.includes(frequency as Frequency)) {
      throw new Error(
        `Invalid source "${name}": 'frequency' must be one of ${FREQUENCIES.join(", ")}`,
      );
    }

    return { name, url, type: type as SourceType, frequency: frequency as Frequency };
  });
}

export function loadSources(filePath: string = DEFAULT_SOURCES_PATH): EventSource[] {
  const raw = parse(readFileSync(filePath, "utf-8"));
  return parseSources(raw);
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
