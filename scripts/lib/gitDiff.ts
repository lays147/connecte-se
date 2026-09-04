import { execFileSync } from "node:child_process";

/**
 * Returns the file content at `ref` as it existed in git, or `null` if the
 * file didn't exist at that ref (e.g. it was newly added in this PR).
 */
export function readFileAtRef(ref: string, relativePath: string): string | null {
  try {
    return execFileSync("git", ["show", `${ref}:${relativePath}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/**
 * Given the base-ref and current lists of entries (each with a `url`),
 * returns only the URLs that are new or whose set of entries changed
 * relative to the base ref. Multiple entries may share the same URL (e.g.
 * several events linking to the same page), so entries are grouped by URL
 * and compared as a set rather than one-to-one.
 */
export function diffByUrl<T extends { url: string }>(baseEntries: T[], currentEntries: T[]): T[] {
  const groupByUrl = (entries: T[]): Map<string, T[]> => {
    const groups = new Map<string, T[]>();
    for (const entry of entries) {
      const group = groups.get(entry.url) ?? [];
      group.push(entry);
      groups.set(entry.url, group);
    }
    return groups;
  };

  const baseGroups = groupByUrl(baseEntries);
  const currentGroups = groupByUrl(currentEntries);

  const changedUrls = new Set<string>();
  for (const [url, group] of currentGroups) {
    const baseGroup = baseGroups.get(url);
    if (!baseGroup || JSON.stringify(baseGroup) !== JSON.stringify(group)) {
      changedUrls.add(url);
    }
  }

  return currentEntries.filter((entry) => changedUrls.has(entry.url));
}
