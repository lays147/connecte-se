---
name: Conecte-se Brasil
description: Best-effort national index of Brazilian tech events, communities, and content
colors:
  brand-50: "#f5f2fd"
  brand-100: "#ebe4fb"
  brand-200: "#d4c5f7"
  brand-300: "#b69cf1"
  brand-400: "#8e67ea"
  brand-500: "#6d3ae4"
  brand-600: "#591fe0"
  brand-700: "#501cca"
  brand-800: "#4016a1"
  brand-900: "#32117d"
  brand-950: "#1e0b4c"
  accent-blue-50: "oklch(0.96 0.02 255)"
  accent-blue-700: "oklch(0.5 0.16 255)"
  accent-teal-50: "oklch(0.96 0.02 195)"
  accent-teal-700: "oklch(0.5 0.12 195)"
  accent-coral-50: "oklch(0.96 0.02 25)"
  accent-coral-700: "oklch(0.55 0.16 25)"
  neutral-50: "oklch(0.96 0.005 292)"
  neutral-700: "oklch(0.45 0.02 292)"
  price-paid-bg: "oklch(0.95 0.04 75)"
  price-paid-text: "oklch(0.45 0.1 60)"
  price-free-bg: "oklch(0.94 0.05 160)"
  price-free-text: "oklch(0.44 0.1 160)"
  modality-online-bg: "oklch(0.85 0.15 155)"
  modality-presencial-bg: "oklch(0.86 0.13 85)"
  page: "#f2f0f7"
  map-empty: "#faf9fd"
  map-scale-start: "#ddd2fa"
  map-scale-end: "#28095e"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  sm: "4px"
  card-7: "7px"
  card-10: "10px"
  card-11: "11px"
  lg: "8px"
  full: "9999px"
  card-2xl: "16px"
spacing:
  gutter: "clamp(24px, 4vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.brand-700}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.brand-600}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.brand-700}"
    rounded: "{rounded.card-10}"
    padding: "12px 16px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.card-2xl}"
    padding: "16px"
  chip-price:
    rounded: "{rounded.full}"
    padding: "4px 8px"
---

# Design System: Conecte-se Brasil

## Overview

**Creative North Star: "The Signal Board"**

Conecte-se Brasil reads like a confident, information-dense departures board for Brazilian tech culture, not a marketing site. Deep, saturated purple is the signal color — the one thing the eye is always drawn to first, on the hero band, the CTA buttons, the primary nav state. Uppercase monospace labels behave like ticker language: event types, taxonomy tags, "MESES," "CANAIS," section counters — small, spaced-out, always doing classification work rather than decoration. Flat colored strips along the top edge of every card are the at-a-glance category-coding device, the same move a schedule board makes with colored route lines.

The system deliberately avoids the generic "friendly SaaS" look: no soft pastel gradients, no rounded blob illustrations, no oversized decorative whitespace. Density is a feature — the job is helping someone scan dozens of real events fast, so padding stays tight and the type scale stays compact, but the bold display face and the strong purple keep it from reading as merely utilitarian. It has a voice; that voice is just economical with its space.

**Key Characteristics:**
- Deep, confident electric purple (`brand-700`/`brand-950`) as the one true signal color; every other hue is functional taxonomy, never decorative.
- Uppercase, letter-spaced monospace labels for anything classificatory (type tags, section counters, badges).
- Flat colored top-strips on cards as the category-coding device, echoed by the type-family accent colors (blue/teal/coral).
- Dense, compact component padding — built for scanning volume, not for luxurious breathing room.
- Flat at rest almost everywhere; elevation is reserved for the event modal and the active state of the group toggle.

## Colors

The palette pairs one confident, saturated purple family against a narrow, strictly functional set of accent hues — nothing in the system uses color purely for atmosphere.

