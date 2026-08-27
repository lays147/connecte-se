import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { EnrichedEvent } from "../types";
import { isOnline, UF_NAME, ufOf } from "../data/cityUf";
import topology from "../data/br-uf-topo.json";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

// Small states are pushed off their centroid so the sigla stays legible.
const LABEL_OFFSET: Record<string, [number, number]> = {
  DF: [30, -16],
  RJ: [26, 16],
  ES: [30, 4],
  AL: [26, 8],
  SE: [30, 4],
  PE: [36, -4],
  PB: [30, -4],
  RN: [24, -14],
  CE: [8, -6],
  SC: [26, 10],
  AP: [-4, -10],
};

type MapEvent = EnrichedEvent & { uf: string | null; online: boolean };
type Scope = "all" | "next";

interface MapState {
  selected: string | null;
  scope: Scope;
}

function todayIso(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function inScope(e: MapEvent, scope: Scope): boolean {
  return scope === "all" || e.date >= todayIso();
}

export function renderMapPage(allEvents: EnrichedEvent[]): HTMLElement {
  const events: MapEvent[] = allEvents.map((e) => {
    const uf = isOnline(e) ? null : ufOf(e);
    return { ...e, uf, online: isOnline(e) };
  });

  const state: MapState = { selected: null, scope: "all" };

  const root = document.createElement("div");
  root.className = "flex flex-col";

  const heading = document.createElement("div");
  heading.className =
    "flex flex-col items-start gap-4 border-b border-brand-100 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6";

  const headingText = document.createElement("div");
  headingText.className = "flex max-w-xl flex-col gap-2";
  const h1 = document.createElement("h1");
  h1.className = "font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-heading-2xl";
  h1.textContent = "Onde a tecnologia se encontra no Brasil";
  const subline = document.createElement("span");
  subline.className = "text-body-sm leading-relaxed text-brand-500";
  headingText.append(h1, subline);

  const seg = document.createElement("div");
  seg.className = "flex shrink-0 gap-0.5 rounded-card-10 border border-brand-100 bg-brand-50 p-0.5";
  function segButton(text: string, value: Scope): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cursor-pointer rounded-lg border-0 px-3.5 py-2 text-xs font-semibold";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      state.scope = value;
      update();
    });
    return btn;
  }
  const segAll = segButton("Ano todo", "all");
  const segNext = segButton("A partir de hoje", "next");
  seg.append(segAll, segNext);

  heading.append(headingText, seg);

  const body = document.createElement("div");
  body.className = "flex flex-wrap items-stretch";

  const mapCol = document.createElement("div");
  mapCol.className = "min-w-95 flex-1 basis-155 px-2 pb-5 pt-4 sm:px-4";

  const mapHost = document.createElement("div");
  mapHost.className = "relative";

  const legendRow = document.createElement("div");
  legendRow.className = "-mt-1.5 flex flex-wrap items-center gap-3.5 px-2 sm:px-3";

  const legendLess = document.createElement("span");
  legendLess.className = "font-mono-label text-label-sm text-brand-400";
  legendLess.textContent = "menos";

  const legendSwatches = document.createElement("div");
  legendSwatches.className = "flex gap-0.75";

  const legendMore = document.createElement("span");
  legendMore.className = "font-mono-label text-label-sm text-brand-400";
  legendMore.textContent = "mais eventos";

  const legendScale = document.createElement("div");
  legendScale.className = "flex items-center gap-2";
  legendScale.append(legendLess, legendSwatches, legendMore);

  const legendEmpty = document.createElement("div");
  legendEmpty.className = "flex items-center gap-1.5";
  const emptySwatch = document.createElement("span");
  emptySwatch.className = "size-3.25 rounded-card-4 border border-brand-100 bg-map-empty";
  const emptyLabel = document.createElement("span");
  emptyLabel.className = "text-label-sm text-brand-400";
  emptyLabel.textContent = "nenhum evento na lista";
  legendEmpty.append(emptySwatch, emptyLabel);

  legendRow.append(legendScale, legendEmpty);
  mapCol.append(mapHost, legendRow);

  const sideCol = document.createElement("div");
  sideCol.className = "flex min-w-75 flex-1 basis-89 flex-col border-t border-brand-100 sm:border-l sm:border-t-0";

  const stats = document.createElement("div");
  stats.className = "grid grid-cols-2 gap-px border-b border-brand-100 bg-brand-100";

  const rankHeader = document.createElement("div");
  rankHeader.className = "flex items-baseline justify-between gap-2.5 px-4.5 pb-2 pt-3.5";
  const rankLabel = document.createElement("span");
  rankLabel.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-400";
  rankLabel.textContent = "Ranking por estado";
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "hidden cursor-pointer border-0 bg-transparent p-0 text-label-sm font-medium text-brand-500";
  clearBtn.textContent = "limpar seleção";
  clearBtn.addEventListener("click", () => {
    state.selected = null;
    update();
  });
  rankHeader.append(rankLabel, clearBtn);

  const rankList = document.createElement("div");
  rankList.className = "max-h-117.5 overflow-y-auto px-2.5 pb-3";

  const extra = document.createElement("div");
  extra.className = "flex flex-col gap-2 border-t border-brand-100 px-4.5 py-3.5";

  sideCol.append(stats, rankHeader, rankList, extra);
  body.append(mapCol, sideCol);

  const panel = document.createElement("div");
  panel.className = "rounded-b-card-17 border-t border-brand-100 bg-brand-50/40 px-4 py-5 sm:px-6 sm:py-6";

  root.append(heading, body, panel);

  const W = 660;
  const H = 620;
  const fc = topojson.feature(topology as never, (topology as never as { objects: { uf: never } }).objects.uf);
  const proj = d3.geoMercator().fitExtent(
    [
      [14, 14],
      [W - 14, H - 14],
    ],
    fc as never,
  );
  const path = d3.geoPath(proj);

  const svg = d3
    .select(mapHost)
    .append("svg")
    .attr("viewBox", "0 0 " + W + " " + H)
    .attr("width", "100%")
    .style("display", "block")
    .style("max-height", "620px");

  const tip = document.createElement("div");
  tip.className =
    "pointer-events-none fixed z-10 rounded-card-9 bg-brand-950 px-2.5 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity";
  document.body.appendChild(tip);

  function showTip(ev: MouseEvent, html: string): void {
    tip.innerHTML = html;
    tip.style.opacity = "1";
    tip.style.left = Math.min(ev.clientX + 14, window.innerWidth - 190) + "px";
    tip.style.top = ev.clientY - 10 + "px";
  }
  function hideTip(): void {
    tip.style.opacity = "0";
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const themeColor = (name: string): string => rootStyle.getPropertyValue(name).trim();
  const MAP_SCALE_START = themeColor("--color-map-scale-start");
  const MAP_SCALE_END = themeColor("--color-map-scale-end");
  const MAP_EMPTY = themeColor("--color-map-empty");
  const MAP_LABEL_LINE = themeColor("--color-map-label-line");
  const MAP_LABEL_DARK = themeColor("--color-map-label-dark");
  const MAP_LABEL_LIGHT = themeColor("--color-map-label-light");
  const MAP_STROKE = themeColor("--color-map-label-light");
  const MAP_SELECTED_STROKE = themeColor("--color-brand-950");

  let counts: Record<string, number> = {};
  let max = 1;
  let color = d3.scaleSequentialSqrt(d3.interpolateRgb(MAP_SCALE_START, MAP_SCALE_END)).domain([0, 1]);

  const ufPaths = svg
    .append("g")
    .selectAll<SVGPathElement, d3.ExtendedFeature>("path")
    .data((fc as unknown as { features: d3.ExtendedFeature[] }).features)
    .join("path")
    .attr("class", "cursor-pointer transition-opacity")
    .attr("d", path as never)
    .attr("stroke", MAP_STROKE)
    .attr("stroke-width", 0.9)
    .on("mousemove", (ev: MouseEvent, d) => {
      const sig = d.id as string;
      const n = counts[sig] || 0;
      showTip(
        ev,
        "<b style='font:600 12px/1.4 \"IBM Plex Sans\",sans-serif'>" +
          UF_NAME[sig] +
          "</b><br>" +
          (n ? n + (n === 1 ? " evento" : " eventos") : "nenhum evento na lista"),
      );
    })
    .on("mouseleave", hideTip)
    .on("click", (_ev: MouseEvent, d) => {
      const sig = d.id as string;
      state.selected = state.selected === sig ? null : sig;
      update();
    });

  svg
    .append("path")
    .attr(
      "d",
      path(
        topojson.mesh(topology as never, (topology as never as { objects: { uf: never } }).objects.uf, (a, b) => a !== b) as never,
      ),
    )
    .attr("fill", "none")
    .attr("stroke", MAP_STROKE)
    .attr("stroke-width", 1)
    .attr("pointer-events", "none");

  const lg = svg.append("g").attr("pointer-events", "none");
  const labels = (fc as unknown as { features: d3.ExtendedFeature[] }).features.map((d) => {
    const c = proj(d3.geoCentroid(d) as [number, number]) as [number, number];
    const id = d.id as string;
    const off = LABEL_OFFSET[id] || [0, 0];
    const g = lg.append("g");
    if (off[0] || off[1]) {
      g.append("line")
        .attr("x1", c[0])
        .attr("y1", c[1])
        .attr("x2", c[0] + off[0] * 0.82)
        .attr("y2", c[1] + off[1] * 0.82)
        .attr("stroke", MAP_LABEL_LINE)
        .attr("stroke-width", 0.8);
    }
    const t = g
      .append("text")
      .attr("x", c[0] + off[0])
      .attr("y", c[1] + off[1] + 4)
      .attr("text-anchor", "middle")
      .style("font", "600 11px/1 'IBM Plex Mono', monospace")
      .text(id);
    return { id, g, text: t };
  });

  const LEGEND_STOPS = [0.08, 0.3, 0.52, 0.74, 1];
  d3.select(legendSwatches)
    .selectAll("span")
    .data(LEGEND_STOPS)
    .join("span")
    .style("width", "1.375rem")
    .style("height", "0.8125rem")
    .style("border-radius", "0.25rem")
    .style("display", "inline-block");

  function update(): void {
    const scoped = events.filter((e) => inScope(e, state.scope));
    counts = {};
    for (const e of scoped) if (e.uf) counts[e.uf] = (counts[e.uf] || 0) + 1;
    max = Math.max(1, ...Object.values(counts));
    color = d3.scaleSequentialSqrt(d3.interpolateRgb(MAP_SCALE_START, MAP_SCALE_END)).domain([0, max]);

    ufPaths
      .attr("fill", (d) => (counts[d.id as string] ? color(counts[d.id as string]) : MAP_EMPTY))
      .attr("stroke", (d) => (state.selected === d.id ? MAP_SELECTED_STROKE : MAP_STROKE))
      .attr("stroke-width", (d) => (state.selected === d.id ? 2.2 : 0.9))
      .attr("opacity", (d) => (state.selected && state.selected !== d.id ? 0.55 : 1));

    for (const l of labels) {
      const n = counts[l.id] || 0;
      l.g.style("opacity", n ? "1" : "0.34");
      l.text.attr("fill", n && d3.hsl(color(n)).l < 0.62 ? MAP_LABEL_LIGHT : MAP_LABEL_DARK);
    }

    d3.select(legendSwatches)
      .selectAll<HTMLSpanElement, number>("span")
      .style("background", (f) => color(f * max));

    const online = scoped.filter((e) => e.online).length;
    const unknown = scoped.filter((e) => !e.uf && !e.online).length;
    const ufCount = Object.keys(counts).length;
    const cities = new Set(scoped.filter((e) => e.city).map((e) => e.city)).size;

    subline.textContent =
      scoped.length +
      (scoped.length === 1 ? " evento" : " eventos") +
      (state.scope === "all" ? " cadastrados" : " a partir de hoje") +
      " · " +
      ufCount +
      " estados · " +
      cities +
      " cidades";

    stats.replaceChildren(
      ...[
        ["Eventos mapeados", scoped.length - online - unknown],
        ["Estados alcançados", ufCount + " / 27"],
        ["Cidades", cities],
        ["Online", online],
      ].map(([k, v]) => {
        const cell = document.createElement("div");
        cell.className = "flex flex-col gap-1 bg-white px-4.5 py-3.5";
        const kEl = document.createElement("span");
        kEl.className = "font-mono-label text-label-2xs font-semibold uppercase tracking-widest text-brand-400";
        kEl.textContent = String(k);
        const vEl = document.createElement("span");
        vEl.className = "font-display text-heading-lg font-bold text-brand-950";
        vEl.textContent = String(v);
        cell.append(kEl, vEl);
        return cell;
      }),
    );

    const ranked = Object.keys(counts)
      .map((uf) => ({ uf, n: counts[uf] }))
      .sort((a, b) => b.n - a.n || UF_NAME[a.uf].localeCompare(UF_NAME[b.uf]));

    rankList.replaceChildren();
    if (ranked.length === 0) {
      const empty = document.createElement("p");
      empty.className = "m-2 text-xs leading-relaxed text-brand-400";
      empty.textContent = "Nenhum evento presencial nesse período.";
      rankList.appendChild(empty);
    }
    for (const r of ranked) {
      const on = state.selected === r.uf;
      const row = document.createElement("div");
      row.className = `flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2.5 ${on ? "bg-brand-50" : "bg-transparent"}`;

      const sig = document.createElement("span");
      sig.className = `w-7.5 shrink-0 rounded-md py-1 text-center font-mono-label text-label-sm font-semibold ${on ? "bg-brand-200 text-brand-950" : "bg-brand-50 text-brand-500"}`;
      sig.textContent = r.uf;

      const name = document.createElement("span");
      name.className = `min-w-0 flex-1 truncate text-xs ${on ? "font-semibold" : "font-medium"} text-brand-950`;
      name.textContent = UF_NAME[r.uf];

      const barTrack = document.createElement("span");
      barTrack.className = "h-1.75 w-19.5 shrink-0 overflow-hidden rounded-full bg-brand-50";
      const barFill = document.createElement("span");
      barFill.className = "block h-full rounded-full";
      barFill.style.width = Math.max(6, (r.n / max) * 100) + "%";
      barFill.style.background = color(r.n);
      barTrack.appendChild(barFill);

      const count = document.createElement("span");
      count.className = "w-5 shrink-0 text-right font-mono-label text-xs font-semibold text-brand-950";
      count.textContent = String(r.n);

      row.append(sig, name, barTrack, count);
      row.addEventListener("click", () => {
        state.selected = state.selected === r.uf ? null : r.uf;
        update();
      });
      rankList.appendChild(row);
    }

    extra.replaceChildren();
    const extraRows: [string, string, number, string][] = [
      ["online", "Eventos online", online, "sem estado definido"],
      ["unknown", "Cidade não identificada", unknown, "aparecem só na lista geral"],
    ];
    for (const [key, label, n, hint] of extraRows) {
      if (n <= 0) continue;
      const on = state.selected === key;
      const row = document.createElement("div");
      row.className = `flex cursor-pointer items-center justify-between gap-2.5 rounded-card-10 border px-2.5 py-2.5 ${on ? "border-brand-300 bg-brand-50" : "border-brand-100 bg-white"}`;

      const left = document.createElement("span");
      left.className = "flex flex-col gap-0.5";
      const labelEl = document.createElement("span");
      labelEl.className = "text-xs font-semibold text-brand-950";
      labelEl.textContent = label;
      const hintEl = document.createElement("span");
      hintEl.className = "text-label-xs text-brand-400";
      hintEl.textContent = hint;
      left.append(labelEl, hintEl);

      const countEl = document.createElement("span");
      countEl.className = "font-mono-label text-body-sm font-semibold text-brand-950";
      countEl.textContent = String(n);

      row.append(left, countEl);
      row.addEventListener("click", () => {
        state.selected = state.selected === key ? null : key;
        update();
      });
      extra.appendChild(row);
    }

    clearBtn.classList.toggle("hidden", !state.selected);

    for (const [key, btn] of [
      ["all", segAll],
      ["next", segNext],
    ] as const) {
      const on = state.scope === key;
      btn.classList.toggle("bg-white", on);
      btn.classList.toggle("shadow-sm", on);
      btn.classList.toggle("text-brand-950", on);
      btn.classList.toggle("bg-transparent", !on);
      btn.classList.toggle("text-brand-500", !on);
    }

    renderPanel(scoped);
  }

  function renderPanel(scoped: MapEvent[]): void {
    panel.replaceChildren();
    if (!state.selected) {
      const wrap = document.createElement("div");
      wrap.className = "flex flex-col gap-1.5";
      const label = document.createElement("span");
      label.className = "font-mono-label text-label-xs font-semibold uppercase tracking-widest text-brand-400";
      label.textContent = "Explore o mapa";
      const hint = document.createElement("span");
      hint.className = "max-w-xl text-sm leading-relaxed text-brand-700";
      hint.textContent = "Clique em um estado — no mapa ou no ranking — para ver quais eventos acontecem por lá.";
      wrap.append(label, hint);
      panel.appendChild(wrap);
      return;
    }

    let list: MapEvent[];
    let title: string;
    if (state.selected === "online") {
      list = scoped.filter((e) => e.online);
      title = "Eventos online";
    } else if (state.selected === "unknown") {
      list = scoped.filter((e) => !e.uf && !e.online);
      title = "Cidade não identificada";
    } else {
      list = scoped.filter((e) => e.uf === state.selected);
      title = UF_NAME[state.selected];
    }
    list = [...list].sort((a, b) => a.date.localeCompare(b.date));

    const head = document.createElement("div");
    head.className = "mb-3.5 flex flex-wrap items-baseline justify-between gap-4";
    const h2 = document.createElement("h2");
    h2.className = "font-display text-heading-lg font-bold tracking-tight text-brand-950";
    h2.textContent = title;
    const countLabel = document.createElement("span");
    countLabel.className = "text-xs font-medium text-brand-500";
    countLabel.textContent =
      list.length +
      (list.length === 1 ? " evento" : " eventos") +
      (state.scope === "all" ? " cadastrados" : " a partir de hoje");
    head.append(h2, countLabel);

    const rows = document.createElement("div");
    rows.className = "flex flex-col gap-2";

    if (list.length === 0) {
      const empty = document.createElement("span");
      empty.className = "text-body-sm text-brand-400";
      empty.textContent = "Nenhum evento nesse período.";
      rows.appendChild(empty);
    }

    for (const e of list) {
      const [y, m, d] = e.date.split("-").map(Number);
      const dt = new Date(y, m - 1, d);

      const row = document.createElement("a");
      row.href = e.url;
      row.target = "_blank";
      row.rel = "noopener";
      row.className =
        "flex items-center gap-4 rounded-xl border border-brand-100 bg-white p-3 transition-colors hover:border-brand-300";

      const dateCol = document.createElement("span");
      dateCol.className = "flex w-13 shrink-0 flex-col items-center gap-0.5";
      const wd = document.createElement("span");
      wd.className = "font-mono-label text-label-2xs uppercase text-brand-400";
      wd.textContent = WD[dt.getDay()];
      const dayNum = document.createElement("span");
      dayNum.className = "font-display text-xl font-bold leading-none text-brand-950";
      dayNum.textContent = String(dt.getDate());
      const mon = document.createElement("span");
      mon.className = "font-mono-label text-label-2xs uppercase text-brand-400";
      mon.textContent = MONTHS_SHORT[dt.getMonth()];
      dateCol.append(wd, dayNum, mon);

      const info = document.createElement("span");
      info.className = "flex min-w-0 flex-1 flex-col gap-1";
      const titleEl = document.createElement("span");
      titleEl.className = "text-sm font-semibold leading-snug text-brand-950";
      titleEl.textContent = e.title;
      const metaEl = document.createElement("span");
      metaEl.className = "text-xs leading-snug text-brand-500";
      metaEl.textContent = [e.city, e.community, e.type].filter(Boolean).join(" · ");
      info.append(titleEl, metaEl);

      const priceEl = document.createElement("span");
      priceEl.className = `shrink-0 rounded-full px-2.5 py-1.5 font-mono-label text-label-xs font-semibold uppercase tracking-wider ${
        e.paid ? "bg-price-paid-bg text-price-paid-text" : "bg-price-free-bg text-price-free-text"
      }`;
      priceEl.textContent = e.paid ? "Pago" : "Grátis";

      row.append(dateCol, info, priceEl);
      rows.appendChild(row);
    }

    panel.append(head, rows);
  }

  update();

  return root;
}
