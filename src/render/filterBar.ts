import { filterOptions, NEAR_ME_RADIUS_KM, type FilterState } from "../state/filters";
import { clearStoredLocation, requestLocation, type LocationError } from "../state/geolocation";
import type { EnrichedEvent } from "../types";

function buildSelect(label: string, options: string[], value: string, onChange: (value: string) => void): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className =
    "flex min-w-0 flex-1 basis-full items-center gap-1.5 border-hairline px-3.5 py-2.5 border-b has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 has-[:focus-visible]:ring-inset sm:basis-36 sm:border-b-0 sm:border-l sm:first:border-l-0 sm:first:border-b-0";

  const labelText = document.createElement("span");
  labelText.className = "shrink-0 text-label-sm font-medium text-ink-soft";
  labelText.textContent = label;

  const select = document.createElement("select");
  select.className =
    "w-full min-w-0 appearance-none truncate border-0 bg-transparent p-0 font-body text-sm font-medium text-ink cursor-pointer focus-visible:outline-none";

  for (const option of options) {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    if (option === value) opt.selected = true;
    select.appendChild(opt);
  }

  select.addEventListener("change", () => onChange(select.value));
  wrapper.append(labelText, select);
  return wrapper;
}

function buildSearchInput(value: string, onChange: (value: string) => void): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className =
    "flex h-12 items-center gap-2.5 px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 has-[:focus-visible]:ring-inset";
  wrapper.innerHTML = `<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="var(--color-icon-muted)" stroke-width="1.6" aria-hidden="true" class="shrink-0"><circle cx="7" cy="7" r="4.6"></circle><path d="M10.5 10.5 14 14"></path></svg>`;

  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Buscar evento, comunidade ou cidade";
  input.value = value;
  input.className = "w-full border-0 bg-transparent p-0 text-body-sm text-ink outline-none placeholder:text-ink-soft";

  let debounce: ReturnType<typeof setTimeout> | undefined;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    const query = input.value;
    debounce = setTimeout(() => onChange(query), 350);
  });

  wrapper.appendChild(input);
  return wrapper;
}

const LOCATION_ERROR_MESSAGE: Record<LocationError, string> = {
  unsupported: "Seu navegador não suporta geolocalização.",
  denied: "Permissão de localização negada. Habilite nas configurações do navegador para usar este filtro.",
  unavailable: "Não foi possível obter sua localização agora. Tente novamente.",
};

function buildNearMeToggle(state: FilterState, onChange: (state: FilterState) => void): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className =
    "flex min-w-0 shrink-0 items-center gap-1.5 border-hairline px-3.5 py-2.5 border-t sm:border-t-0 sm:border-l";

  const button = document.createElement("button");
  button.type = "button";
  const active = Boolean(state.nearMe);
  button.className = active
    ? "flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
    : "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brand-400";
  button.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 14.5s5-4.2 5-8.2a5 5 0 1 0-10 0c0 4 5 8.2 5 8.2Z"/><circle cx="8" cy="6.3" r="1.8"/></svg>`;
  const label = document.createElement("span");
  label.textContent = active ? `Perto de mim (${NEAR_ME_RADIUS_KM} km)` : "Perto de mim";
  button.appendChild(label);

  button.addEventListener("click", async () => {
    if (active) {
      clearStoredLocation();
      onChange({ ...state, nearMe: null });
      return;
    }
    button.disabled = true;
    label.textContent = "Localizando…";
    try {
      const coords = await requestLocation();
      onChange({ ...state, nearMe: coords });
    } catch (err) {
      button.disabled = false;
      label.textContent = "Perto de mim";
      alert(LOCATION_ERROR_MESSAGE[err as LocationError] ?? LOCATION_ERROR_MESSAGE.unavailable);
    }
  });

  wrapper.appendChild(button);
  return wrapper;
}

function lastUpdatedLabel(): string | null {
  if (!__EVENTS_UPDATED_AT__) return null;
  const updatedAt = new Date(__EVENTS_UPDATED_AT__);
  if (Number.isNaN(updatedAt.getTime())) return null;

  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(today) - startOfDay(updatedAt)) / 86_400_000);

  if (daysAgo <= 0) return "atualizado hoje";
  if (daysAgo === 1) return "atualizado ontem";
  return `atualizado em ${updatedAt.toLocaleDateString("pt-BR")}`;
}

export function renderFilterBar(
  allEvents: EnrichedEvent[],
  upcomingCount: number,
  state: FilterState,
  onChange: (state: FilterState) => void,
): HTMLElement {
  const options = filterOptions(allEvents);

  const row = document.createElement("div");
  row.className = "flex flex-col items-center gap-6 border-b border-hairline px-(--spacing-gutter) py-8 text-center";

  const h1 = document.createElement("h1");
  h1.className = "max-w-2xl font-display text-heading-2xl font-bold leading-tight tracking-tight text-ink";
  h1.textContent = "As conexões que você faz em eventos podem mudar sua carreira";

  const subtitle = document.createElement("span");
  subtitle.className = "text-body-sm text-ink-soft";
  const countLabel = `${upcomingCount} ${upcomingCount === 1 ? "evento a caminho" : "eventos a caminho"} · lista coletada automaticamente, pode conter imprecisões`;
  const updated = lastUpdatedLabel();
  subtitle.textContent = updated ? `${countLabel} · ${updated}` : countLabel;

  const searchConsole = document.createElement("div");
  searchConsole.className =
    "flex w-full flex-col divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline-strong bg-surface shadow-sm sm:max-w-3xl";

  const searchInput = buildSearchInput(state.query, (query) => onChange({ ...state, query }));

  const addonsRow = document.createElement("div");
  addonsRow.className = "flex flex-col sm:flex-row sm:divide-x sm:divide-hairline";

  addonsRow.appendChild(
    buildSelect("Região", options.region, state.region, (value) => onChange({ ...state, region: value })),
  );
  addonsRow.appendChild(
    buildSelect("Cidade", options.city, state.city, (value) => onChange({ ...state, city: value })),
  );
  addonsRow.appendChild(
    buildSelect("Tipo", options.type, state.type, (value) => onChange({ ...state, type: value })),
  );
  addonsRow.appendChild(
    buildSelect("Pago?", options.paid, state.paid, (value) => onChange({ ...state, paid: value })),
  );

  addonsRow.appendChild(buildNearMeToggle(state, onChange));

  searchConsole.append(searchInput, addonsRow);

  row.append(h1, subtitle, searchConsole);
  return row;
}
