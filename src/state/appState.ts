import { defaultFilterState, type FilterState } from "./filters";

export interface AppState {
  filters: FilterState;
  carousel: number;
  openPast: Set<string>;
  collapsedYears: Record<number, boolean>;
  showCurrentMonthPast: boolean;
}

export function createInitialState(): AppState {
  return {
    filters: defaultFilterState(),
    carousel: 0,
    openPast: new Set(),
    collapsedYears: {},
    showCurrentMonthPast: false,
  };
}
