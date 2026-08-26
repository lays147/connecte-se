import type { EventsByMonth } from "../types";

const modules = import.meta.glob<EventsByMonth>("./events-*.json", { eager: true, import: "default" });

const eventsByYear: Record<number, EventsByMonth> = {};
for (const [path, data] of Object.entries(modules)) {
  const match = path.match(/events-(\d{4})\.json$/);
  if (!match) continue;
  eventsByYear[Number(match[1])] = data;
}

export function loadYear(year: number): EventsByMonth | undefined {
  return eventsByYear[year];
}

export function availableYears(): number[] {
  return Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);
}
