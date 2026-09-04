import type { EnrichedEvent } from "../types";
import { cityCoordsOf, haversineKm } from "../data/cityCoords";
import type { Coords } from "./geolocation";

export const NEAR_ME_RADIUS_KM = 100;

export interface FilterState {
  region: string;
  city: string;
  type: string;
  paid: string;
  query: string;
  nearMe: Coords | null;
}

const ALL = "Todos";

export function defaultFilterState(): FilterState {
  return { region: ALL, city: ALL, type: ALL, paid: ALL, query: "", nearMe: null };
}

export function distanceKm(event: EnrichedEvent, from: Coords): number | null {
  const coords = cityCoordsOf(event.city);
  if (!coords) return null;
  return haversineKm([from.lat, from.lng], coords);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesFilters(event: EnrichedEvent, state: FilterState): boolean {
  if (state.region !== ALL && event.region !== state.region) return false;
  if (state.city !== ALL && event.city !== state.city) return false;
  if (state.type !== ALL && event.type !== state.type) return false;
  if (state.paid === "Pago" && !event.paid) return false;
  if (state.paid === "Gratuito" && event.paid) return false;
  if (state.nearMe) {
    const km = distanceKm(event, state.nearMe);
    if (km === null || km > NEAR_ME_RADIUS_KM) return false;
  }
  const query = state.query.trim();
  if (query) {
    const needle = normalize(query);
    const haystack = normalize([event.title, event.community, event.city, event.description].filter(Boolean).join(" "));
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export interface FilterOptions {
  region: string[];
  city: string[];
  type: string[];
  paid: string[];
}

export function filterOptions(allEvents: EnrichedEvent[]): FilterOptions {
  return {
    region: [ALL, ...uniqueSorted(allEvents.map((e) => e.region))],
    city: [ALL, ...uniqueSorted(allEvents.map((e) => e.city).filter((c): c is string => Boolean(c)))],
    type: [ALL, ...uniqueSorted(allEvents.map((e) => e.type))],
    paid: [ALL, "Gratuito", "Pago"],
  };
}
