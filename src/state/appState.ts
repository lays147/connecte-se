import { defaultFilterState, type FilterState } from "./filters";

export interface AppState {
  filters: FilterState;
  carousel: number;
  openPast: Set<string>;
  collapsedYears: Record<number, boolean>;
  collapsedMonths: Set<string>;
  showCurrentMonthPast: boolean;
}

export function createInitialState(): AppState {
  return {
    filters: defaultFilterState(),
    carousel: 0,
    openPast: new Set(),
    collapsedYears: {},
    collapsedMonths: new Set(),
    showCurrentMonthPast: false,
  };
}
