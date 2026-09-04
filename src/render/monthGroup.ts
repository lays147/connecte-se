import type { Coords } from "../state/geolocation";
import type { MonthBucket } from "../state/monthBuckets";
import { renderCard } from "./card";

export function monthSectionId(year: number, monthIndex: number): string {
  return `month-${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export interface MonthSectionHandlers {
  onToggleCurrentMonthPast: () => void;
  onToggleCollapsed: () => void;
}

export function renderMonthSection(
  bucket: MonthBucket,
  today: Date,
  showCurrentMonthPast: boolean,
  collapsed: boolean,
  handlers: MonthSectionHandlers,
  nearMe: Coords | null = null,
): HTMLElement {
  const section = document.createElement("section");
  section.id = monthSectionId(bucket.year, bucket.monthIndex);
  section.className = "flex scroll-mt-4 flex-col";

  const heading = document.createElement("button");
  heading.type = "button";
  heading.className = [
    "flex cursor-pointer items-baseline gap-2.5 border-b border-brand-100 px-(--spacing-gutter) py-4 text-left hover:bg-brand-50/50",
    bucket.isPast ? "bg-brand-50/30" : "bg-white",
  ].join(" ");
  heading.setAttribute("aria-expanded", String(!collapsed));
  heading.addEventListener("click", handlers.onToggleCollapsed);

  const dot = document.createElement("span");
  dot.className = `size-1.75 rounded-full ${bucket.isPast ? "bg-brand-300" : "bg-brand-700"}`;
  heading.appendChild(dot);

  const label = document.createElement("h2");
  label.className = "font-display text-heading-sm font-semibold capitalize text-brand-950";
  label.textContent = `${bucket.label} ${bucket.year}`;
  heading.appendChild(label);

  const count = document.createElement("span");
  count.className = "font-mono-label text-label-sm text-brand-500";
  count.textContent = bucket.list.length + (bucket.list.length === 1 ? " evento" : " eventos");
  heading.appendChild(count);

  const chevron = document.createElement("span");
  chevron.setAttribute("aria-hidden", "true");
  chevron.className = `text-brand-400 transition-transform ${collapsed ? "-rotate-90" : ""}`;
  chevron.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  heading.appendChild(chevron);

  if (bucket.isPast && bucket.opened) {
    const badge = document.createElement("span");
    badge.className =
      "rounded-full border border-brand-100 px-2 py-1 font-mono-label text-label-xs font-medium uppercase tracking-wider text-brand-500";
    badge.textContent = "Mês encerrado";
    heading.appendChild(badge);
  }

  section.appendChild(heading);

  if (collapsed) {
    return section;
  }

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 gap-4 px-(--spacing-gutter) py-5 sm:grid-cols-2 lg:grid-cols-3";

  for (const event of bucket.list) {
    grid.appendChild(renderCard(event, today, nearMe));
  }
  section.appendChild(grid);

  if (bucket.isCurrent && !bucket.opened && bucket.hasPast) {
    const toggleRow = document.createElement("div");
    toggleRow.className = "px-(--spacing-gutter) pb-5";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className =
      "flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 cursor-pointer hover:border-brand-400";
    toggleBtn.textContent = showCurrentMonthPast ? "Ocultar eventos anteriores" : "Ver eventos anteriores deste mês";
    toggleBtn.addEventListener("click", handlers.onToggleCurrentMonthPast);
    toggleRow.appendChild(toggleBtn);
    section.appendChild(toggleRow);

    if (showCurrentMonthPast && bucket.past.length > 0) {
      const pastGrid = document.createElement("div");
      pastGrid.className = "grid grid-cols-1 gap-4 px-(--spacing-gutter) pb-5 opacity-70 sm:grid-cols-2 lg:grid-cols-3";
      for (const event of bucket.past) {
        pastGrid.appendChild(renderCard(event, today, nearMe));
      }
      section.appendChild(pastGrid);
    }
  }

  return section;
}
