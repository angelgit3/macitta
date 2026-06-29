# Design: Estudio Lúmico

## Direction

Macitta should feel like a dependable study instrument used by a student at a desk, on a phone or laptop, often at night and sometimes with unreliable connectivity. The product is calm, compact and readable. Visual character comes from its indigo-black workspace and precise periwinkle accent, not from decorative effects.

## Color tokens

| Role | Token | Value | Use |
|---|---|---:|---|
| Background | `--color-void` | `#0D0E17` | Page background |
| Surface | `--color-surface` | `#1A1B2E` | Primary product surface |
| Raised | `--color-surface-raised` | `#21233A` | Controls and navigation |
| Accent | `--color-accent` | `#7C85E8` | Primary action, selection and focus |
| Accent hover | `--color-accent-hover` | `#9AA2F0` | Primary hover |
| Amber | `--color-amber` | `#E8B84B` | Listening and secondary emphasis |
| Success | `--color-success` | `#6BCB8E` | Correct and synchronized states |
| Danger | `--color-danger` | `#E07070` | Errors and destructive action |
| Text | `--color-ink` | `#F0F1FF` | Primary text |
| Muted text | `--color-ink-muted` | `#A0A3C4` | Secondary copy |
| Metadata | `--color-ink-faint` | `#888CB2` | Labels and placeholders |

## Surface hierarchy

- `product-panel`: default authenticated product container. Opaque, quiet and suitable for long tasks.
- `glass-panel`: reserved for marketing, authentication shells and the floating dock.
- `glass-card`: legacy/shared treatment. Do not use it as the default answer to every grouping problem.
- Bordered rows and dividers: preferred for lists of exams, attempts and next actions.

Avoid nesting one card inside another. A surface may contain rows, controls or a single inset status block.

## Typography

Use the system stack for speed, language coverage and predictable metrics. Product headings use weight and spacing rather than a separate display font.

- Page title: 30 to 36 px, `font-black`, balanced wrapping.
- Section title: 18 to 20 px, `font-black`.
- Body: 14 to 16 px with 24 to 28 px line height.
- `section-label`: 12 px sentence case for context.
- `label-kicker`: legacy form metadata only. Do not place it above every section.

Body copy should remain under 75 characters per line when it is prose.

## Components and interaction

- Buttons and inputs have a minimum 44 px touch target.
- Primary buttons are solid periwinkle with dark text and a 12 px radius.
- Secondary buttons use a visible border and restrained surface fill.
- Focus uses the shared periwinkle ring and remains visible for keyboard users.
- Loading content uses skeleton structure when the destination layout is known.
- Empty states explain the next useful action.
- Error states include a recovery path whenever possible.

## Layout

Authenticated routes use a centered shell up to `max-w-6xl`, content up to `max-w-5xl` and a persistent bottom dock. Mobile layouts stack by task order. Desktop columns are only used when the secondary column remains useful rather than decorative.

## Motion

Transitions last 150 to 250 ms and communicate state. Hover translation is limited to interactive rows and buttons. Page-load choreography is not used inside the product. `prefers-reduced-motion` is respected globally.

## Product rules

- The next study action is visually dominant on the dashboard.
- TOEFL is organized by learning section and history, not a wall of equal cards.
- Network and sync labels must reflect real state.
- Accent color marks action or selection, not decoration.
- Do not use gradient text, decorative glass grids or repeated uppercase eyebrows.
