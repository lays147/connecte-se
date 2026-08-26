import type { MonthName } from "../types";
import { monthSectionId } from "./monthGroup";

export interface MonthNavEntry {
  year: number;
  monthIndex: number;
  monthName: MonthName;
}

export function renderMonthNav(
  entries: MonthNavEntry[],
  onSelect: (entry: MonthNavEntry) => void,
): HTMLElement {
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Navegação por mês");
  nav.className =
    "flex shrink-0 flex-col gap-1 lg:sticky lg:top-4 lg:h-fit lg:w-40";

  const byYear = new Map<number, MonthNavEntry[]>();
  for (const entry of entries) {
    const list = byYear.get(entry.year) ?? [];
    list.push(entry);
    byYear.set(entry.year, list);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  for (const year of years) {
    const yearLabel = document.createElement("span");
    yearLabel.className =
      "mt-3 px-2 text-xs font-semibold uppercase tracking-wide text-brand-500 first:mt-0";
    yearLabel.textContent = String(year);
    nav.appendChild(yearLabel);

    for (const entry of byYear.get(year) ?? []) {
      const link = document.createElement("a");
      link.href = `#${monthSectionId(entry.year, entry.monthName)}`;
      link.dataset.navMonth = monthSectionId(entry.year, entry.monthName);
      link.className =
        "rounded-lg px-2 py-1 text-sm text-brand-700 transition-colors hover:bg-brand-100 hover:text-brand-950";
      link.textContent = entry.monthName;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        onSelect(entry);
      });
      nav.appendChild(link);
    }
  }

  return nav;
}

export function highlightActiveMonth(nav: HTMLElement, sectionId: string): void {
  const links = nav.querySelectorAll<HTMLAnchorElement>("[data-nav-month]");
  for (const link of links) {
    link.classList.toggle("bg-brand-100", link.dataset.navMonth === sectionId);
    link.classList.toggle("text-brand-950", link.dataset.navMonth === sectionId);
    link.classList.toggle("font-semibold", link.dataset.navMonth === sectionId);
  }
}
