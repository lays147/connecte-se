import type { EnrichedEvent } from "../types";
import { toCardViewModel } from "./card";

let overlay: HTMLElement | null = null;
let dialog: HTMLElement | null = null;
let lastFocused: HTMLElement | null = null;

function close(): void {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  dialog = null;
  document.body.classList.remove("overflow-hidden");
  lastFocused?.focus();
  lastFocused = null;
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") close();
}

export function mountEventModal(): void {
  document.addEventListener("keydown", onKeydown);
}

export function openEventModal(event: EnrichedEvent, today: Date): void {
  close();
  lastFocused = document.activeElement as HTMLElement | null;

  const vm = toCardViewModel(event, today);

  overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-brand-950/60 p-4";
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.className = "relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl";

  const strip = document.createElement("div");
  strip.className = `h-1 shrink-0 ${vm.style.dot}`;
  dialog.appendChild(strip);

  const scroll = document.createElement("div");
  scroll.className = "flex flex-1 flex-col gap-3 overflow-y-auto p-6";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Fechar");
  closeBtn.className =
    "absolute right-4 top-4 flex size-8 cursor-pointer items-center justify-center rounded-full text-brand-500 hover:bg-brand-100 hover:text-brand-900";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", close);
  dialog.appendChild(closeBtn);

  const topRow = document.createElement("div");
  topRow.className = "flex items-center gap-2 pr-8";

  const typeLabel = document.createElement("span");
  typeLabel.className = `font-mono-label text-label-xs font-semibold uppercase tracking-widest ${vm.style.text}`;
  typeLabel.textContent = vm.type;
  topRow.appendChild(typeLabel);

  const pricePill = document.createElement("span");
  pricePill.className = `rounded-full px-2 py-1 text-xs font-medium ${vm.price.bg} ${vm.price.text}`;
  pricePill.textContent = vm.price.label;
  topRow.appendChild(pricePill);

  const title = document.createElement("h3");
  title.className = "font-display text-heading-lg font-semibold leading-snug text-brand-950";
  title.textContent = vm.title;

  const communityRow = document.createElement("div");
  communityRow.className = "flex items-center gap-2";

  const avatar = document.createElement("span");
  avatar.className = `inline-flex size-5.5 shrink-0 items-center justify-center rounded-card-7 font-display text-label-xs font-semibold ${vm.style.bg} ${vm.style.text}`;
  avatar.textContent = vm.initials;
  communityRow.appendChild(avatar);

  const communityName = document.createElement("span");
  communityName.className = "text-xs font-medium text-brand-800";
  communityName.textContent = vm.community;
  communityRow.appendChild(communityName);

  const description = document.createElement("p");
  description.className = "whitespace-pre-line text-sm leading-relaxed text-brand-700";
  description.textContent = vm.description;

  const metaRow = document.createElement("div");
  metaRow.className = "flex flex-col gap-1 border-t border-brand-100 pt-3";

  const whenSpan = document.createElement("span");
  whenSpan.className = "font-mono-label text-xs font-semibold text-brand-900";
  whenSpan.textContent = vm.when;

  const placeSpan = document.createElement("span");
  placeSpan.className = "text-label-sm text-brand-500";
  placeSpan.textContent = vm.place;

  metaRow.append(whenSpan, placeSpan);

  scroll.append(topRow, title, communityRow, description, metaRow);
  dialog.appendChild(scroll);

  const footer = document.createElement("div");
  footer.className = "shrink-0 border-t border-brand-100 p-4";

  const cta = document.createElement("a");
  cta.href = vm.url;
  cta.target = "_blank";
  cta.rel = "noopener";
  cta.className =
    "block w-full rounded-lg bg-brand-700 px-3.5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-600";
  cta.textContent = "Inscrever-se";
  footer.appendChild(cta);
  dialog.appendChild(footer);

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.classList.add("overflow-hidden");
  closeBtn.focus();
}
