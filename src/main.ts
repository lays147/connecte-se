import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { renderCommunityShelves, buildCommunityTally, buildShelves } from "./render/communityShelves";
import { mountConsentBanner } from "./render/consentBanner";
import { renderCtaBand } from "./render/ctaBand";
import { mountEventModal } from "./render/eventModal";
import { buildFeaturedList, renderFeaturedCarousel } from "./render/featured";
import { renderFilterBar } from "./render/filterBar";
import { renderFooter } from "./render/footer";
import { renderGroupToggle, type GroupBy } from "./render/groupToggle";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMonthSection, monthSectionId } from "./render/monthGroup";
import { renderMonthNavRail } from "./render/monthNav";
import { observeActiveMonth } from "./state/activeMonth";
import { createInitialState } from "./state/appState";
import { startCarousel } from "./state/carousel";
import { applyStoredConsent } from "./state/consent";
import { defaultFilterState, filterOptions, matchesFilters } from "./state/filters";
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
};
if (params.get("agrupar") === "comunidade") state.groupBy = "comunidade";

function syncUrl(): void {
  writeParams({
    regiao: state.filters.region === defaults.region ? null : state.filters.region,
    cidade: state.filters.city === defaults.city ? null : state.filters.city,
    tipo: state.filters.type === defaults.type ? null : state.filters.type,
    pago: state.filters.paid === defaults.paid ? null : state.filters.paid,
    busca: state.filters.query === defaults.query ? null : state.filters.query,
    agrupar: state.groupBy === "data" ? null : state.groupBy,
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);
function todayIso(): string {
  return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
}

let featuredCount = 0;
let stopObservingActiveMonth: () => void = () => {};
const featuredHost = document.createElement("div");

// Featured carousel always draws from the full unfiltered event list — the
// search box and filters below narrow the listing, not the highlights.
const allUpcoming = allEvents
  .filter((e) => e.date >= todayIso())
  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

function renderCarousel(): void {
  const featuredList = buildFeaturedList(allUpcoming);
  featuredCount = featuredList.length;
  const featured = renderFeaturedCarousel(featuredList, state.carousel, {
    onPrev: () => {
      state.carousel -= 1;
      renderCarousel();
    },
    onNext: () => {
      state.carousel += 1;
      renderCarousel();
    },
    onSelect: (index) => {
      state.carousel = index;
      renderCarousel();
    },
  });
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

  // Group-by toggle
  main.appendChild(
    renderGroupToggle(state.groupBy, (next: GroupBy) => {
      state.groupBy = next;
      syncUrl();
      render();
    }),
  );

  if (state.groupBy === "data") {
    const buckets = buildMonthBuckets(filtered, today, state.openPast, state.showCurrentMonthPast);
    const visibleBuckets = buckets.filter((b) => (!b.isPast || b.opened) && (b.list.length > 0 || b.hasPast));
    const yearNav = buildYearNav(buckets, state.collapsedYears, today);

    const row = document.createElement("div");
    row.className = "flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-0";

    const monthList = document.createElement("div");
    monthList.className = "flex min-w-0 flex-1 flex-col";
    const sectionEls: HTMLElement[] = [];
    for (const bucket of visibleBuckets) {
      const section = renderMonthSection(bucket, today, state.showCurrentMonthPast, {
        onToggleCurrentMonthPast: () => {
          state.showCurrentMonthPast = !state.showCurrentMonthPast;
          render();
        },
      });
      sectionEls.push(section);
      monthList.appendChild(section);
    }
    if (visibleBuckets.length === 0) {
      const empty = document.createElement("p");
      empty.className = "px-6 py-10 text-center text-sm text-brand-500";
      empty.textContent = "Nenhum evento encontrado.";
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
  } else {
    const tally = buildCommunityTally(filtered);
    const shelves = buildShelves(tally, upcoming);
    main.appendChild(renderCommunityShelves(shelves, today));
  }

  if (restoreFocus) {
    const input = main.querySelector<HTMLInputElement>('input[type="search"]');
    if (input) {
      input.focus();
      input.setSelectionRange(restoreFocus.selectionStart, restoreFocus.selectionEnd);
    }
  }
}

const header = renderHeader({
  active: "eventos",
  onNavCommunities: () => {
    state.groupBy = "comunidade";
    syncUrl();
    render();
  },
});

const { shell, main } = mountLayout(header);
shell.append(renderCtaBand(), renderFooter());

renderCarousel();
render();

startCarousel(
  () => featuredCount,
  () => {
    state.carousel += 1;
    renderCarousel();
  },
);
