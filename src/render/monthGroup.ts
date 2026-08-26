import { MONTH_NAMES, type MonthName, type TechEvent } from "../types";
import { renderCard } from "./card";

export function monthSectionId(year: number, month: MonthName): string {
  const monthIndex = MONTH_NAMES.indexOf(month) + 1;
  return `month-${year}-${String(monthIndex).padStart(2, "0")}`;
}

export function renderMonthGroup(
  month: MonthName,
  year: number,
  events: TechEvent[],
): HTMLElement {
  const section = document.createElement("section");
  section.id = monthSectionId(year, month);
  section.dataset.month = month;
  section.className = "flex flex-col gap-4 scroll-mt-20";

  const heading = document.createElement("h2");
  heading.className = "text-xl font-bold text-brand-900";
  heading.textContent = `${month} ${year}`;
  section.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  grid.dataset.cardGrid = "true";

  for (const event of events) {
    const card = renderCard(event);
    card.dataset.region = event.region;
    card.dataset.type = event.type;
    card.dataset.modality = event.modality;
    card.dataset.paid = String(event.paid);
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}
