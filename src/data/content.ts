import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export type ContentSectionKey = "youtube" | "newsletter" | "blog" | "podcast" | "curso";

export interface ContentItem {
  name: string;
  desc: string;
  themes: string[];
  url: string;
}

export interface ContentSection {
  label: string;
  items: ContentItem[];
}

export type ContentFile = Record<ContentSectionKey, ContentSection>;

const SECTION_KEYS: ContentSectionKey[] = ["youtube", "newsletter", "blog", "podcast", "curso"];

const DEFAULT_CONTENT_PATH = fileURLToPath(new URL("../../sources/content.yaml", import.meta.url));

export function parseContent(raw: unknown): ContentFile {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid content file: expected a top-level object keyed by section");
  }

  for (const key of SECTION_KEYS) {
    const section = (raw as Record<string, unknown>)[key];
    if (typeof section !== "object" || section === null) {
      throw new Error(`Invalid content file: missing section "${key}"`);
    }

    const { label, items } = section as Record<string, unknown>;
    if (typeof label !== "string" || label.trim() === "") {
      throw new Error(`Invalid section "${key}": 'label' must be a non-empty string`);
    }
    if (!Array.isArray(items)) {
      throw new Error(`Invalid section "${key}": 'items' must be a list`);
    }

    items.forEach((entry, index) => {
      if (typeof entry !== "object" || entry === null) {
        throw new Error(`Invalid item at ${key}[${index}]: expected an object`);
      }
      const { name, desc, themes, url } = entry as Record<string, unknown>;
      if (typeof name !== "string" || name.trim() === "") {
        throw new Error(`Invalid item at ${key}[${index}]: 'name' must be a non-empty string`);
      }
      if (typeof desc !== "string" || desc.trim() === "") {
        throw new Error(`Invalid item "${name}": 'desc' must be a non-empty string`);
      }
      if (!Array.isArray(themes) || themes.some((t) => typeof t !== "string")) {
        throw new Error(`Invalid item "${name}": 'themes' must be a list of strings`);
      }
      if (typeof url !== "string" || !isValidUrl(url)) {
        throw new Error(`Invalid item "${name}": 'url' must be a valid URL`);
      }
    });
  }

  return raw as ContentFile;
}

export function loadContent(filePath: string = DEFAULT_CONTENT_PATH): ContentFile {
  const raw = parse(readFileSync(filePath, "utf-8"));
  return parseContent(raw);
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
