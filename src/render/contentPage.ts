import { CURATED_CONTENT, FORMAT_META, FORMAT_ORDER, THEMES, type ContentFormat, type CuratedContent } from "../data/curatedContent";

type GroupBy = "formato" | "tema";

export interface ContentPageState {
  query: string;
  format: ContentFormat | "todos";
  theme: string | "todos";
  groupBy: GroupBy;
}

export function createInitialContentState(): ContentPageState {
  return { query: "", format: "todos", theme: "todos", groupBy: "formato" };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "abrir";
  }
}

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

function chipButton(text: string, active: boolean, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = [
    "cursor-pointer whitespace-nowrap rounded-card-9 px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
    active ? "border border-brand-400 bg-brand-50 text-brand-700" : "border border-brand-100 bg-white text-brand-500",
  ].join(" ");
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

function renderItemCard(item: CuratedContent): HTMLElement {
  const meta = FORMAT_META[item.fmt];

  const card = document.createElement("a");
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener";
  card.className =
    "flex flex-col gap-1.5 rounded-card-13 border border-brand-100 bg-white p-3.5 text-inherit no-underline hover:border-brand-300 hover:bg-brand-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";

  const topRow = document.createElement("div");
  topRow.className = "flex items-center gap-2";

  const dot = document.createElement("span");
  dot.className = "h-1.5 w-1.5 shrink-0 rounded-full";
  dot.style.background = meta.accent;
  topRow.appendChild(dot);

  const name = document.createElement("span");
  name.className = "font-display text-body-md font-semibold tracking-tight text-brand-950";
  name.textContent = item.name;
  topRow.appendChild(name);

  const fmtTag = document.createElement("span");
  fmtTag.className = "ml-auto whitespace-nowrap rounded-card-5 px-1.5 py-1 font-mono-label text-label-2xs font-semibold uppercase tracking-widest";
  fmtTag.style.color = meta.accent;
  fmtTag.style.background = meta.tint;
  fmtTag.textContent = item.fmt;
  topRow.appendChild(fmtTag);

  const desc = document.createElement("span");
  desc.className = "text-body-sm-tight leading-relaxed text-brand-600";
  desc.textContent = item.desc;

  const bottomRow = document.createElement("div");
  bottomRow.className = "mt-px flex flex-wrap items-center gap-1.5";

  for (const theme of item.themes) {
    const tag = document.createElement("span");
    tag.className = "rounded-card-5 bg-brand-50 px-1.5 py-1 font-mono-label text-label-xs text-brand-500";
    tag.textContent = theme;
    bottomRow.appendChild(tag);
  }

  const hostLink = document.createElement("span");
  hostLink.className = "ml-auto inline-flex items-center gap-1.5 text-label-sm font-medium text-brand-500";
  hostLink.innerHTML = `${hostOf(item.url)}${externalLinkIconSvg()}`;
  bottomRow.appendChild(hostLink);

  card.append(topRow, desc, bottomRow);
  return card;
}

export function renderContentPage(state: ContentPageState, onChange: (next: ContentPageState) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "flex flex-col";

  const needle = state.query.trim().toLowerCase();
  const filtered = CURATED_CONTENT.filter((item) => {
    if (state.format !== "todos" && item.fmt !== state.format) return false;
    if (state.theme !== "todos" && !item.themes.includes(state.theme)) return false;
    if (needle) {
      const hay = `${item.name} ${item.desc} ${item.themes.join(" ")} ${item.fmt}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const countOf = (fmt: ContentFormat) => CURATED_CONTENT.filter((d) => d.fmt === fmt).length;

  // ---- hero
  const hero = document.createElement("div");
  hero.className = "flex flex-wrap items-end justify-between gap-8 border-b border-brand-100 px-(--spacing-gutter) py-7";

  const heroText = document.createElement("div");
  heroText.className = "flex max-w-155 flex-col gap-2";

  const eyebrow = document.createElement("span");
  eyebrow.className = "font-mono-label text-label-xs uppercase tracking-widest text-brand-500";
  eyebrow.textContent = "Guia de curadoria";

  const h1 = document.createElement("h1");
  h1.className = "font-display text-heading-2xl font-bold leading-tight tracking-tight text-brand-950";
  h1.textContent = "Conteúdos que valem a pena seguir";

  const heroDesc = document.createElement("span");
  heroDesc.className = "text-body-sm leading-relaxed text-brand-500";
  heroDesc.textContent =
    "Canais, newsletters, blogs e podcasts feitos por brasileiros. Lista curada à mão — indique o que está faltando pelo GitHub.";

  heroText.append(eyebrow, h1, heroDesc);

  const tallies = document.createElement("div");
  tallies.className = "flex items-center gap-5";

  const tallyItems: [string, number][] = [
    ["no total", CURATED_CONTENT.length],
    ["canais", countOf("YouTube")],
    ["para ler", countOf("Newsletter") + countOf("Blog")],
    ["podcasts", countOf("Podcast")],
    ["cursos", countOf("Curso")],
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
  searchInput.placeholder = "Buscar por nome, tema ou assunto";
  searchInput.value = state.query;
  searchInput.className = "w-full border-0 bg-transparent p-0 text-body-sm text-brand-950 outline-none";
  let searchDebounce: ReturnType<typeof setTimeout> | undefined;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    const query = searchInput.value;
    searchDebounce = setTimeout(() => onChange({ ...state, query }), 200);
  });
  searchBox.appendChild(searchInput);

  const formatTabs = document.createElement("div");
  formatTabs.className = "flex shrink-0 gap-0.5 rounded-card-10 border border-brand-100 bg-brand-100/60 p-0.5";
  formatTabs.appendChild(segButton("Tudo", state.format === "todos", () => onChange({ ...state, format: "todos" })));
  for (const fmt of FORMAT_ORDER) {
    formatTabs.appendChild(segButton(fmt, state.format === fmt, () => onChange({ ...state, format: fmt })));
  }

  const themeChips = document.createElement("div");
  themeChips.className = "flex flex-1 flex-wrap items-center gap-1.5";
  themeChips.appendChild(chipButton("Todos os temas", state.theme === "todos", () => onChange({ ...state, theme: "todos" })));
  for (const theme of THEMES) {
    themeChips.appendChild(chipButton(theme, state.theme === theme, () => onChange({ ...state, theme })));
  }

  const groupWrap = document.createElement("div");
  groupWrap.className = "flex shrink-0 items-center gap-2";
  const groupLabel = document.createElement("span");
  groupLabel.className = "font-mono-label text-label-sm uppercase tracking-wider text-brand-500";
  groupLabel.textContent = "Agrupar";
  const groupTabs = document.createElement("div");
  groupTabs.className = "flex gap-0.5 rounded-card-10 border border-brand-100 bg-brand-100/60 p-0.5";
  groupTabs.appendChild(segButton("Formato", state.groupBy === "formato", () => onChange({ ...state, groupBy: "formato" })));
  groupTabs.appendChild(segButton("Tema", state.groupBy === "tema", () => onChange({ ...state, groupBy: "tema" })));
  groupWrap.append(groupLabel, groupTabs);

  filterBar.append(searchBox, formatTabs, themeChips, groupWrap);

  // ---- sections
  const sectionsWrap = document.createElement("div");
  sectionsWrap.className = "flex flex-col";

  interface Section {
    label: string;
    accent: string;
    note: string;
    items: CuratedContent[];
  }

  let sections: Section[];
  if (state.groupBy === "formato") {
    sections = FORMAT_ORDER.map((fmt) => ({
      label: fmt,
      accent: FORMAT_META[fmt].accent,
      note: FORMAT_META[fmt].note,
      items: filtered.filter((d) => d.fmt === fmt),
    })).filter((s) => s.items.length > 0);
  } else {
    sections = THEMES.map((theme) => ({
      label: theme.charAt(0).toUpperCase() + theme.slice(1),
      accent: "oklch(0.5 0.17 292)",
      note: "",
      items: filtered.filter((d) => d.themes.includes(theme)),
    })).filter((s) => s.items.length > 0);
  }

  for (const section of sections) {
    const sectionEl = document.createElement("div");
    sectionEl.className = "flex flex-col";

    const heading = document.createElement("div");
    heading.className = "flex items-baseline gap-2.5 border-y border-brand-50 bg-brand-50/40 px-(--spacing-gutter) py-4";

    const dot = document.createElement("span");
    dot.className = "size-1.75 rounded-full";
    dot.style.background = section.accent;
    heading.appendChild(dot);

    const label = document.createElement("h2");
    label.className = "font-display text-heading-sm font-semibold text-brand-950";
    label.textContent = section.label;
    heading.appendChild(label);

    const count = document.createElement("span");
    count.className = "text-xs font-medium text-brand-500";
    count.textContent = section.items.length + (section.items.length === 1 ? " indicação" : " indicações");
    heading.appendChild(count);

    if (section.note) {
      const note = document.createElement("span");
      note.className = "ml-1.5 text-xs text-brand-500";
      note.textContent = section.note;
      heading.appendChild(note);
    }

    sectionEl.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 gap-2.5 px-(--spacing-gutter) py-4 sm:grid-cols-2 lg:grid-cols-3";
    for (const item of section.items) {
      grid.appendChild(renderItemCard(item));
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
    emptyDesc.textContent = "Tente outro tema ou limpe a busca.";
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
  ctaTitle.textContent = "Indique um canal ou newsletter";
  const ctaDesc = document.createElement("span");
  ctaDesc.className = "text-body-sm leading-relaxed text-brand-600";
  ctaDesc.textContent = "A curadoria é aberta: abra uma issue com o link, quem produz e por que vale a pena acompanhar.";
  ctaText.append(ctaTitle, ctaDesc);

  const ctaLink = document.createElement("a");
  ctaLink.href = "https://github.com/lays147/connecte-se/issues/new";
  ctaLink.target = "_blank";
  ctaLink.rel = "noopener";
  ctaLink.className =
    "inline-flex shrink-0 items-center gap-2 rounded-card-11 bg-brand-700 px-4.5 py-3 text-body-sm font-semibold text-white hover:bg-brand-600";
  ctaLink.innerHTML = `Indicar conteúdo${externalLinkIconSvg()}`;

  cta.append(ctaText, ctaLink);
  root.appendChild(cta);

  return root;
}
