# Design — Estudio Lúmico

## Theme

Macitta uses the **"Estudio Lúmico"** design language: deep indigo-black as the principal background, luminous periwinkle as the action accent, warm amber as the secondary highlight for streaks and achievements, and sage green for success states. The overall feel is a premium study instrument — glassy, calm, and precise.

## Color Tokens

| Role              | Token                         | Value                      | Use |
|---|---|---:|---|
| Background        | `--color-void`                | `#0D0E17`                  | App background |
| Surface           | `--color-surface`             | `#1A1B2E`                  | Glass panels |
| Surface Raised    | `--color-surface-raised`      | `#21233A`                  | Cards, dock |
| Surface Float     | `--color-surface-float`       | `#262845`                  | Hover overlays |
| Accent (primary)  | `--color-accent`              | `#7C85E8`                  | Buttons, active states, focus |
| Accent Hover      | `--color-accent-hover`        | `#9AA2F0`                  | Button hover |
| Amber             | `--color-amber`               | `#E8B84B`                  | Streaks, warnings, secondary highlights |
| Success           | `--color-success`             | `#6BCB8E`                  | Correct answers, sync confirmed |
| Danger            | `--color-danger`              | `#E07070`                  | Errors, incorrect answers |
| Text Primary      | `--color-ink`                 | `#F0F1FF`                  | Headings, body text |
| Text Muted        | `--color-ink-muted`           | `#A0A3C4`                  | Secondary copy, descriptions |
| Text Faint        | `--color-ink-faint`           | `#62658A`                  | Labels, metadata, placeholders |
| Border            | `--color-border`              | `rgba(160,163,196,0.13)`   | Card borders, dividers |
| Border Strong     | `--color-border-strong`       | `rgba(160,163,196,0.22)`   | Hover borders |

## Component Classes

- `glass-panel`: Primary grouped panels — auth shells, hero sections, study card outer frame.
- `glass-card`: Repeated actionable items — bento stats, deck items, feature tiles.
- `pill-badge`: Inline category labels and status indicators (`rounded-full px-3 py-1 text-[11px]`).
- `label-kicker`: Uppercase micro-label above fields and values.
- `soft-field`: Form inputs with animated focus ring.
- `ZenButton`: Pill-shaped (`rounded-full`), periwinkle primary; ghost and danger variants.
- `ZenDock`: Floating glass pill navigation with spring-physics active indicator.

## Double-Bezel Technique

Cards and the StudyCard use a two-layer nested structure:
- **Outer shell**: `p-[2px] rounded-[1.8rem] bg-gradient-to-b from-white/12 via-white/4 to-white/0`
- **Inner core**: `glass-panel rounded-[1.6rem]` with `box-shadow` inset highlight

This gives surfaces a physical, machined quality — as if the content sits behind glass.

## Typography

System font stack for reliability. Headings use `font-black` with `tracking-tight`. Body copy stays at `text-sm leading-7`. Labels use `label-kicker` (10px, uppercase, wide tracking).

## Layout

Internal routes: centered responsive shell, max-w-6xl, bottom dock with padding `pb-28`. Marketing: full viewport, floating pill nav, macro-whitespace between sections.

## Motion

Spring physics: `cubic-bezier(0.22, 1, 0.36, 1)`, 200–300ms. Active states scale to `0.97`. Hover lift: `translateY(-1px)`. Reduced-motion respected globally.

## Anti-patterns

No amber/cognac as the primary brand color. No flat solid buttons. No heavy drop shadows on dark. No border-radius < 12px on interactive elements. No neon SaaS dashboards. No decorative orbs or gradient text (except the hero headline gradient).
