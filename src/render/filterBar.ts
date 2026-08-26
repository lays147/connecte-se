import { filterOptions, type FilterState } from "../state/filters";
import type { EnrichedEvent } from "../types";

function buildSelect(label: string, options: string[], value: string, onChange: (value: string) => void): HTMLElement {
  const wrapper = document.createElement("label");
  wrapper.className = "flex flex-col gap-1.5 text-[11px] font-medium text-brand-500";
  wrapper.textContent = label;

  const select = document.createElement("select");
  select.className =
    "appearance-none rounded-lg border border-brand-200 bg-white px-3 py-2.5 font-body text-sm font-medium text-brand-950 cursor-pointer";

  for (const option of options) {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    if (option === value) opt.selected = true;
    select.appendChild(opt);
  }

  select.addEventListener("change", () => onChange(select.value));
  wrapper.appendChild(select);
  return wrapper;
}

export function renderFilterBar(
  allEvents: EnrichedEvent[],
  upcomingCount: number,
  state: FilterState,
  onChange: (state: FilterState) => void,
): HTMLElement {
  const options = filterOptions(allEvents);

  const row = document.createElement("div");
  row.className = "flex flex-col gap-6 border-b border-brand-100 px-6 py-6 md:flex-row md:items-end md:justify-between";

  const textCol = document.createElement("div");
  textCol.className = "flex max-w-[520px] flex-col gap-2";

  const h1 = document.createElement("h1");
  h1.className = "font-display text-[28px] font-bold leading-tight tracking-tight text-brand-950";
  h1.textContent = "Nosso foco é fazer pontes: Você e um evento, que pode mudar sua carreira";

  const subtitle = document.createElement("span");
  subtitle.className = "text-[13px] text-brand-500";
  subtitle.textContent = `${upcomingCount} ${upcomingCount === 1 ? "evento a caminho" : "eventos a caminho"} · lista coletada automaticamente, pode conter imprecisões`;

  textCol.append(h1, subtitle);

  const selectsRow = document.createElement("div");
  selectsRow.className = "flex flex-wrap items-end gap-2.5";

  selectsRow.appendChild(
    buildSelect("Região", options.region, state.region, (value) => onChange({ ...state, region: value })),
  );
  selectsRow.appendChild(
    buildSelect("Tipo", options.type, state.type, (value) => onChange({ ...state, type: value })),
  );
  selectsRow.appendChild(
    buildSelect("Pago?", options.paid, state.paid, (value) => onChange({ ...state, paid: value })),
  );

  row.append(textCol, selectsRow);
  return row;
}
