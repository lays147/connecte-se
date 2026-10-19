import { createHash } from "node:crypto";
import type { PageLink } from "./extractEvents.ts";

const MAX_LINK_TEXT = 80;

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "whatsapp.com",
  "wa.me",
  "t.me",
  "discord.gg",
  "discord.com",
  "github.com",
];

function isSocialProfile(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "");
  const isSocial = SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  // Social event pages (e.g. linkedin.com/events/...) can be the event's own url.
  return isSocial && !url.pathname.includes("/events/");
}

function stripHash(href: string): string {
  const url = new URL(href);
  url.hash = "";
  return url.toString();
}

// Trims the link list sent to the model: drops duplicates, in-page anchors,
// social profiles and, for meetup.com groups, anything that isn't an event page.
export function filterLinks(links: PageLink[], sourceUrl: string): PageLink[] {
  const isMeetup = /^https:\/\/www\.meetup\.com\//.test(sourceUrl);
  const sourceKey = stripHash(sourceUrl);
  const seen = new Set<string>();
  const result: PageLink[] = [];

  for (const link of links) {
    let url: URL;
    try {
      url = new URL(link.href);
    } catch {
      continue;
    }
    const key = stripHash(link.href);
    if (key === sourceKey || seen.has(key)) continue;
    if (isSocialProfile(url)) continue;
    if (isMeetup && !url.pathname.includes("/events/")) continue;

    seen.add(key);
    result.push({ href: link.href, text: link.text.replace(/\s+/g, " ").slice(0, MAX_LINK_TEXT) });
  }
  return result;
}

const MONTHS =
  "jan|fev|feb|mar|abr|apr|mai|may|jun|jul|ago|aug|set|sep|out|oct|nov|dez|dec";

const DATE_PATTERNS = [
  /\b\d{1,2}\/\d{1,2}\b/, // 15/03, 15/03/2026
  /\b\d{4}-\d{2}-\d{2}\b/, // 2026-03-15
  new RegExp(`\\b\\d{1,2}\\s*(?:de\\s+)?(?:${MONTHS})[a-zç]*\\.?`, "i"), // 15 de março, 15 Mar
  new RegExp(`\\b(?:${MONTHS})[a-zç]*\\.?\\s+\\d{1,2}\\b`, "i"), // Mar 15, March 15
];

// Permissive check: false positives only cost an API call, false negatives lose events.
export function hasDateLikeText(text: string): boolean {
  return DATE_PATTERNS.some((pattern) => pattern.test(text));
}

export function hashPage(pageText: string, links: PageLink[], year: number): string {
  const hash = createHash("sha256");
  hash.update(String(year));
  hash.update("\0");
  hash.update(pageText);
  for (const link of links) {
    hash.update("\0");
    hash.update(link.href);
    hash.update("\t");
    hash.update(link.text);
  }
  return hash.digest("hex");
}