### Primary
- **Signal Purple** (`brand-700` #501cca / `brand-500` #6d3ae4): the CTA color — primary buttons ("Inscrever-se", "Enviar um evento"), the active nav pill, the map's darkest choropleth step, the hero band background (`brand-950` #1e0b4c). This is the one color allowed to command attention.

### Secondary (event-type accent family)
- **Signal Blue** (`accent-blue-700` oklch(0.5 0.16 255) / `accent-blue-50` bg): tags Conferência, Congresso, Summit.
- **Signal Teal** (`accent-teal-700` oklch(0.5 0.12 195) / `accent-teal-50` bg): tags Workshop.
- **Signal Coral** (`accent-coral-700` oklch(0.55 0.16 25) / `accent-coral-50` bg): tags Community Day, Festival.

Each is used exactly the same way: a text/dot color plus a matching pale background for the type label, the card's top strip, and the avatar chip — never applied outside that taxonomy role.

### Neutral
- **Ink Purple** (`brand-950` #1e0b4c): primary text, footer background.
- **Slate Purple** (`brand-500`/`brand-700`): secondary text, borders on hover.
- **Hairline Purple** (`brand-100` #ebe4fb): default borders, dividers, subtle section backgrounds (`bg-brand-50/30`, `bg-brand-50/40`).
- **Page Wash** (`page` #f2f0f7): the map and content pages' body background, distinct from pure white cards.

### Semantic status colors
- **Paid** (`price-paid-bg`/`price-paid-text`, warm amber-oklch): the "Pago" pill.
- **Free** (`price-free-bg`/`price-free-text`, green-oklch): the "Gratuito" pill.
- **Online / Presencial modality** (`modality-online-bg` green, `modality-presencial-bg` amber): map legend and filters.

### Named Rules
**The One Signal Rule.** Purple is the only color allowed to mean "act on this" (primary buttons, active nav, active toggle). The accent family (blue/teal/coral) may only classify, never call to action.

## Typography

**Display Font:** Space Grotesk (with system-ui, sans-serif fallback)
**Body Font:** IBM Plex Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace fallback)

**Character:** A geometric, slightly technical display face paired with a humanist, highly legible body face, plus a monospace face reserved entirely for classificatory micro-text — the pairing itself signals "data product," not "blog."

### Hierarchy
- **Display** (700, `text-heading-2xl`–`text-heading-3xl` / 28–38px, tight leading): page H1s ("As conexões que você faz..."), hero titles.
- **Headline** (600–700, `text-heading-lg`–`text-heading-xl` / 22–25px): modal titles, CTA band headings.
- **Title** (600, `text-heading-sm`–`text-heading-md` / 17–19px, snug leading): card titles, month-section labels.
- **Body** (400–500, `text-body-sm`–`text-body-md` / 13–15px, relaxed leading): descriptions, nav links, footer copy.
- **Label** (600, `text-label-2xs`–`text-label-sm` / 9–11px, `tracking-widest`, uppercase, mono): event-type tags, section eyebrows ("MESES", "PROJETO"), badges, dates rendered in mono ("qua, 2 set · 19:00").

### Named Rules
**The Mono-Means-Metadata Rule.** IBM Plex Mono is reserved exclusively for classificatory or timestamp text (type tags, counts, dates/times, section eyebrows). It never appears in a sentence of prose.

## Layout

The site is a fixed-max-width-free, edge-to-edge layout: every major section uses a shared horizontal gutter token (`--spacing-gutter`, `clamp(24px, 4vw, 64px)`) rather than a centered container with a hard max-width, so content runs full-bleed with responsive breathing room at the edges. Vertical rhythm is section-based: header → hero/featured carousel → filter bar → group toggle → month sections, each separated by a `border-brand-100` hairline rather than large empty gaps.

Event cards lay out on a responsive grid — 1 column on mobile, 2 on `sm`, 3 on `lg` — with a consistent 16px (`gap-4`) gutter. The map page splits into a map column and a fixed-width stats/ranking sidebar on desktop, collapsing to a stacked layout on mobile. Density is consistent across all three pages: compact card padding (16px), tight label spacing, and small type sizes throughout, prioritizing how much real content is visible per screen.

## Elevation & Depth

The system is flat almost everywhere: cards, headers, filter bars, and footers use border hairlines (`border-brand-100`) rather than shadows to separate surfaces. There are two narrow exceptions: the event detail modal, which uses a real drop shadow (`shadow-xl`) because it is the one surface that leaves the page's flow, and the active state of the "Agrupar por" grouping toggle, which gets a small `shadow-sm` to read as physically pressed/selected against its pill-shaped track.

### Shadow Vocabulary
- **Modal elevation** (`box-shadow` via Tailwind `shadow-xl`): the event detail dialog only.
- **Active-toggle elevation** (`box-shadow` via Tailwind `shadow-sm`): the selected segment of the group-by toggle only.

## Shapes

Corner radius scales with a surface's size and role rather than following one fixed value. Small interactive chips and pills (price badges, "Copiar" button) are fully rounded (`rounded-full`). Buttons and form controls use a moderate radius (`rounded-lg`, 8px). Cards, the event modal, and larger containers step up through a dedicated `--radius-card-*` scale (7px avatars, 10–11px CTA-band buttons and pix box, 16px/`rounded-2xl` cards and modal). Borders are hairline-weight (`border`, 1px) and always `brand-100` or `brand-200`, never a heavier stroke. There is no clipping/masking beyond standard `overflow-hidden` on cards and the modal.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px) for compact CTAs, `rounded-card-10`/`rounded-card-11` (10–11px) for the larger CTA-band buttons.
- **Primary:** `bg-brand-700` background, white text, semibold, compact padding (`px-3.5 py-2` to `px-4 py-3` depending on context). Used for "Inscrever-se" and the primary GitHub-submit CTAs.
- **Hover:** background steps one shade lighter (`bg-brand-600`), no scale/shadow change — a flat color transition (`transition-colors`).
- **Secondary / Ghost:** white background with a `border-brand-200` outline (hover: `border-brand-400`), or fully transparent nav-style buttons with a `hover:bg-brand-50` tint.

### Chips / Badges
- **Type label:** uppercase mono text in the accent family's `-700` color, no background — pure text classification.
- **Price pill:** `rounded-full`, pale `-bg` + `-text` pair (paid = amber, free = green), tiny padding (`px-2 py-1`).
- **"Mês encerrado" badge:** outlined pill, `border-brand-100`, uppercase mono label.

### Cards / Containers
- **Corner Style:** `rounded-2xl` (16px).
- **Background:** white, with a colored top strip (`h-0.75`, the type's accent color) as the only decoration.
- **Shadow Strategy:** none at rest; see Elevation & Depth — cards rely on `border-brand-200` plus a `hover:border-brand-400` state instead of shadow for interactivity feedback.
- **Border:** 1px `border-brand-200`.
- **Internal Padding:** 16px (`p-4`), `gap-2.5` between internal rows.

### Inputs / Fields (filter selects, search)
- **Style:** `border-brand-200`, white background, `rounded-lg`, compact padding (`px-3 py-2.5`).
- **Focus/Hover:** cursor-pointer affordance; no custom focus ring beyond the browser default is currently implemented.

### Navigation
- **Style:** flat text links in `brand-500`, semibold when active with a `bg-brand-50` pill background; `hover:bg-brand-50` tint on inactive items. Mono uppercase tagline sits under the wordmark. Mobile: nav wraps (`flex-wrap`) rather than collapsing into a drawer.

### Group Toggle (signature component)
A segmented-control pattern used for "Agrupar por" (Data / Por comunidade): a pill-shaped track (`bg-brand-100/60`, `rounded-card-10`) containing two buttons, where the active segment gets a white background plus `shadow-sm` to read as physically raised against the tinted track — the system's only other elevation use besides the modal.

## Do's and Don'ts

### Do:
- **Do** keep purple (`brand-700`/`brand-950`) as the only color that means "primary action" or "active state" — everything else classifies, never commands.
- **Do** render any classificatory, timestamp, or eyebrow text in uppercase IBM Plex Mono with wide tracking (`tracking-widest`).
- **Do** keep cards and containers flat at rest, using `border-brand-200`/`border-brand-100` hairlines and a `hover:border-brand-400` state instead of introducing shadows.
- **Do** keep padding and type scale compact; density is the point, not a compromise.

### Don't:
- **Don't** introduce soft pastel gradients, rounded blob illustrations, or other generic "friendly SaaS" landing-page motifs — the confirmed anti-reference for this system.
- **Don't** add drop shadows to cards, nav, or buttons at rest; shadow is reserved for the modal and the active group-toggle segment only.
- **Don't** use the accent family (blue/teal/coral) for anything other than event-type classification — they must never appear as a CTA or an active-state color.
- **Don't** center content in a fixed-max-width container; use the shared `--spacing-gutter` full-bleed pattern instead.
