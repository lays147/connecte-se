import type { EnrichedEvent } from "../types";

export interface FilterState {
  region: string;
  type: string;
  paid: string;
}

const ALL = "Todos";

export function defaultFilterState(): FilterState {
  return { region: ALL, type: ALL, paid: ALL };
}

export function matchesFilters(event: EnrichedEvent, state: FilterState): boolean {
  if (state.region !== ALL && event.region !== state.region) return false;
  if (state.type !== ALL && event.type !== state.type) return false;
  if (state.paid === "Pago" && !event.paid) return false;
  if (state.paid === "Gratuito" && event.paid) return false;
  return true;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export interface FilterOptions {
  region: string[];
  type: string[];
  paid: string[];
}

export function filterOptions(allEvents: EnrichedEvent[]): FilterOptions {
  return {
    region: [ALL, ...uniqueSorted(allEvents.map((e) => e.region))],
    type: [ALL, ...uniqueSorted(allEvents.map((e) => e.type))],
    paid: [ALL, "Gratuito", "Pago"],
  };
}
