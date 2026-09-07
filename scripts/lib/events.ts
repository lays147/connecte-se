import { MONTH_NAMES, type EventsByMonth, type MonthName, type TechEvent } from "../../src/types.ts";
import { eventDateKey, isValidEventDate } from "../../src/lib/date.ts";

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildEventId(date: string, title: string): string {
  const [, month, year] = date.split("/");
  return `${year}-${month}-${slugify(title)}`;
}

export function monthNameFromDate(date: string): MonthName {
  const monthIndex = Number(date.split("/")[1]) - 1;
  return MONTH_NAMES[monthIndex];
}

export function sortEventsByMonth(events: EventsByMonth): EventsByMonth {
  const ordered: EventsByMonth = {};
  for (const month of MONTH_NAMES) {
    const bucket = events[month];
    if (bucket && bucket.length > 0) {
      ordered[month] = [...bucket].sort((a, b) => eventDateKey(a.date).localeCompare(eventDateKey(b.date)));
    }
  }
  return ordered;
}

export function isValidDate(date: string): boolean {
  return isValidEventDate(date);
}

export type { EventsByMonth, MonthName, TechEvent };
