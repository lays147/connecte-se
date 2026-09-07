import type { YearNavGroup } from "../state/monthBuckets";
import { monthSectionId } from "./monthGroup";

export interface MonthNavHandlers {
  onToggleYear: (year: number) => void;
  onLoadMonth: (key: string) => void;
  onLoadYear: (year: number) => void;
  onLoadAllPast: () => void;
}

function keyToId(key: string): string {
  const [year, monthIndex] = key.split("-").map(Number);
  return monthSectionId(year, monthIndex);
}

export function renderMonthNavRail(yearGroups: YearNavGroup[], handlers: MonthNavHandlers): HTMLElement {
  const currentMonth = yearGroups.flatMap((g) => g.months).find((m) => m.isCurrent);

  const details = document.createElement("details");
  details.className =
    "w-full shrink-0 self-stretch border-t border-hairline bg-surface-sunken/40 lg:w-54 lg:border-t-0 lg:border-l lg:[&_nav]:!block";

  const isDesktop = window.matchMedia("(min-width: 64rem)");
  details.open = isDesktop.matches;
  const syncOpenToViewport = (): void => {
    if (!details.isConnected) {
      isDesktop.removeEventListener("change", syncOpenToViewport);
      return;
    }
    details.open = isDesktop.matches;
  };
  isDesktop.addEventListener("change", syncOpenToViewport);

  const summary = document.createElement("summary");
  summary.className =
    "flex cursor-pointer list-none items-baseline gap-2.5 px-4 py-3.5 marker:hidden lg:hidden [&::-webkit-details-marker]:hidden";

  const summaryLabel = document.createElement("span");
  summaryLabel.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-ink-soft";
  summaryLabel.textContent = "Meses";
  summary.appendChild(summaryLabel);

  if (currentMonth) {
    const summaryCurrent = document.createElement("span");
    summaryCurrent.className = "flex-1 text-sm font-semibold capitalize text-ink";
    summaryCurrent.textContent = `${currentMonth.label} · ${currentMonth.count}`;
    summary.appendChild(summaryCurrent);
  }

  const chevron = document.createElement("span");
  chevron.setAttribute("aria-hidden", "true");
  chevron.className = "text-brand-400 transition-transform [details[open]_&]:-rotate-180";
  chevron.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  summary.appendChild(chevron);

  details.appendChild(summary);

  const nav = document.createElement("nav");
  nav.className = "p-4";
  nav.setAttribute("aria-label", "Navegação por mês e ano");

  const sticky = document.createElement("div");
  sticky.className = "flex flex-col gap-2.5 lg:sticky lg:top-4";

  const heading = document.createElement("span");
  heading.className = "hidden font-mono-label text-label-xs font-semibold uppercase tracking-widest text-ink-soft lg:block";
  heading.textContent = "Meses";
  sticky.appendChild(heading);

  let hasPastLocked = false;

  for (const group of yearGroups) {
    const yearBlock = document.createElement("div");
    yearBlock.className = "flex flex-col gap-0.5";

    const yearBtn = document.createElement("button");
    yearBtn.type = "button";
    yearBtn.className =
      "flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left cursor-pointer hover:bg-tint-hover";

    const chevron = document.createElement("span");
    chevron.className = "font-mono-label text-label-xs text-ink-soft";
    chevron.textContent = group.open ? "▾" : "▸";
    yearBtn.appendChild(chevron);

    const yearLabel = document.createElement("span");
    yearLabel.className = `flex-1 font-display text-sm font-bold ${group.isCurrentYear ? "text-ink" : "text-ink-soft"}`;
    yearLabel.textContent = String(group.year);
    yearBtn.appendChild(yearLabel);

    const total = group.months.reduce((n, m) => n + m.count, 0);
    const yearCount = document.createElement("span");
    yearCount.className = "font-mono-label text-label-xs text-ink-soft";
    yearCount.textContent = total + (total === 1 ? " evento" : " eventos");
    yearBtn.appendChild(yearCount);

    yearBtn.addEventListener("click", () => handlers.onToggleYear(group.year));
    yearBlock.appendChild(yearBtn);

    if (group.hasLocked) {
      hasPastLocked = true;
      const loadYearBtn = document.createElement("button");
      loadYearBtn.type = "button";
      loadYearBtn.className =
        "ml-5.5 mb-1 mt-0.5 self-start rounded-lg border border-hairline-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft cursor-pointer hover:border-brand-400";
      loadYearBtn.textContent = `Carregar ${group.year}`;
      loadYearBtn.addEventListener("click", () => handlers.onLoadYear(group.year));
      yearBlock.appendChild(loadYearBtn);
    }

    if (group.open) {
      for (const m of group.months) {
        if (m.loaded) {
          const id = keyToId(m.key);
          const link = document.createElement("a");
          link.href = `#${id}`;
          link.dataset.monthId = id;
          link.className = [
            "flex items-baseline gap-2 rounded-lg py-2 pl-5.5 pr-2.5 no-underline transition-colors duration-200 hover:bg-tint-hover",
            m.isCurrent ? "bg-tint-hover" : "",
          ].join(" ");

          const label = document.createElement("span");
          label.dataset.role = "label";
          label.className = `flex-1 text-sm capitalize transition-colors duration-200 ${m.isCurrent ? "font-semibold text-ink" : "font-medium text-ink-soft"}`;
          label.textContent = m.label;
          link.appendChild(label);

          const count = document.createElement("span");
          count.dataset.role = "count";
          count.className = `font-mono-label min-w-4 text-right text-label-sm font-semibold transition-colors duration-200 ${m.isCurrent ? "text-ink" : "text-ink-soft"}`;
          count.textContent = String(m.count);
          link.appendChild(count);

          link.addEventListener("click", (e) => {
            const target = document.getElementById(id);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              history.replaceState(null, "", `#${id}`);
            }
            if (window.matchMedia("(max-width: 63.9975rem)").matches) {
              details.open = false;
            }
          });

          yearBlock.appendChild(link);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.title = "Carregar eventos deste mês";
          btn.className =
            "flex w-full items-baseline gap-2 rounded-lg py-2 pl-5.5 pr-2.5 text-left cursor-pointer hover:bg-tint-hover";

          const label = document.createElement("span");
          label.className = "flex-1 text-sm font-medium capitalize text-ink-soft";
          label.textContent = m.label;
          btn.appendChild(label);

          const count = document.createElement("span");
          count.className = "font-mono-label min-w-4 text-right text-label-sm font-semibold text-ink-soft";
          count.textContent = `+${m.count}`;
          btn.appendChild(count);

          btn.addEventListener("click", () => handlers.onLoadMonth(m.key));
          yearBlock.appendChild(btn);
        }
      }
    }

    sticky.appendChild(yearBlock);
  }

  if (hasPastLocked) {
    const footer = document.createElement("div");
    footer.className = "flex flex-col gap-2 border-t border-hairline pt-2.5";

    const hint = document.createElement("span");
    hint.className = "text-label-sm leading-relaxed text-ink-soft";
    hint.textContent = "Meses anteriores carregam quando você clica.";
    footer.appendChild(hint);

    const loadAllBtn = document.createElement("button");
    loadAllBtn.type = "button";
    loadAllBtn.className =
      "rounded-lg border border-hairline-strong bg-surface px-2.5 py-2 text-xs font-semibold text-ink-soft cursor-pointer hover:border-brand-400";
    loadAllBtn.textContent = "Carregar todos";
    loadAllBtn.addEventListener("click", handlers.onLoadAllPast);
    footer.appendChild(loadAllBtn);

    sticky.appendChild(footer);
  }

  nav.appendChild(sticky);
  details.appendChild(nav);
  return details;
}
