import { MONTH_NAMES, type EventsByMonth, type MonthName, type TechEvent } from "../../src/types.ts";

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildEventId(date: string, title: string): string {
  const [year, month] = date.split("-");
  return `${year}-${month}-${slugify(title)}`;
}

export function monthNameFromDate(date: string): MonthName {
  const monthIndex = Number(date.split("-")[1]) - 1;
  return MONTH_NAMES[monthIndex];
}

export function sortEventsByMonth(events: EventsByMonth): EventsByMonth {
  const ordered: EventsByMonth = {};
  for (const month of MONTH_NAMES) {
    const bucket = events[month];
    if (bucket && bucket.length > 0) {
      ordered[month] = [...bucket].sort((a, b) => a.date.localeCompare(b.date));
    }
  }
  return ordered;
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

export type { EventsByMonth, MonthName, TechEvent };
