import "./style.css";
import { loadAllEnrichedEvents } from "./data/allEvents";
import { renderCommunityShelves, buildCommunityTally, buildShelves } from "./render/communityShelves";
import { mountConsentBanner } from "./render/consentBanner";
import { renderCtaBand } from "./render/ctaBand";
import { buildFeaturedList, renderFeaturedCarousel } from "./render/featured";
import { renderFilterBar } from "./render/filterBar";
import { renderFooter } from "./render/footer";
import { renderGroupToggle, type GroupBy } from "./render/groupToggle";
import { renderHeader } from "./render/header";
import { mountLayout } from "./render/layout";
import { renderMonthSection } from "./render/monthGroup";
import { renderMonthNavRail } from "./render/monthNav";
import { createInitialState } from "./state/appState";
import { startCarousel } from "./state/carousel";
import { applyStoredConsent } from "./state/consent";
import { matchesFilters } from "./state/filters";
import { buildMonthBuckets, buildYearNav } from "./state/monthBuckets";
import { keepScroll } from "./state/scroll";

applyStoredConsent();
mountConsentBanner();

const allEvents = loadAllEnrichedEvents();
const state = createInitialState();

const today = new Date();
today.setHours(0, 0, 0, 0);
function todayIso(): string {
  return today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
}

let featuredCount = 0;

function render(): void {
  main.replaceChildren();

  const filtered = allEvents.filter((e) => matchesFilters(e, state.filters));
  const upcoming = filtered.filter((e) => e.date >= todayIso()).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Featured carousel
  const featuredList = buildFeaturedList(upcoming);
  featuredCount = featuredList.length;
  const featured = renderFeaturedCarousel(featuredList, state.carousel, {
    onPrev: () => {
      state.carousel -= 1;
      render();
    },
    onNext: () => {
      state.carousel += 1;
      render();
    },
    onSelect: (index) => {
      state.carousel = index;
      render();
    },
  });
  if (featured) main.appendChild(featured);

  // Filter bar
  main.appendChild(
    renderFilterBar(allEvents, upcoming.length, state.filters, (next) => {
      state.filters = next;
      render();
    }),
  );

  // Group-by toggle
  main.appendChild(
    renderGroupToggle(state.groupBy, (next: GroupBy) => {
      state.groupBy = next;
      render();
    }),
  );

  if (state.groupBy === "data") {
    const buckets = buildMonthBuckets(filtered, today, state.openPast);
    const visibleBuckets = buckets.filter((b) => (!b.isPast || b.opened) && b.list.length > 0);
    const yearNav = buildYearNav(buckets, state.collapsedYears, today);

    const row = document.createElement("div");
    row.className = "flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:gap-0";

    const monthList = document.createElement("div");
    monthList.className = "flex min-w-0 flex-1 flex-col";
    for (const bucket of visibleBuckets) {
      monthList.appendChild(renderMonthSection(bucket, today));
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
        keepScroll(() => {
          state.openPast = new Set(state.openPast).add(key);
          render();
        });
      },
      onLoadYear: (year) => {
        const group = yearNav.find((g) => g.year === year);
        if (!group) return;
        keepScroll(() => {
          const next = new Set(state.openPast);
          for (const key of group.lockedKeys) next.add(key);
          state.openPast = next;
          render();
        });
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
  } else {
    const tally = buildCommunityTally(filtered);
    const shelves = buildShelves(tally, upcoming);
    main.appendChild(renderCommunityShelves(shelves, today));
  }
}

const header = renderHeader({
  active: "eventos",
  onNavCommunities: () => {
    state.groupBy = "comunidade";
    render();
  },
});

const { shell, main } = mountLayout(header);
shell.append(renderCtaBand(), renderFooter());

render();

startCarousel(
  () => featuredCount,
  () => {
    state.carousel += 1;
    render();
  },
);
