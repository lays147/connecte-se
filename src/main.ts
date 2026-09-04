import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { mountConsentBanner } from "./render/consentBanner";
import { renderCtaBand } from "./render/ctaBand";
import { mountEventModal } from "./render/eventModal";
import { buildFeaturedList, renderFeaturedCarousel, type CarouselDirection } from "./render/featured";
import { renderFilterBar } from "./render/filterBar";
import { renderFooter } from "./render/footer";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMonthSection, monthSectionId } from "./render/monthGroup";
import { renderMonthNavRail } from "./render/monthNav";
import { observeActiveMonth } from "./state/activeMonth";
import { createInitialState } from "./state/appState";
import { startCarousel } from "./state/carousel";
import { applyStoredConsent } from "./state/consent";
import { defaultFilterState, filterOptions, matchesFilters } from "./state/filters";
import { getStoredLocation } from "./state/geolocation";
import { buildMonthBuckets, buildYearNav } from "./state/monthBuckets";
import { keepScroll } from "./state/scroll";
import { readParams, writeParams } from "./state/urlState";

applyStoredConsent();
mountConsentBanner();
mountEventModal();

const allEvents = loadAllEnrichedEvents();
const state = createInitialState();

const params = readParams();
const defaults = defaultFilterState();
const options = filterOptions(allEvents);
const regionParam = params.get("regiao");
const cityParam = params.get("cidade");
const typeParam = params.get("tipo");
const paidParam = params.get("pago");
const queryParam = params.get("busca");
state.filters = {
  region: regionParam && options.region.includes(regionParam) ? regionParam : defaults.region,
  city: cityParam && options.city.includes(cityParam) ? cityParam : defaults.city,
  type: typeParam && options.type.includes(typeParam) ? typeParam : defaults.type,
  paid: paidParam && options.paid.includes(paidParam) ? paidParam : defaults.paid,
  query: queryParam ?? defaults.query,
  nearMe: getStoredLocation(),
};

