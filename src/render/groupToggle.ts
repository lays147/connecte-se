export type GroupBy = "data" | "comunidade";

export function renderGroupToggle(groupBy: GroupBy, onChange: (value: GroupBy) => void): HTMLElement {
  const row = document.createElement("div");
  row.className = "flex items-center justify-between gap-4 border-b border-brand-100 bg-brand-50/40 px-6 py-3";

  const label = document.createElement("span");
  label.className = "text-xs font-medium text-brand-500";
  label.textContent = "Agrupar por";

  const group = document.createElement("div");
  group.className = "flex gap-0.5 rounded-card-10 border border-brand-100 bg-brand-100/60 p-0.5";

  function makeButton(text: string, value: GroupBy): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    const active = groupBy === value;
    btn.className = [
      "rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer",
      active ? "bg-white text-brand-950 shadow-sm" : "bg-transparent text-brand-500",
    ].join(" ");
    btn.textContent = text;
    btn.addEventListener("click", () => onChange(value));
    return btn;
  }

  group.append(makeButton("Data", "data"), makeButton("Por comunidade", "comunidade"));
  row.append(label, group);
  return row;
}
