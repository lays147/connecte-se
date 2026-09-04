import { parse } from "yaml";
import sourcesYaml from "../../sources/communities.yaml?raw";

export type SourceType = "community" | "event";
export type Frequency = "monthly" | "yearly" | "occasionally";

export interface CommunitySource {
  name: string;
  url: string;
  type: SourceType;
  frequency: Frequency;
}

interface RawSources {
  sources: CommunitySource[];
}

const raw = parse(sourcesYaml) as RawSources;

export const ALL_SOURCES: CommunitySource[] = raw.sources;

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