function syncUrl(): void {
  writeParams({
    regiao: state.filters.region === defaults.region ? null : state.filters.region,
    cidade: state.filters.city === defaults.city ? null : state.filters.city,
    tipo: state.filters.type === defaults.type ? null : state.filters.type,
    pago: state.filters.paid === defaults.paid ? null : state.filters.paid,
    busca: state.filters.query === defaults.query ? null : state.filters.query,
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);
function todayIso(): string {
  return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
}

let featuredCount = 0;
let stopObservingActiveMonth: () => void = () => {};
let justExpandedMonthKey: string | null = null;
const featuredHost = document.createElement("div");

// Featured carousel always draws from the full unfiltered event list — the
// search box and filters below narrow the listing, not the highlights.
const allUpcoming = allEvents
  .filter((e) => e.date >= todayIso())
  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

function renderCarousel(direction: CarouselDirection = "fade"): void {
  const featuredList = buildFeaturedList(allUpcoming);
  featuredCount = featuredList.length;
  const featured = renderFeaturedCarousel(
    featuredList,
    state.carousel,
    {
      onPrev: () => {
        state.carousel -= 1;
        renderCarousel("prev");
      },
      onNext: () => {
        state.carousel += 1;
        renderCarousel("next");
      },
      onSelect: (index) => {
        const goingForward = ((index - state.carousel) % featuredCount + featuredCount) % featuredCount;
        const goingBackward = featuredCount - goingForward;
        state.carousel = index;
        renderCarousel(goingForward <= goingBackward ? "next" : "prev");
      },
    },
    direction,
  );
  featuredHost.replaceChildren(...(featured ? [featured] : []));
}

function scrollToMonthKey(key: string): void {
  const [year, monthIndex] = key.split("-").map(Number);
  requestAnimationFrame(() => {
    document.getElementById(monthSectionId(year, monthIndex))?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function render(): void {
  stopObservingActiveMonth();

  const active = document.activeElement;
  const restoreFocus =
    active instanceof HTMLInputElement && active.type === "search" && main.contains(active)
      ? { selectionStart: active.selectionStart, selectionEnd: active.selectionEnd }
      : null;

  main.replaceChildren();

  const filtered = allEvents.filter((e) => matchesFilters(e, state.filters));
  const upcoming = filtered.filter((e) => e.date >= todayIso()).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Featured carousel — rendered into a stable host so its own auto-advance
  // timer never has to rebuild the rest of the page. It draws from
  // allUpcoming (unfiltered), so search/filters never change the highlights.
  main.appendChild(featuredHost);

  // Filter bar
  main.appendChild(
    renderFilterBar(allEvents, upcoming.length, state.filters, (next) => {
      state.filters = next;
      syncUrl();
      render();
    }),
  );

  const buckets = buildMonthBuckets(filtered, today, state.openPast, state.showCurrentMonthPast);
  const visibleBuckets = buckets.filter((b) => (!b.isPast || b.opened) && (b.list.length > 0 || b.hasPast));
  const yearNav = buildYearNav(buckets, state.collapsedYears, today);

  const row = document.createElement("div");
  row.className = "flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-0";

  const monthList = document.createElement("div");
  monthList.className = "flex min-w-0 flex-1 flex-col";
  const sectionEls: HTMLElement[] = [];
  for (const bucket of visibleBuckets) {
    const section = renderMonthSection(
      bucket,
      today,
      state.showCurrentMonthPast,
      state.collapsedMonths.has(bucket.key),
      {
        onToggleCurrentMonthPast: () => {
          state.showCurrentMonthPast = !state.showCurrentMonthPast;
          render();
        },
        onToggleCollapsed: () => {
          const next = new Set(state.collapsedMonths);
          if (next.has(bucket.key)) {
            next.delete(bucket.key);
            justExpandedMonthKey = bucket.key;
          } else {
            next.add(bucket.key);
          }
          state.collapsedMonths = next;
          render();
          document
            .getElementById(monthSectionId(bucket.year, bucket.monthIndex))
            ?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        },
      },
      state.filters.nearMe,
      bucket.key === justExpandedMonthKey,
    );
    sectionEls.push(section);
    monthList.appendChild(section);
  }
  if (visibleBuckets.length === 0) {
    const hasActiveFilters =
      JSON.stringify(state.filters) !== JSON.stringify({ ...defaults, nearMe: state.filters.nearMe });

    const empty = document.createElement("div");
    empty.className = "flex flex-col items-center gap-1.5 px-6 py-16 text-center";

    const emptyTitle = document.createElement("span");
    emptyTitle.className = "font-display text-heading-sm font-semibold text-brand-950";
    emptyTitle.textContent = "Nenhum evento com esses filtros";

    const emptyDesc = document.createElement("span");
    emptyDesc.className = "text-body-sm text-brand-500";

    if (hasActiveFilters) {
      const otherCount = allUpcoming.length;
      const otherLabel = otherCount === 1 ? "1 outro evento está a caminho" : `${otherCount} outros eventos estão a caminho`;
      emptyDesc.appendChild(document.createTextNode(`${otherLabel} — tente outro termo ou `));
      const clearLink = document.createElement("button");
      clearLink.type = "button";
      clearLink.className = "cursor-pointer font-semibold text-brand-700 underline hover:text-brand-600";
      clearLink.textContent = "limpe os filtros";
      clearLink.addEventListener("click", () => {
        state.filters = { ...defaultFilterState(), nearMe: state.filters.nearMe };
        syncUrl();
        render();
      });
      emptyDesc.appendChild(clearLink);
      emptyDesc.appendChild(document.createTextNode("."));
    } else {
      emptyDesc.textContent = "Novos eventos chegam toda semana — volte em breve.";
    }

    empty.append(emptyTitle, emptyDesc);
    monthList.appendChild(empty);
  }

  const nav = renderMonthNavRail(yearNav, {
    onToggleYear: (year) => {
      const currentlyOpen = yearNav.find((g) => g.year === year)?.open ?? true;
      state.collapsedYears = { ...state.collapsedYears, [year]: currentlyOpen };
      keepScroll(render);
    },
    onLoadMonth: (key) => {
      state.openPast = new Set(state.openPast).add(key);
      render();
      scrollToMonthKey(key);
    },
    onLoadYear: (year) => {
      const group = yearNav.find((g) => g.year === year);
      if (!group) return;
      const next = new Set(state.openPast);
      for (const key of group.lockedKeys) next.add(key);
      state.openPast = next;
      render();
      if (group.lockedKeys.length > 0) scrollToMonthKey(group.lockedKeys[0]);
    },
    onLoadAllPast: () => {
      keepScroll(() => {
        const next = new Set(state.openPast);
        for (const b of buckets) next.add(b.key);
        state.openPast = next;
        render();
      });
    },
  });

  row.append(monthList, nav);
  main.appendChild(row);
  stopObservingActiveMonth = observeActiveMonth(sectionEls, nav);
  justExpandedMonthKey = null;

  if (restoreFocus) {
    const input = main.querySelector<HTMLInputElement>('input[type="search"]');
    if (input) {
      input.focus();
      input.setSelectionRange(restoreFocus.selectionStart, restoreFocus.selectionEnd);
    }
  }
}

const header = renderHeader({ active: "eventos" });

const { shell, main } = mountLayout(header);
shell.append(renderCtaBand(), renderFooter());

renderCarousel();
render();

startCarousel(
  () => featuredCount,
  () => {
    state.carousel += 1;
    renderCarousel("next");
  },
);
