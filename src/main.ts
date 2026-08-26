import "./style.css";
import { MONTH_NAMES, type MonthName, type TechEvent } from "./types";
import { availableYears, loadYear } from "./data/loadEvents";
import { monthSectionId, renderMonthGroup } from "./render/monthGroup";
import { highlightActiveMonth, renderMonthNav, type MonthNavEntry } from "./render/monthNav";
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

const monthNavEntries: MonthNavEntry[] = years.flatMap((year) => {
  const yearData = loadYear(year);
  if (!yearData) return [];
  return MONTH_NAMES.map((monthName, monthIndex) => ({ year, monthIndex, monthName })).filter(
    ({ monthName }) => (yearData[monthName]?.length ?? 0) > 0,
  );
});
monthNavEntries.sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);

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

const siteHeader = document.createElement("header");
siteHeader.className = "border-b border-brand-200 bg-white";

const siteHeaderInner = document.createElement("div");
siteHeaderInner.className =
  "mx-auto flex max-w-6xl items-center justify-between px-4 py-4";

const siteName = document.createElement("span");
siteName.className = "text-lg font-bold tracking-tight text-brand-950";
siteName.textContent = "Conecte-se Brasil";

const githubLink = document.createElement("a");
githubLink.href = "https://github.com/lays147/connecte-se";
githubLink.target = "_blank";
githubLink.rel = "noopener noreferrer";
githubLink.setAttribute("aria-label", "Repositório no GitHub");
githubLink.className = "text-brand-700 transition-colors hover:text-brand-950";
githubLink.innerHTML = `
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.44-2.7 5.42-5.28 5.7.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
  </svg>
`;

siteHeaderInner.append(siteName, githubLink);
siteHeader.appendChild(siteHeaderInner);

const header = document.createElement("div");
header.className = "mx-auto max-w-6xl px-4 pb-8 pt-12 text-center";

const title = document.createElement("h1");
title.className = "text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl";
title.textContent = "Conecte-se Brasil";

const subtitle = document.createElement("p");
subtitle.className = "mt-3 text-base text-brand-700 sm:text-lg";
subtitle.textContent =
  "As conexões que você faz em eventos, podem mudar sua carreira!";

const disclaimer = document.createElement("p");
disclaimer.className = "mt-2 text-xs text-brand-500 sm:text-sm";
disclaimer.textContent =
  "As informações exibidas foram obtidas com o claudinho e podem estar imprecisas ou desatualizadas.";

header.append(title, subtitle, disclaimer);

const contentRow = document.createElement("div");
contentRow.className =
  "mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 lg:flex-row lg:items-start lg:gap-10";

const main = document.createElement("main");
main.className = "flex min-w-0 flex-1 flex-col gap-8";

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

const sectionObserver = new IntersectionObserver(
  (observerEntries) => {
    const visible = observerEntries
      .filter((observerEntry) => observerEntry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length === 0) return;
    highlightActiveMonth(monthNav, visible[0].target.id);
  },
  { rootMargin: "-96px 0px -70% 0px" },
);

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
  sectionObserver.observe(group);
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

function jumpToMonth(entry: MonthNavEntry): void {
  const sectionId = monthSectionId(entry.year, entry.monthName);
  let section = document.getElementById(sectionId);

  while (!section && previousCursor) {
    loadPreviousMonth();
    section = document.getElementById(sectionId);
  }

  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (section) highlightActiveMonth(monthNav, sectionId);
}

const monthNav = renderMonthNav(monthNavEntries, jumpToMonth);

if (monthsContainer.children.length === 0) {
  const empty = document.createElement("p");
  empty.className = "text-center text-brand-500";
  empty.textContent = "Nenhum evento encontrado.";
  monthsContainer.appendChild(empty);
}

const footer = document.createElement("footer");
footer.className = "border-t border-brand-200 bg-white";

const footerInner = document.createElement("div");
footerInner.className =
  "mx-auto max-w-6xl px-4 py-6 text-center text-sm text-brand-700";

const copyright = document.createElement("p");
copyright.textContent = "© 2026 Lays. Todos os direitos reservados.";

const contact = document.createElement("p");
contact.className = "mt-1";
contact.append("Contato: ");
const contactLink = document.createElement("a");
contactLink.href = "mailto:lays@lays147.dev.br";
contactLink.className = "font-medium text-brand-700 underline hover:text-brand-950";
contactLink.textContent = "lays@lays147.dev.br";
contact.appendChild(contactLink);

footerInner.append(copyright, contact);
footer.appendChild(footerInner);

contentRow.append(monthNav, main);
app.append(siteHeader, header, contentRow, footer);
