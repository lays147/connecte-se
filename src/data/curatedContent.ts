import { parse } from "yaml";
import contentYaml from "../../sources/content.yaml?raw";

export type ContentFormat = "YouTube" | "Newsletter" | "Blog" | "Podcast" | "Curso";

export interface CuratedContent {
  name: string;
  fmt: ContentFormat;
  desc: string;
  themes: string[];
  url: string;
}

interface ContentSectionMeta {
  accent: string;
  tint: string;
  note: string;
}

const SECTION_META: Record<string, ContentSectionMeta> = {
  youtube: { accent: "oklch(0.5 0.17 292)", tint: "#f1ecfd", note: "vídeo, aulas e conversas longas" },
  newsletter: { accent: "oklch(0.5 0.13 250)", tint: "#eaf0fb", note: "chega por e-mail, leitura semanal" },
  blog: { accent: "oklch(0.52 0.12 60)", tint: "#faf1e6", note: "texto longo, técnico e opinativo" },
  podcast: { accent: "oklch(0.48 0.12 165)", tint: "#e8f5ef", note: "áudio para ouvir no deslocamento" },
  curso: { accent: "oklch(0.5 0.14 20)", tint: "#fbecec", note: "aulas estruturadas do início ao fim" },
};

interface RawContentItem {
  name: string;
  desc: string;
  themes: string[];
  url: string;
}

interface RawContentSection {
  label: string;
  items: RawContentItem[];
}

type RawContent = Record<string, RawContentSection>;

const raw = parse(contentYaml) as RawContent;
const sectionKeys = Object.keys(raw);

export const FORMAT_ORDER: ContentFormat[] = sectionKeys.map((key) => raw[key].label as ContentFormat);

export const FORMAT_META: Record<ContentFormat, ContentSectionMeta> = Object.fromEntries(
  sectionKeys.map((key) => [
    raw[key].label,
    SECTION_META[key] ?? { accent: "oklch(0.5 0.1 0)", tint: "#f1f1f1", note: "" },
  ]),
) as Record<ContentFormat, ContentSectionMeta>;

export const CURATED_CONTENT: CuratedContent[] = sectionKeys.flatMap((key) =>
  raw[key].items.map((item) => ({
    name: item.name,
    fmt: raw[key].label as ContentFormat,
    desc: item.desc,
    themes: item.themes,
    url: item.url,
  })),
);

export const THEMES: string[] = [...new Set(CURATED_CONTENT.flatMap((item) => item.themes))].sort((a, b) =>
  a.localeCompare(b, "pt-BR"),
);
