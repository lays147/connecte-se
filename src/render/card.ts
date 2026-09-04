import type { EnrichedEvent } from "../types";
import { trackAnalyticsEvent } from "../state/consent";
import { distanceKm } from "../state/filters";
import type { Coords } from "../state/geolocation";
import { openEventModal } from "./eventModal";
import { priceStyle, typeStyle } from "./theme";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WD_SUN = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Uses a Unicode-aware iterator (not raw string indexing) so multi-byte
// characters like emoji never get split mid-codepoint, and skips leading
// punctuation (e.g. ".NET São Paulo") so the avatar always shows a letter.
export function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((w) => [...w].find((ch) => /\p{L}|\p{N}/u.test(ch)))
    .filter((ch): ch is string => Boolean(ch));
  return letters.slice(0, 2).join("").toUpperCase();
}

export interface CardViewModel {
  title: string;
  url: string;
  type: string;
  description: string;
  community: string;
  initials: string;
  place: string;
  when: string;
  price: ReturnType<typeof priceStyle>;
  style: ReturnType<typeof typeStyle>;
  distanceLabel: string | null;
}

export function toCardViewModel(e: EnrichedEvent, today: Date, nearMe: Coords | null = null): CardViewModel {
  const d = parseIso(e.date);
  const when =
    WD_SUN[d.getDay()] +
    ", " +
    d.getDate() +
    " " +
    MONTHS_SHORT[d.getMonth()] +
    (d.getFullYear() !== today.getFullYear() ? " " + d.getFullYear() : "") +
    " · " +
    e.time;

  const community = e.community || "Organizador não informado";
  const km = nearMe ? distanceKm(e, nearMe) : null;

  return {
    title: e.title,
    url: e.url,
    type: e.type,
    description: e.description,
    community,
    initials: initialsOf(community),
    place: e.city ? e.city + ", " + e.region : e.region,
    when,
    price: priceStyle(e.paid),
    style: typeStyle(e.type),
    distanceLabel: km === null ? null : km < 1 ? "menos de 1 km" : `${Math.round(km)} km`,
  };
}

export function renderCard(event: EnrichedEvent, today: Date, nearMe: Coords | null = null): HTMLElement {
  const vm = toCardViewModel(event, today, nearMe);

  const card = document.createElement("article");
  card.className =
    "flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white transition-colors hover:border-brand-400";
  card.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) return;
    openEventModal(event, today);
  });

  const strip = document.createElement("div");
  strip.className = `h-0.75 ${vm.style.dot}`;
  card.appendChild(strip);

  const body = document.createElement("div");
  body.className = "flex flex-1 flex-col gap-2.5 p-4";

  const topRow = document.createElement("div");
  topRow.className = "flex items-center justify-between gap-2";

  const typeLabel = document.createElement("span");
  typeLabel.className = `font-mono-label text-label-xs font-semibold uppercase tracking-widest ${vm.style.text}`;
  typeLabel.textContent = vm.type;
  topRow.appendChild(typeLabel);

  const pillGroup = document.createElement("div");
  pillGroup.className = "flex items-center gap-1.5";

  if (vm.distanceLabel) {
    const distancePill = document.createElement("span");
    distancePill.className = "rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700";
    distancePill.textContent = vm.distanceLabel;
    pillGroup.appendChild(distancePill);
  }

  const pricePill = document.createElement("span");
  pricePill.className = `rounded-full px-2 py-1 text-xs font-medium ${vm.price.bg} ${vm.price.text}`;
  pricePill.textContent = vm.price.label;
  pillGroup.appendChild(pricePill);

  topRow.appendChild(pillGroup);

  const title = document.createElement("h3");
  title.className = "line-clamp-2 font-display text-heading-sm font-semibold leading-snug text-brand-950";
  title.textContent = vm.title;

  const communityRow = document.createElement("div");
  communityRow.className = "flex items-center gap-2";

  const avatar = document.createElement("span");
  avatar.className = `inline-flex size-5.5 shrink-0 items-center justify-center rounded-card-7 font-display text-label-xs font-semibold ${vm.style.bg} ${vm.style.text}`;
  avatar.textContent = vm.initials;
  communityRow.appendChild(avatar);

  const communityName = document.createElement("span");
  communityName.className = "min-w-0 flex-1 truncate text-xs font-medium text-brand-800";
  communityName.textContent = vm.community;
  communityRow.appendChild(communityName);

  const description = document.createElement("p");
  description.className = "line-clamp-2 text-xs leading-relaxed text-brand-700";
  description.textContent = vm.description;

  const spacer = document.createElement("span");
  spacer.className = "flex-1";

  const footerRow = document.createElement("div");
  footerRow.className = "flex flex-wrap items-center justify-between gap-2.5 border-t border-brand-100 pt-3";

  const whenPlace = document.createElement("div");
  whenPlace.className = "flex min-w-0 flex-1 flex-col gap-0.5";

  const whenSpan = document.createElement("span");
  whenSpan.className = "font-mono-label whitespace-nowrap text-xs font-semibold text-brand-900";
  whenSpan.textContent = vm.when;
  whenPlace.appendChild(whenSpan);

  const placeSpan = document.createElement("span");
  placeSpan.className = "truncate text-label-sm text-brand-500";
  placeSpan.textContent = vm.place;
  whenPlace.appendChild(placeSpan);

  footerRow.appendChild(whenPlace);

  const cta = document.createElement("a");
  cta.href = vm.url;
  cta.target = "_blank";
  cta.rel = "noopener";
  cta.addEventListener("click", () => {
    trackAnalyticsEvent("event_subscribe_click", {
      event_id: event.id,
      event_title: event.title,
      event_type: event.type,
    });
  });
  cta.className =
    "shrink-0 whitespace-nowrap rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600";
  cta.textContent = "Inscrever-se";
  footerRow.appendChild(cta);

  body.append(topRow, title, communityRow, description, spacer, footerRow);
  card.appendChild(body);

  card.dataset.region = event.region;
  card.dataset.type = event.type;
  card.dataset.paid = String(event.paid);
  card.dataset.community = event.community ?? "";

  return card;
}
