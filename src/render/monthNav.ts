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
  const nav = document.createElement("nav");
  nav.className =
    "w-full shrink-0 self-stretch border-t border-brand-100 bg-brand-50/40 p-4 lg:w-54 lg:border-t-0 lg:border-l";
  nav.setAttribute("aria-label", "Navegação por mês e ano");

  const sticky = document.createElement("div");
  sticky.className = "flex flex-col gap-2.5 lg:sticky lg:top-4";

  const heading = document.createElement("span");
  heading.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-500";
  heading.textContent = "Meses";
  sticky.appendChild(heading);

  let hasPastLocked = false;

  for (const group of yearGroups) {
    const yearBlock = document.createElement("div");
    yearBlock.className = "flex flex-col gap-0.5";

    const yearBtn = document.createElement("button");
    yearBtn.type = "button";
    yearBtn.className =
      "flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left cursor-pointer hover:bg-brand-100/60";

    const chevron = document.createElement("span");
    chevron.className = "font-mono-label text-label-xs text-brand-400";
    chevron.textContent = group.open ? "▾" : "▸";
    yearBtn.appendChild(chevron);

    const yearLabel = document.createElement("span");
    yearLabel.className = `flex-1 font-display text-sm font-bold ${group.isCurrentYear ? "text-brand-950" : "text-brand-700"}`;
    yearLabel.textContent = String(group.year);
    yearBtn.appendChild(yearLabel);

    const total = group.months.reduce((n, m) => n + m.count, 0);
    const yearCount = document.createElement("span");
    yearCount.className = "font-mono-label text-label-xs text-brand-400";
    yearCount.textContent = total + (total === 1 ? " evento" : " eventos");
    yearBtn.appendChild(yearCount);

    yearBtn.addEventListener("click", () => handlers.onToggleYear(group.year));
    yearBlock.appendChild(yearBtn);

    if (group.hasLocked) {
      hasPastLocked = true;
      const loadYearBtn = document.createElement("button");
      loadYearBtn.type = "button";
      loadYearBtn.className =
        "ml-5.5 mb-1 mt-0.5 self-start rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 cursor-pointer hover:border-brand-400";
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
            "flex items-baseline gap-2 rounded-lg py-2 pl-5.5 pr-2.5 no-underline transition-colors duration-200 hover:bg-brand-100/60",
            m.isCurrent ? "bg-brand-100/70" : "",
          ].join(" ");

          const label = document.createElement("span");
          label.dataset.role = "label";
          label.className = `flex-1 text-sm capitalize transition-colors duration-200 ${m.isCurrent ? "font-semibold text-brand-950" : "font-medium text-brand-700"}`;
          label.textContent = m.label;
          link.appendChild(label);

          const count = document.createElement("span");
          count.dataset.role = "count";
          count.className = `font-mono-label min-w-4 text-right text-label-sm font-semibold transition-colors duration-200 ${m.isCurrent ? "text-brand-950" : "text-brand-700"}`;
          count.textContent = String(m.count);
          link.appendChild(count);

          link.addEventListener("click", (e) => {
            const target = document.getElementById(id);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              history.replaceState(null, "", `#${id}`);
            }
          });

          yearBlock.appendChild(link);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.title = "Carregar eventos deste mês";
          btn.className =
            "flex w-full items-baseline gap-2 rounded-lg py-2 pl-5.5 pr-2.5 text-left cursor-pointer hover:bg-brand-100/60";

          const label = document.createElement("span");
          label.className = "flex-1 text-sm font-medium capitalize text-brand-400";
          label.textContent = m.label;
          btn.appendChild(label);

          const count = document.createElement("span");
          count.className = "font-mono-label min-w-4 text-right text-label-sm font-semibold text-brand-700";
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
    footer.className = "flex flex-col gap-2 border-t border-brand-100 pt-2.5";

    const hint = document.createElement("span");
    hint.className = "text-label-sm leading-relaxed text-brand-500";
    hint.textContent = "Meses anteriores carregam quando você clica.";
    footer.appendChild(hint);

    const loadAllBtn = document.createElement("button");
    loadAllBtn.type = "button";
    loadAllBtn.className =
      "rounded-lg border border-brand-200 bg-white px-2.5 py-2 text-xs font-semibold text-brand-700 cursor-pointer hover:border-brand-400";
    loadAllBtn.textContent = "Carregar todos";
    loadAllBtn.addEventListener("click", handlers.onLoadAllPast);
    footer.appendChild(loadAllBtn);

    sticky.appendChild(footer);
  }

  nav.appendChild(sticky);
  return nav;
}
