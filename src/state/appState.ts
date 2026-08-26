import type { GroupBy } from "../render/groupToggle";
import { defaultFilterState, type FilterState } from "./filters";

export interface AppState {
  filters: FilterState;
  groupBy: GroupBy;
  carousel: number;
  openPast: Set<string>;
  collapsedYears: Record<number, boolean>;
}

export function createInitialState(): AppState {
  return {
    filters: defaultFilterState(),
    groupBy: "data",
    carousel: 0,
    openPast: new Set(),
    collapsedYears: {},
  };
}
