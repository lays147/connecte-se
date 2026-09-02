import type { EnrichedEvent } from "../types";
import { initialsOf, renderCard } from "./card";

const PALETTE = [
  { text: "text-brand-700", bg: "bg-brand-100" },
  { text: "text-accent-blue-700", bg: "bg-accent-blue-50" },
  { text: "text-accent-teal-700", bg: "bg-accent-teal-50" },
  { text: "text-accent-coral-700", bg: "bg-accent-coral-50" },
];

export interface CommunityShelf {
  name: string;
  count: number;
  initials: string;
  text: string;
  bg: string;
  followUrl: string | null;
  events: EnrichedEvent[];
}

export function buildCommunityTally(filteredEvents: EnrichedEvent[]): Map<string, number> {
  const tally = new Map<string, number>();
  for (const e of filteredEvents) {
    if (!e.community) continue;
    tally.set(e.community, (tally.get(e.community) ?? 0) + 1);
  }
  return tally;
}

export function buildShelves(tally: Map<string, number>, upcoming: EnrichedEvent[]): CommunityShelf[] {
  const names = [...tally.keys()].sort((a, b) => (tally.get(b) ?? 0) - (tally.get(a) ?? 0)).slice(0, 6);

  const shelves = names.slice(0, 4).map((name, i) => {
    const events = upcoming.filter((e) => e.community === name).slice(0, 3);
    const palette = PALETTE[i % PALETTE.length];
    return {
      name,
      count: tally.get(name) ?? 0,
      initials: initialsOf(name),
      text: palette.text,
      bg: palette.bg,
      followUrl: events[0]?.url ?? null,
      events,
    };
  });

  return shelves.filter((s) => s.events.length > 0);
}

export function renderCommunityShelves(shelves: CommunityShelf[], today: Date): HTMLElement {
  const container = document.createElement("div");
  container.className = "flex flex-col";

  for (const shelf of shelves) {
    const row = document.createElement("div");
    row.className = "flex flex-col gap-3.5 border-b border-brand-100 px-(--spacing-gutter) py-5";

    const header = document.createElement("div");
    header.className = "flex items-center gap-2.5";

    const avatar = document.createElement("span");
    avatar.className = `inline-flex size-7.5 items-center justify-center rounded-card-9 font-display text-xs font-semibold ${shelf.bg} ${shelf.text}`;
    avatar.textContent = shelf.initials;

    const name = document.createElement("h2");
    name.className = "min-w-0 flex-1 truncate font-display text-base font-semibold text-brand-950";
    name.textContent = shelf.name;

    const count = document.createElement("span");
    count.className = "font-mono-label text-label-sm text-brand-500";
    count.textContent = shelf.count + (shelf.count === 1 ? " evento" : " eventos");

    header.append(avatar, name, count);

    const spacer = document.createElement("span");
    spacer.className = "flex-1";
    header.appendChild(spacer);

    if (shelf.followUrl) {
      const follow = document.createElement("a");
      follow.href = shelf.followUrl;
      follow.target = "_blank";
      follow.rel = "noopener";
      follow.className = "text-xs font-semibold text-brand-700";
      follow.textContent = "Seguir comunidade";
      header.appendChild(follow);
    }

    row.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
    for (const event of shelf.events) {
      grid.appendChild(renderCard(event, today));
    }
    row.appendChild(grid);

    container.appendChild(row);
  }

  return container;
}
