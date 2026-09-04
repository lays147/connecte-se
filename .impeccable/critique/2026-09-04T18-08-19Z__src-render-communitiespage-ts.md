---
target: Comunidades directory page (src/render/communitiesPage.ts)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 1
target_identity: "file:/home/lays/github/tech-brazil/src/render/communitiesPage.ts"
target_fingerprint: "sha256:fe41ba5cbe47436c98a8357839216c5745b49078b369f25ff9d59331f159f148"
target_path: /home/lays/github/tech-brazil/src/render/communitiesPage.ts
timestamp: 2026-09-04T18-08-19Z
slug: src-render-communitiespage-ts
---
Method: dual-agent (A: a2c6bb3ad39698f91 · B: aad3d767a155d7f69)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live result count updates instantly; static data needs no loading state |
| 2 | Match Between System / Real World | 3 | "Eventos recorrentes" reads correctly in pt-BR; "Diretório de fontes" eyebrow is more internal/backend-sounding than the friendlier "Guia de curadoria" on the sibling Conteúdos page |
| 3 | User Control and Freedom | 3 | Search + type filter round-trip through URL params (shareable, back/forward works) — no in-input clear (×) |
| 4 | Consistency and Standards | 2 | Consistent with contentPage.ts's hero/filter/CTA skeleton, but breaks from card.ts's signature top-strip card language; also the only page of the three missing an h2 in its structure |
| 5 | Error Prevention | 3 | Read-only surface, debounced search; empty state exists but its suggested recovery isn't wired to a control |
| 6 | Recognition Rather Than Recall | 2 | 107 flat, alphabetically-sorted items with a 24-entry "AWS User Group" cluster sharing identical avatar/tags/host — pure recall burden |
| 7 | Flexibility and Efficiency of Use | 1 | One lever only (type-to-filter); no sort alternative, no jump-to-letter, no keyboard shortcut to focus search |
| 8 | Aesthetic and Minimalist Design | 3 | Card content itself is appropriately terse; the AWS cluster's sameness reads as monotony rather than clarity |
| 9 | Error Recovery | 3 | Clear empty-state message, but "limpe a busca" is prose, not a clickable action |
| 10 | Help and Documentation | 2 | No inline explainer distinguishing "Comunidade" vs "Evento recorrente" for a first-timer |
| **Total** | | **26/40** | **Acceptable — solid foundation, real gaps before it should be called finished** |

## Design Specificity Verdict

**LLM assessment**: Partially authored, partially generic. Typography, hairline borders, and the single-purple-CTA discipline are correctly inherited. But the page's card component drops the one thing that makes this system recognizable elsewhere — the flat colored top-strip category-coding device used on every home-page event card (card.ts:82-84). Without it, renderSourceCard (communitiesPage.ts:52-97) is a small-avatar-plus-tag card that could belong to any generic B2B directory template. Token-compliant, but not authored.

