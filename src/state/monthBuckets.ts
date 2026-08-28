import { MONTH_NAMES, type EnrichedEvent } from "../types";

function iso(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function ord(y: number, m: number): number {
  return y * 12 + m;
}

export interface MonthBucket {
  key: string;
  year: number;
  monthIndex: number;
  order: number;
  all: EnrichedEvent[];
  list: EnrichedEvent[];
  past: EnrichedEvent[];
  hasPast: boolean;
  isPast: boolean;
  isCurrent: boolean;
  opened: boolean;
  label: string;
}

export function buildMonthBuckets(
  events: EnrichedEvent[],
  today: Date,
  openPast: Set<string>,
  showCurrentMonthPast = false,
): MonthBucket[] {
  const todayIso = iso(today);
  const curOrd = ord(today.getFullYear(), today.getMonth());

  const buckets = new Map<string, MonthBucket>();
  for (const e of events) {
    const [y, m] = e.date.split("-").map(Number);
    const monthIndex = m - 1;
    const key = y + "-" + monthIndex;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        key,
        year: y,
        monthIndex,
        order: ord(y, monthIndex),
        all: [],
        list: [],
        past: [],
        hasPast: false,
        isPast: false,
        isCurrent: false,
        opened: false,
        label: MONTH_NAMES[monthIndex],
      };
      buckets.set(key, bucket);
    }
    bucket.all.push(e);
  }

  const bucketList = [...buckets.values()].sort((a, b) => a.order - b.order);
  for (const b of bucketList) {
    b.all.sort((x, y) => x.date.localeCompare(y.date) || x.time.localeCompare(y.time));
    b.isPast = b.order < curOrd;
    b.isCurrent = b.order === curOrd;
    b.opened = openPast.has(b.key);
    if (b.isCurrent && !b.opened) {
      b.list = b.all.filter((e) => e.date >= todayIso);
      const pastEvents = b.all.filter((e) => e.date < todayIso);
      b.hasPast = pastEvents.length > 0;
      b.past = showCurrentMonthPast ? pastEvents : [];
    } else {
      b.list = b.all;
      b.past = [];
      b.hasPast = false;
    }
  }

  return bucketList;
}

export interface YearNavMonth {
  key: string;
  label: string;
  count: number;
  loaded: boolean;
  locked: boolean;
  isCurrent: boolean;
}

export interface YearNavGroup {
  year: number;
  months: YearNavMonth[];
  lockedKeys: string[];
  hasLocked: boolean;
  isCurrentYear: boolean;
  open: boolean;
}

export function buildYearNav(
  bucketList: MonthBucket[],
  collapsedYears: Record<number, boolean>,
  today: Date,
): YearNavGroup[] {
  const thisYear = today.getFullYear();
  const groups = new Map<number, YearNavGroup>();

  for (const b of bucketList) {
    let group = groups.get(b.year);
    if (!group) {
      const isCurrentYear = b.year === thisYear;
      const isPastYear = b.year < thisYear;
      group = {
        year: b.year,
        months: [],
        lockedKeys: [],
        hasLocked: false,
        isCurrentYear,
        open: collapsedYears[b.year] !== undefined ? !collapsedYears[b.year] : !isPastYear,
      };
      groups.set(b.year, group);
    }
    const loaded = !b.isPast || b.opened;
    group.months.push({
      key: b.key,
      label: b.label,
      count: loaded ? b.list.length : b.all.length,
      loaded,
      locked: !loaded,
      isCurrent: b.isCurrent,
    });
    if (!loaded) group.lockedKeys.push(b.key);
  }

  for (const group of groups.values()) {
    group.hasLocked = group.lockedKeys.length > 0;
  }

  return [...groups.values()].sort((a, b) => b.year - a.year);
}
