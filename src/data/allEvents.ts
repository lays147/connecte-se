import type { EnrichedEvent } from "../types";
import { enrichEvent } from "./enrich";
import { availableYears, loadYear } from "./loadEvents";

export function loadAllEnrichedEvents(): EnrichedEvent[] {
  return availableYears().flatMap((year) => {
    const yearData = loadYear(year);
    if (!yearData) return [];
    return Object.values(yearData).flat().map(enrichEvent);
  });
}