**Deterministic scan**: The CLI detector ran in degraded mode (missing htmlparser2/css-select in the plugin's own node_modules — an environment issue, not a code issue) and returned no usable static findings. The browser-injected detector did run successfully on all three pages:

- comunidades.html: 223 anti-patterns vs home's 202 and conteudos's 79 (raw counts scale with card count, not necessarily severity).
- Two findings specific to this page, not shared by conteudos.html:
  - skipped-heading — H1 to H3 with no H2 anywhere on the page (communitiesPage.ts:126 vs :223). contentPage.ts avoids this via section h2s, which don't exist here because the page has no sections. This is the structural fingerprint of the P0 chunking finding.
  - text-overflow (x3) on communitiesPage.ts:71, the truncated name span — likely false positive since the span has Tailwind's `truncate` applied (expected pre-ellipsis overflow, not a bug).
  - nested-cards (x1) — worth a quick visual check.
- Shared, pre-existing site-wide patterns (not introduced by this feature): undersized-ui-text (9-10px mono tags, same classes as contentPage.ts), overused-font (Space Grotesk, already an accepted site-wide brand choice), kicker-above-heading (identical hero pattern on both sibling pages), line-length.

**Visual overlays**: No overlay persisted into the live session — Assessment B ran its own isolated tab/injection and reported console output directly.

## Overall Impression

The page is functionally solid and better-engineered than average — URL-synced filters, working search, clean empty state, no console errors, no responsive overflow at 390px. But it was built as "a directory," not as this product's directory: it borrows Conteúdos' skeleton (hero/filter/CTA) without borrowing its most important structural idea (sectioning), and borrows nothing from the home page's card identity (the top-strip). The single biggest, cheapest fix: group the 107 items by type with labeled h2 sub-sections, the way contentPage.ts already proves works at smaller scale.

## What's Working

1. URL-synced filter state (comunidades.ts:18-33) — search and type filter both round-trip through query params. Shareable, bookmarkable, back/forward-safe.
2. Disciplined color usage — the accent-blue "Evento recorrente" tag never bleeds into CTA territory; the One Signal Rule holds throughout. Zero console errors, zero contrast violations flagged during interaction.
3. Honest hero copy — "mesmo os que não têm um próximo encontro anunciado agora" directly states what makes this page different from the old grouping, in plain pt-BR.

## Priority Issues

**[P0] No chunking/sectioning for 107 flat items**
Why it matters: the sibling conteudos.html already sections 29 items into labeled groups with per-section counts; communitiesPage.ts dumps 107 into one undifferentiated grid. Confirmed by both the LLM cognitive-load checklist (chunking/grouping/working-memory all fail) and the detector (skipped-heading — no h2 exists because there are no sections).
Fix: Default-group by type (Comunidades / Eventos recorrentes) with sticky h2 sub-headers and counts, matching contentPage.ts:247-286's pattern exactly.
Suggested command: /impeccable layout

**[P0] Signature top-strip category-coding missing from the card**
Why it matters: named explicitly in DESIGN.md as the system's category-coding device, present on every home-page card (card.ts:82-84), absent here — the concrete reason the design-specificity verdict landed on "generic directory template."
Fix: Add a h-0.75 top strip to renderSourceCard, colored by source.type (purple for community, accent-blue for event).
Suggested command: /impeccable typeset

**[P1] Card focus state falls back to the unstyled browser default**
Why it matters: all 107 result-card anchors get bare outline:auto on focus while the search box and filter tabs get the branded ring-2 ring-brand-400. The primary interactive surface is the one component not using the system's own focus treatment.
Fix: Add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 to the card anchor's className in renderSourceCard.
Suggested command: /impeccable audit

**[P2] "AWS User Group" cluster (24 of 107 entries, 22%) has zero visual disambiguation**
Why it matters: identical avatar initials, type tag, frequency tag, and host domain, differing only in a truncated trailing city name — a pure working-memory tax with no visual anchor, worse on mobile.
Fix: Give the city/differentiator stronger visual weight than the shared prefix, or fold same-organization chapters into one card with a city-chip list.
Suggested command: /impeccable layout

**[P3] Empty state's suggested recovery isn't clickable**
Why it matters: "Tente outro termo ou limpe a busca" describes an action without providing it.
Fix: Make "limpe a busca" a real control that calls onChange({...state, query: "", type: "todos"}).
Suggested command: /impeccable clarify

## Persona Red Flags

**Sam (Accessibility-dependent)**: all 107 cards receive only the browser default focus outline instead of the branded ring used on every other interactive element on the same page.

**Alex (Power user)**: one lever only (type-to-filter text search); no sort alternative, no jump-to-letter, no keyboard shortcut to focus search. Flexibility/Efficiency scored 1/4, the lowest heuristic on the page.

**Casey (Mobile, 390px)**: layout holds up (zero horizontal overflow, clean 1-column stacking), but chunking problem compounds here — no 3-column break to create implicit rhythm, so 107 cards become one truly undifferentiated scroll.

## Minor Observations

- hostOf() and initialsOf() are each duplicated verbatim between communitiesList.ts/contentPage.ts and communitiesPage.ts/card.ts respectively.
- Static hero tallies (107/73/34) don't update when a filter is applied — consistent with contentPage.ts's identical behavior, not a regression, but still a minor mismatch once filtered.
- Tone drift: "Diretório de fontes" reads more backend/internal than "Guia de curadoria" on the sibling page.
- text-overflow and nested-cards detector hits are worth a 30-second visual sanity check but are likely non-issues.

## Questions to Consider

1. If this page's premise is "everything we track, including sources with no upcoming event," should a source with zero upcoming events carry the same visual weight as one running next week?
2. The home page's "group by community" toggle was removed in favor of this standalone directory, but the directory itself doesn't group by anything except alphabetical accident — was grouping a feature users relied on?
3. With 22% of entries being regional chapters of the same 3-4 organizations, does this data actually want a two-level model (organization → chapters) rather than 107 flat, equally-weighted cards?
