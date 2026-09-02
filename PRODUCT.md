# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Brazilian tech professionals (developers and other tech workers) looking to discover meetups, conferences, communities, and worthwhile content near them or in their field, in order to show up and grow their career. Community organizers and contributors are a secondary audience: they use the GitHub Actions-driven workflows (Add Source, Add Event) to submit and maintain listings, but the site's primary job is discovery for the person browsing to find something to attend or follow.

## Product Purpose

Conecte-se Brasil ("Connect Yourself Brazil") is a best-effort, national index of Brazilian tech events, communities, and worthwhile content. Its purpose, per the README, is to "compile, as best as possible, all the tech events in this large country called Brazil" and make the bridge between a person and an event that could change their career. Success means someone finds a relevant event or community they wouldn't otherwise have known about.

## Positioning

The completeness and the openness are the same claim, not two separate ones: the site is both the most complete national aggregation of Brazilian tech events and a community-maintained, open-contribution index. Anyone can propose a new source or event through a GitHub Actions workflow (Add Source / Add Event) that opens an automated PR, validated by a checking pipeline before merge. No single community's own listing, and no closed/curated directory, can make both claims at once — exhaustive coverage achieved specifically through open, low-friction, automated contribution.

## Operating Context

- Three static pages: the landing/events page (`index.html`), the map view (`mapa.html`), and the content library (`conteudos.html`).
- Event and community data is scraped on a best-effort basis from source URLs (`npm run scrape`, via `scripts/scrape-events.ts`) and stored in `sources/communities.yaml`, `sources/content.yaml`, and `src/data/events-<year>.json`.
- `sources/communities.yaml` must not contain time-bounded URLs (no year/month/date in the URL) — communities are recurring, not one-off.
- Contribution happens two ways: manually editing YAML/JSON, or via GitHub Actions workflows (Add Source, Add Event, Add Content) that open PRs automatically, gated by a PR-checks pipeline that validates URLs are live.
- Content is Portuguese (pt-BR) throughout.
- Deployed at connect.lays147.dev.br via a `deploy.yml` GitHub Actions workflow.

## Capabilities and Constraints

- Built with Vite + Tailwind CSS (v4, token-based theme in `src/style.css`).
- Data-driven rendering: TypeScript modules in `src/render/` (cards, month groups, filter bar, map page, content page, header/footer, modal, carousel, etc.) driven by state in `src/state/`.
- Map view uses D3 + TopoJSON (`br-uf-topo.json`) to render events by Brazilian state (UF).
- Events carry: title, region, type, modality, date, time, description, paid/free flag, and source URL; enriched with inferred community and city.
- Scraper fetches real event start times from source pages on a best-effort basis (not guessed from event type).
- Testing via Playwright (`e2e/`, `npm run test:e2e`).

## Brand Commitments

- Name: "Conecte-se Brasil."
- Established purple brand palette already in use (`--color-brand-50` through `--color-brand-950`, Tailwind v4 tokens in `src/style.css`), from a light lavender (#f5f2fd) to a deep indigo-violet (#1e0b4c).
- No logo or brand mark assets found in the repository at this time.

## Evidence on Hand

- Real, live event and community data sourced from `sources/communities.yaml`, `sources/content.yaml`, and `src/data/events-2026.json` / `events-2027.json` — not fabricated or placeholder content.
- No testimonials, case studies, or press mentions exist; none should be fabricated.

## Product Principles

1. Completeness is a mechanism, not a promise: coverage grows through open contribution (PRs, GitHub Actions workflows), not manual curation alone — the product should keep that path visible and low-friction.
2. Best-effort over false precision: data (event times, sources) is fetched on a best-effort basis; the product should not imply certainty it doesn't have.
3. No time-bound community links: community sources must stay evergreen (no year/month/day in the URL), since communities, unlike one-off events, are recurring destinations.
4. Discovery for the professional comes first: organizer/contributor tooling exists to serve the primary user's need to find something worth attending, not as an end in itself.
5. Portuguese-first: all user-facing content is pt-BR; this is a Brazil-specific product, not an internationalized one.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
