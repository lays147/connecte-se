import type { EnrichedEvent } from "../types";
import { toCardViewModel } from "./card";
import { openEventModal } from "./eventModal";
import { modalityBadge } from "./theme";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WD_SUN = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function buildFeaturedList(upcoming: EnrichedEvent[]): EnrichedEvent[] {
  return upcoming.filter((e) => e.modality === "Online").slice(0, 3);
}

export interface FeaturedHandlers {
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export function renderFeaturedCarousel(list: EnrichedEvent[], index: number, handlers: FeaturedHandlers): HTMLElement | null {
  if (list.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const idx = ((index % list.length) + list.length) % list.length;
  const event = list[idx];
  const vm = toCardViewModel(event, today);
  const badge = modalityBadge(event.modality);
  const d = parseIso(event.date);

  const wrap = document.createElement("div");
  wrap.className =
    "relative flex flex-col items-stretch gap-4 bg-brand-950 px-(--spacing-gutter) py-5 sm:gap-7 sm:py-6.5 md:min-h-42 md:flex-row";

  const dateBlock = document.createElement("div");
  dateBlock.className =
    "flex w-full shrink-0 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-900 px-4 py-2.5 md:w-26 md:flex-col md:gap-0.5 md:px-0 md:py-0";

  const wd = document.createElement("span");
  wd.className = "font-mono-label text-label-xs uppercase tracking-widest text-brand-300";
  wd.textContent = WD_SUN[d.getDay()];
  const day = document.createElement("span");
  day.className = "font-display text-heading-3xl font-bold leading-[1.05] text-white";
  day.textContent = String(d.getDate());
  const mon = document.createElement("span");
  mon.className = "font-mono-label text-label-sm uppercase text-brand-200";
  mon.textContent = MONTHS_SHORT[d.getMonth()];
  dateBlock.append(wd, day, mon);

  const info = document.createElement("div");
  info.className = "flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-2 pr-0 md:pr-10";
  info.addEventListener("click", () => openEventModal(event, today));

  const badgeRow = document.createElement("div");
  badgeRow.className = "flex items-center gap-2.5";

  const badgePill = document.createElement("span");
  badgePill.className = `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-950 ${badge.bg}`;
  badgePill.textContent = badge.label;
  badgeRow.appendChild(badgePill);

  const destaque = document.createElement("span");
  destaque.className = "font-mono-label text-label-xs uppercase tracking-widest text-brand-200";
  destaque.textContent = "Em destaque";
  badgeRow.appendChild(destaque);

  const title = document.createElement("h3");
  title.className = "line-clamp-2 font-display text-heading-xl font-bold leading-tight tracking-tight text-white";
  title.textContent = vm.title;

  const desc = document.createElement("span");
  desc.className = "line-clamp-2 max-w-full text-body-sm leading-relaxed text-brand-100 md:max-w-155";
  desc.textContent = vm.description;

  const metaRow = document.createElement("div");
  metaRow.className = "flex items-center gap-2.5 text-xs text-brand-200";
  const community = document.createElement("span");
  community.textContent = vm.community;
  const dot1 = document.createElement("span");
  dot1.className = "text-brand-700";
  dot1.textContent = "·";
  const time = document.createElement("span");
  time.textContent = event.time;
  const dot2 = document.createElement("span");
  dot2.className = "text-brand-700";
  dot2.textContent = "·";
  const price = document.createElement("span");
  price.textContent = vm.price.label;
  metaRow.append(community, dot1, time, dot2, price);

  info.append(badgeRow, title, desc, metaRow);

  const actions = document.createElement("div");
  actions.className = "flex shrink-0 flex-row items-center justify-between gap-4 md:flex-col md:items-end";

  if (list.length > 1) {
    const navRow = document.createElement("div");
    navRow.className = "flex gap-1.5";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Destaque anterior");
    prevBtn.className =
      "h-8 w-8 cursor-pointer rounded-lg border border-brand-700 bg-transparent font-body text-sm text-white hover:bg-brand-900";
    prevBtn.textContent = "‹";
    prevBtn.addEventListener("click", handlers.onPrev);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Próximo destaque");
    nextBtn.className =
      "h-8 w-8 cursor-pointer rounded-lg border border-brand-700 bg-transparent font-body text-sm text-white hover:bg-brand-900";
    nextBtn.textContent = "›";
    nextBtn.addEventListener("click", handlers.onNext);

    navRow.append(prevBtn, nextBtn);
    actions.appendChild(navRow);
  }

  const cta = document.createElement("a");
  cta.href = vm.url;
  cta.target = "_blank";
  cta.rel = "noopener";
  cta.className = "whitespace-nowrap rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-brand-950";
  cta.textContent = "Inscrever-se";
  actions.appendChild(cta);

  if (list.length > 1) {
    const positionRow = document.createElement("div");
    positionRow.className = "flex items-center gap-2.5";

    const position = document.createElement("span");
    position.className = "font-mono-label text-label-sm text-brand-300";
    position.textContent = `${idx + 1} / ${list.length}`;
    positionRow.appendChild(position);

    const dots = document.createElement("div");
    dots.className = "flex items-center gap-1.5";
    list.forEach((_, i) => {
      const dotBtn = document.createElement("button");
      dotBtn.type = "button";
      dotBtn.setAttribute("aria-label", "Ir para destaque");
      const active = i === idx;
      dotBtn.className = [
        "h-1.75 cursor-pointer rounded-full border-0 p-0 transition-[width]",
        active ? "w-5.5 bg-white" : "w-1.75 bg-brand-600",
      ].join(" ");
      dotBtn.addEventListener("click", () => handlers.onSelect(i));
      dots.appendChild(dotBtn);
    });
    positionRow.appendChild(dots);

    actions.appendChild(positionRow);
  }

  wrap.append(dateBlock, info, actions);
  return wrap;
}
