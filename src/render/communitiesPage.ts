import { ALL_SOURCES, hostOf, type CommunitySource, type SourceType } from "../data/communitiesList";
import { initialsOf } from "./card";

export interface CommunitiesPageState {
  query: string;
  type: SourceType | "todos";
}

export function createInitialCommunitiesState(): CommunitiesPageState {
  return { query: "", type: "todos" };
}

const TYPE_LABEL: Record<SourceType, string> = {
  community: "Comunidade",
  event: "Evento recorrente",
};

const TYPE_ACCENT: Record<SourceType, { text: string; bg: string }> = {
  community: { text: "text-brand-700", bg: "bg-brand-50" },
  event: { text: "text-accent-blue-700", bg: "bg-accent-blue-50" },
};

const FREQUENCY_LABEL: Record<CommunitySource["frequency"], string> = {
  monthly: "Mensal",
  yearly: "Anual",
  occasionally: "Eventual",
};

function externalLinkIconSvg(): string {
  return `<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 9 9 3M4.4 3H9v4.6"></path></svg>`;
}

function segButton(text: string, active: boolean, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = [
    "cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
    active ? "bg-white text-brand-950 shadow-sm" : "bg-transparent text-brand-500",
  ].join(" ");
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

const TYPE_STRIP: Record<SourceType, string> = {
  community: "bg-brand-700",
  event: "bg-accent-blue-700",
};

// Sources that share a multi-word org prefix (e.g. 24 "AWS User Group X"
// chapters) render as visually near-identical cards; find the longest shared
// prefix among a source's siblings of the same type so the differentiating
// suffix (the city/topic) can be emphasized instead of the repeated prefix.
function sharedPrefixWord(source: CommunitySource, siblings: CommunitySource[]): string {
  const words = source.name.split(" ");
  let boundary = 0;
  for (let len = words.length - 1; len >= 2; len--) {
    const prefix = words.slice(0, len).join(" ");
    const matches = siblings.filter((s) => s !== source && s.name.startsWith(prefix + " "));
    if (matches.length >= 2) {
      boundary = len;
      break;
    }
  }
  return boundary > 0 ? words.slice(0, boundary).join(" ") + " " : "";
}

function renderSourceCard(source: CommunitySource, siblings: CommunitySource[]): HTMLElement {
  const accent = TYPE_ACCENT[source.type];

  const card = document.createElement("a");
  card.href = source.url;
  card.target = "_blank";
  card.rel = "noopener";
  card.className =
    "flex flex-col overflow-hidden rounded-card-13 border border-brand-100 bg-white text-inherit no-underline hover:border-brand-300 hover:bg-brand-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";

  const strip = document.createElement("div");
  strip.className = `h-0.75 ${TYPE_STRIP[source.type]}`;
  card.appendChild(strip);

  const body = document.createElement("div");
  body.className = "flex flex-1 flex-col gap-2.5 p-3.5";

  const topRow = document.createElement("div");
  topRow.className = "flex items-center gap-2.5";

  const avatar = document.createElement("span");
  avatar.className = `inline-flex size-7 shrink-0 items-center justify-center rounded-card-9 font-display text-xs font-semibold ${accent.bg} ${accent.text}`;
  avatar.textContent = initialsOf(source.name);
  topRow.appendChild(avatar);

  const name = document.createElement("span");
  name.className = "min-w-0 flex-1 truncate font-display text-body-md font-semibold tracking-tight text-brand-950";
  const prefix = sharedPrefixWord(source, siblings);
  if (prefix) {
    const prefixSpan = document.createElement("span");
    prefixSpan.className = "font-medium text-brand-500";
    prefixSpan.textContent = prefix;
    name.appendChild(prefixSpan);
    name.appendChild(document.createTextNode(source.name.slice(prefix.length)));
  } else {
    name.textContent = source.name;
  }
  topRow.appendChild(name);

  body.appendChild(topRow);

  const bottomRow = document.createElement("div");
  bottomRow.className = "flex flex-wrap items-center gap-1.5";

  const typeTag = document.createElement("span");
  typeTag.className = `whitespace-nowrap rounded-card-5 px-1.5 py-1 font-mono-label text-label-2xs font-semibold uppercase tracking-widest ${accent.bg} ${accent.text}`;
  typeTag.textContent = TYPE_LABEL[source.type];
  bottomRow.appendChild(typeTag);

  const freqTag = document.createElement("span");
  freqTag.className = "rounded-card-5 bg-brand-50 px-1.5 py-1 font-mono-label text-label-xs text-brand-500";
  freqTag.textContent = FREQUENCY_LABEL[source.frequency];
  bottomRow.appendChild(freqTag);

  const hostLink = document.createElement("span");
  hostLink.className = "ml-auto inline-flex items-center gap-1.5 text-label-sm font-medium text-brand-500";
  hostLink.innerHTML = `${hostOf(source.url)}${externalLinkIconSvg()}`;
  bottomRow.appendChild(hostLink);

  body.appendChild(bottomRow);
  card.appendChild(body);
  return card;
}

export function renderCommunitiesPage(
  state: CommunitiesPageState,
  onChange: (next: CommunitiesPageState) => void,
): HTMLElement {
  const root = document.createElement("div");
  root.className = "flex flex-col";

  const needle = state.query.trim().toLowerCase();
  const filtered = ALL_SOURCES.filter((source) => {
    if (state.type !== "todos" && source.type !== state.type) return false;
    if (needle && !source.name.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const countOf = (type: SourceType) => ALL_SOURCES.filter((s) => s.type === type).length;

  // ---- hero
  const hero = document.createElement("div");
  hero.className = "flex flex-wrap items-end justify-between gap-8 border-b border-brand-100 px-(--spacing-gutter) py-7";

  const heroText = document.createElement("div");
  heroText.className = "flex max-w-155 flex-col gap-2";

  const eyebrow = document.createElement("span");
  eyebrow.className = "font-mono-label text-label-xs uppercase tracking-widest text-brand-500";
  eyebrow.textContent = "Diretório de fontes";

  const h1 = document.createElement("h1");
  h1.className = "font-display text-heading-2xl font-bold leading-tight tracking-tight text-brand-950";
  h1.textContent = "Comunidades e organizadores de tecnologia";

  const heroDesc = document.createElement("span");
  heroDesc.className = "text-body-sm leading-relaxed text-brand-500";
  heroDesc.textContent =
    "Todas as comunidades e eventos recorrentes que acompanhamos, mesmo os que não têm um próximo encontro anunciado agora.";

  heroText.append(eyebrow, h1, heroDesc);

  const tallies = document.createElement("div");
  tallies.className = "flex flex-wrap items-center gap-x-5 gap-y-3";

  const tallyItems: [string, number][] = [
    ["no total", ALL_SOURCES.length],
    ["comunidades", countOf("community")],
    ["eventos recorrentes", countOf("event")],
  ];
  for (const [label, n] of tallyItems) {
    const col = document.createElement("div");
    col.className = "flex flex-col gap-1";
    const num = document.createElement("span");
    num.className = "font-display text-heading-lg font-bold text-brand-950";
    num.textContent = String(n);
    const lbl = document.createElement("span");
    lbl.className = "font-mono-label text-label-sm uppercase tracking-wider text-brand-500";
    lbl.textContent = label;
    col.append(num, lbl);
    tallies.appendChild(col);
  }

  hero.append(heroText, tallies);

  // ---- filter bar
  const filterBar = document.createElement("div");
  filterBar.className =
    "sticky top-0 z-5 flex flex-wrap items-center gap-3.5 border-b border-brand-100 bg-brand-50/40 px-(--spacing-gutter) py-3";

  const searchBox = document.createElement("div");
  searchBox.className =
    "flex h-9 max-w-85 flex-1 basis-64 items-center gap-2 rounded-card-10 border border-brand-100 bg-white px-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400";
  searchBox.innerHTML = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="var(--color-icon-muted)" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.6"></circle><path d="M10.5 10.5 14 14"></path></svg>`;

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "Buscar por nome";
  searchInput.value = state.query;
  searchInput.className = "w-full border-0 bg-transparent p-0 text-body-sm text-brand-950 outline-none";
  let searchDebounce: ReturnType<typeof setTimeout> | undefined;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    const query = searchInput.value;
    searchDebounce = setTimeout(() => onChange({ ...state, query }), 200);
  });
  searchBox.appendChild(searchInput);

  const typeTabs = document.createElement("div");
  typeTabs.className =
    "flex max-w-full shrink-0 gap-0.5 overflow-x-auto rounded-card-10 border border-brand-100 bg-brand-100/60 p-0.5";
  typeTabs.appendChild(segButton("Tudo", state.type === "todos", () => onChange({ ...state, type: "todos" })));
  typeTabs.appendChild(segButton("Comunidades", state.type === "community", () => onChange({ ...state, type: "community" })));
  typeTabs.appendChild(segButton("Eventos recorrentes", state.type === "event", () => onChange({ ...state, type: "event" })));

  filterBar.append(searchBox, typeTabs);

  // ---- sections (grouped by type so 100+ entries don't render as one flat wall)
  const sectionsWrap = document.createElement("div");
  sectionsWrap.className = "flex flex-col";

  const sectionTypes: SourceType[] = state.type === "todos" ? ["community", "event"] : [state.type];
  const SECTION_LABEL: Record<SourceType, string> = {
    community: "Comunidades",
    event: "Eventos recorrentes",
  };

  for (const type of sectionTypes) {
    const items = filtered.filter((s) => s.type === type);
    if (items.length === 0) continue;

    const sectionEl = document.createElement("div");
    sectionEl.className = "flex flex-col";

    const heading = document.createElement("div");
    heading.className = "flex items-baseline gap-2.5 border-y border-brand-50 bg-brand-50/40 px-(--spacing-gutter) py-4";

    const dot = document.createElement("span");
    dot.className = `size-1.75 rounded-full ${TYPE_STRIP[type]}`;
    heading.appendChild(dot);

    const label = document.createElement("h2");
    label.className = "font-display text-heading-sm font-semibold text-brand-950";
    label.textContent = SECTION_LABEL[type];
    heading.appendChild(label);

    const count = document.createElement("span");
    count.className = "text-xs font-medium text-brand-500";
    count.textContent = items.length + (items.length === 1 ? " resultado" : " resultados");
    heading.appendChild(count);

    sectionEl.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 gap-2.5 px-(--spacing-gutter) py-4 sm:grid-cols-2 lg:grid-cols-3";
    for (const source of items) {
      grid.appendChild(renderSourceCard(source, items));
    }
    sectionEl.appendChild(grid);

    sectionsWrap.appendChild(sectionEl);
  }

  root.append(hero, filterBar, sectionsWrap);

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "flex flex-col items-start gap-1.5 px-(--spacing-gutter) py-12";
    const emptyTitle = document.createElement("span");
    emptyTitle.className = "font-display text-heading-sm font-semibold text-brand-950";
    emptyTitle.textContent = "Nada encontrado para esse filtro";
    const emptyDesc = document.createElement("span");
    emptyDesc.className = "text-body-sm text-brand-500";
    emptyDesc.textContent = "Tente outro termo ou ";
    const clearLink = document.createElement("button");
    clearLink.type = "button";
    clearLink.className = "cursor-pointer font-semibold text-brand-700 underline hover:text-brand-600";
    clearLink.textContent = "limpe a busca";
    clearLink.addEventListener("click", () => onChange({ query: "", type: "todos" }));
    emptyDesc.appendChild(clearLink);
    emptyDesc.appendChild(document.createTextNode("."));
    empty.append(emptyTitle, emptyDesc);
    root.appendChild(empty);
  }

  // ---- CTA
  const cta = document.createElement("div");
  cta.className = "flex flex-wrap items-center justify-between gap-8 border-t border-brand-100 bg-brand-50/60 px-(--spacing-gutter) py-6";

  const ctaText = document.createElement("div");
  ctaText.className = "flex max-w-130 flex-col gap-1.5";
  const ctaTitle = document.createElement("h3");
  ctaTitle.className = "font-display text-heading-md font-bold leading-tight tracking-tight text-brand-950";
  ctaTitle.textContent = "Cadastre uma comunidade";
  const ctaDesc = document.createElement("span");
  ctaDesc.className = "text-body-sm leading-relaxed text-brand-600";
  ctaDesc.textContent = "Submeta pelo GitHub: a comunidade entra na lista e passa a ser coletada automaticamente pelo scraper.";
  ctaText.append(ctaTitle, ctaDesc);

  const ctaLink = document.createElement("a");
  ctaLink.href = "https://github.com/lays147/connecte-se/actions/workflows/add-source.yml";
  ctaLink.target = "_blank";
  ctaLink.rel = "noopener";
  ctaLink.className =
    "inline-flex shrink-0 items-center gap-2 rounded-card-11 bg-brand-700 px-4.5 py-3 text-body-sm font-semibold text-white hover:bg-brand-600";
  ctaLink.innerHTML = `Cadastrar comunidade${externalLinkIconSvg()}`;

  cta.append(ctaText, ctaLink);
  root.appendChild(cta);

  return root;
}
