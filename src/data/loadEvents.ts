import type { EventsByMonth } from "../types";
import events2026 from "./events-2026.json";

const eventsByYear: Record<number, EventsByMonth> = {
  2026: events2026 as EventsByMonth,
};

export function loadYear(year: number): EventsByMonth | undefined {
  return eventsByYear[year];
}

export function availableYears(): number[] {
  return Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);
}
