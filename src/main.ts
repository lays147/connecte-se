import "./style.css";
import { MONTH_NAMES, type MonthName, type TechEvent } from "./types";
import { availableYears, loadYear } from "./data/loadEvents";
import { renderMonthGroup } from "./render/monthGroup";
import { applyFilters, renderFilters, type FilterState } from "./filters";

interface MonthCursor {
  year: number;
  monthIndex: number;
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app element not found");

const years = availableYears();
const earliestYear = years[years.length - 1];
const latestYear = years[0];

const now = new Date();
let currentMonth: MonthCursor = {
  year: now.getFullYear(),
  monthIndex: now.getMonth(),
};

if (!years.includes(currentMonth.year)) {
  currentMonth = { year: latestYear, monthIndex: 11 };
}

const allEvents: TechEvent[] = years.flatMap((year) => {
  const yearData = loadYear(year);
  if (!yearData) return [];
  return Object.values(yearData).flat();
});

let filterState: FilterState = { region: "Todos", type: "Todos", paid: "Todos" };

function stepBack(c: MonthCursor): MonthCursor | null {
  if (c.monthIndex > 0) {
    return { year: c.year, monthIndex: c.monthIndex - 1 };
  }
  const previousYear = c.year - 1;
  if (previousYear < earliestYear) return null;
  return { year: previousYear, monthIndex: 11 };
}

function stepForward(c: MonthCursor): MonthCursor | null {
  if (c.monthIndex < 11) {
    return { year: c.year, monthIndex: c.monthIndex + 1 };
  }
  const nextYear = c.year + 1;
  if (nextYear > latestYear) return null;
  return { year: nextYear, monthIndex: 0 };
}

function findNextNonEmptyMonth(
  start: MonthCursor,
  step: (c: MonthCursor) => MonthCursor | null,
): MonthCursor | null {
  let c: MonthCursor | null = start;
  while (c) {
    const yearData = loadYear(c.year);
    const monthName = MONTH_NAMES[c.monthIndex] as MonthName;
    const events = yearData?.[monthName];
    if (events && events.length > 0) return c;
    c = step(c);
  }
  return null;
}

const header = document.createElement("header");
header.className = "mx-auto max-w-5xl px-4 pb-8 pt-12 text-center";

const title = document.createElement("h1");
title.className = "text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl";
title.textContent = "Conecte-se Brasil";

const subtitle = document.createElement("p");
subtitle.className = "mt-3 text-base text-brand-700 sm:text-lg";
subtitle.textContent =
  "As conexões que você faz em eventos, podem mudar sua carreira!";

header.append(title, subtitle);

const main = document.createElement("main");
main.className = "mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16";

const filtersBar = renderFilters(allEvents, (state) => {
  filterState = state;
  applyFilters(main, filterState);
});
main.appendChild(filtersBar);

const monthsContainer = document.createElement("div");
monthsContainer.className = "flex flex-col gap-10";
main.appendChild(monthsContainer);

const loadMoreWrapper = document.createElement("div");
loadMoreWrapper.className = "flex justify-center";
const loadMoreButton = document.createElement("button");
loadMoreButton.type = "button";
loadMoreButton.className =
  "rounded-xl border border-brand-300 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40";
loadMoreButton.textContent = "Carregar meses anteriores";
loadMoreWrapper.appendChild(loadMoreButton);
main.appendChild(loadMoreWrapper);

function renderMonthAt(c: MonthCursor, prepend: boolean): void {
  const monthName = MONTH_NAMES[c.monthIndex] as MonthName;
  const events = loadYear(c.year)?.[monthName] ?? [];
  if (events.length === 0) return;

  const group = renderMonthGroup(monthName, c.year, events);
  if (prepend) {
    monthsContainer.prepend(group);
  } else {
    monthsContainer.appendChild(group);
  }
  applyFilters(group, filterState);
}

let earliestLoadedCursor: MonthCursor | null = findNextNonEmptyMonth(
  currentMonth,
  stepForward,
);
if (earliestLoadedCursor) {
  renderMonthAt(earliestLoadedCursor, false);

  let futureCursor = stepForward(earliestLoadedCursor);
  while (futureCursor) {
    const nonEmpty = findNextNonEmptyMonth(futureCursor, stepForward);
    if (!nonEmpty) break;
    renderMonthAt(nonEmpty, false);
    futureCursor = stepForward(nonEmpty);
  }
}

let previousCursor: MonthCursor | null = earliestLoadedCursor
  ? findNextNonEmptyMonth(stepBack(earliestLoadedCursor) ?? currentMonth, stepBack)
  : findNextNonEmptyMonth(currentMonth, stepBack);

function loadPreviousMonth(): void {
  if (!previousCursor) {
    loadMoreButton.disabled = true;
    return;
  }

  renderMonthAt(previousCursor, true);
  earliestLoadedCursor = previousCursor;

  const previous = stepBack(previousCursor);
  previousCursor = previous ? findNextNonEmptyMonth(previous, stepBack) : null;

  if (!previousCursor) {
    loadMoreButton.disabled = true;
  }
}

loadMoreButton.addEventListener("click", loadPreviousMonth);

if (!previousCursor) {
  loadMoreButton.disabled = true;
}

if (monthsContainer.children.length === 0) {
  const empty = document.createElement("p");
  empty.className = "text-center text-brand-500";
  empty.textContent = "Nenhum evento encontrado.";
  monthsContainer.appendChild(empty);
}

app.append(header, main);
