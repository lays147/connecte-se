import type { TechEvent } from "./types";

export interface FilterState {
  region: string;
  type: string;
  modality: string;
  paid: string;
}

const ALL = "Todos";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function buildSelect(
  label: string,
  options: string[],
  onChange: (value: string) => void,
): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className = "flex flex-col gap-1 text-sm text-brand-700";

  const span = document.createElement("span");
  span.className = "font-medium";
  span.textContent = label;
  wrapper.appendChild(span);

  const select = document.createElement("select");
  select.className =
    "rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-500 focus:outline-none";

  for (const option of [ALL, ...options]) {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  }

  select.addEventListener("change", () => onChange(select.value));
  wrapper.appendChild(select);
  return wrapper;
}

export function renderFilters(
  allEvents: TechEvent[],
  onChange: (state: FilterState) => void,
): HTMLElement {
  const state: FilterState = { region: ALL, type: ALL, modality: ALL, paid: ALL };

  const bar = document.createElement("div");
  bar.className =
    "flex flex-wrap gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm";

  const regions = uniqueSorted(allEvents.map((e) => e.region));
  const types = uniqueSorted(allEvents.map((e) => e.type));
  const modalities = uniqueSorted(allEvents.map((e) => e.modality));

  bar.appendChild(
    buildSelect("Região", regions, (value) => {
      state.region = value;
      onChange(state);
    }),
  );

  bar.appendChild(
    buildSelect("Tipo", types, (value) => {
      state.type = value;
      onChange(state);
    }),
  );

  bar.appendChild(
    buildSelect("Modalidade", modalities, (value) => {
      state.modality = value;
      onChange(state);
    }),
  );

  bar.appendChild(
    buildSelect("Pago?", ["Pago", "Gratuito"], (value) => {
      state.paid = value;
      onChange(state);
    }),
  );

  return bar;
}

export function matchesFilters(event: TechEvent, state: FilterState): boolean {
  if (state.region !== ALL && event.region !== state.region) return false;
  if (state.type !== ALL && event.type !== state.type) return false;
  if (state.modality !== ALL && event.modality !== state.modality) return false;
  if (state.paid === "Pago" && !event.paid) return false;
  if (state.paid === "Gratuito" && event.paid) return false;
  return true;
}

export function applyFilters(container: HTMLElement, state: FilterState): void {
  const cards = container.querySelectorAll<HTMLElement>("[data-region]");
  for (const card of cards) {
    const region = card.dataset.region ?? "";
    const type = card.dataset.type ?? "";
    const modality = card.dataset.modality ?? "";
    const paid = card.dataset.paid === "true";
    const visible = matchesFilters({ region, type, modality, paid } as TechEvent, state);
    card.classList.toggle("hidden", !visible);
  }
}
