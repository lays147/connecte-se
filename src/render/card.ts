import type { TechEvent } from "../types";

function isPastEvent(event: TechEvent): boolean {
  const eventDate = new Date(`${event.date}T23:59:59`);
  return eventDate.getTime() < Date.now();
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function renderCard(event: TechEvent): HTMLElement {
  const past = isPastEvent(event);

  const card = document.createElement("article");
  card.className = [
    "flex flex-col gap-3 rounded-2xl border border-brand-200 bg-white p-5 shadow-sm",
    "transition-opacity",
    past ? "opacity-50 hover:opacity-70" : "hover:shadow-md",
  ].join(" ");

  const topRow = document.createElement("div");
  topRow.className = "flex items-start justify-between gap-2";

  const title = document.createElement("h3");
  title.className = "text-lg font-semibold leading-snug text-brand-950";
  title.textContent = event.title;
  topRow.appendChild(title);

  const region = document.createElement("span");
  region.className =
    "shrink-0 rounded-full border border-brand-300 px-3 py-1 text-xs font-medium text-brand-700";
  region.textContent = event.region;
  topRow.appendChild(region);

  const pillsRow = document.createElement("div");
  pillsRow.className = "flex flex-wrap items-center justify-between gap-2";

  const tagsGroup = document.createElement("div");
  tagsGroup.className = "flex flex-wrap items-center gap-2";

  const typePill = document.createElement("span");
  typePill.className =
    "rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700";
  typePill.textContent = event.type;
  tagsGroup.appendChild(typePill);

  const whenPill = document.createElement("span");
  whenPill.className =
    "rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700";
  whenPill.textContent = formatDate(event.date);
  tagsGroup.appendChild(whenPill);

  pillsRow.appendChild(tagsGroup);

  const paidPill = document.createElement("span");
  paidPill.className = event.paid
    ? "shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
    : "shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800";
  paidPill.textContent = event.paid ? "Pago" : "Gratuito";
  pillsRow.appendChild(paidPill);

  const description = document.createElement("p");
  description.className = "flex-1 text-sm text-brand-700";
  description.textContent = event.description;

  const button = document.createElement("a");
  button.href = event.url;
  button.target = "_blank";
  button.rel = "noopener";
  button.className =
    "mt-1 rounded-xl bg-brand-700 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-600";
  button.textContent = past ? "Ver detalhes" : "Quero participar";

  card.append(topRow, pillsRow, description, button);
  return card;
}
