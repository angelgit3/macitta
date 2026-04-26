# Design: UI Overhaul (Modern SaaS)

## Technical Approach

We will modernize the visual design of the application by leveraging Tailwind CSS v4's CSS-based configuration. We will update `globals.css` to define a "Modern SaaS" dark mode color palette (deep blacks, slate grays, and neon accents) using the `@theme` directive. Following this, we will systematically update the presentational components in `apps/web/components/ui/` to incorporate minimalist aesthetics, glowing hover effects, and smooth transitions, while strictly avoiding any modifications to business logic or container components.

## Architecture Decisions

### Decision: Theming implementation in Tailwind v4

**Choice**: Define custom theme properties and colors within the `@theme` block in `globals.css`.
**Alternatives considered**: Using CSS-in-JS or retaining legacy JS-based Tailwind configuration.
**Rationale**: Tailwind CSS v4 has shifted to CSS-based configuration. Using `@theme` in `globals.css` is the idiomatic, performant way to manage design tokens in this version and reduces JS configuration overhead.

### Decision: Implementing Glowing Edges and Accents

**Choice**: Utilize Tailwind's built-in `shadow` utilities combined with alpha opacity on accent colors (e.g., `shadow-accent-focus/50` or `shadow-[0_0_15px_rgba(...)]`) for hover and focus states, alongside `transition-all duration-300`.
**Alternatives considered**: Writing custom CSS keyframe animations for border pulsing.
**Rationale**: Leveraging Tailwind utility classes keeps the styling directly within the components, making it easier to maintain and reducing custom CSS bloat.

### Decision: Strict Container-Presentational Separation

**Choice**: Confine all layout and styling changes to pure presentational components (in `components/ui/`) and global CSS, completely avoiding files like `DashboardClient.tsx`.
**Alternatives considered**: Adjusting layout structures directly within container or page components for convenience.
**Rationale**: Ensuring zero logic regressions is a core requirement. Isolating changes strictly to the UI layer guarantees that data fetching, state management, and business logic remain unaffected.

## Data Flow

This change is purely presentational. Data flow remains completely unchanged.

    [Data / Props] ──→ [Presentational Component] ──→ [Rendered DOM with New Styles]

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/app/globals.css` | Modify | Update `@theme` block with new modern SaaS colors, define base transition utilities, and establish the global dark mode foundation. |
| `apps/web/components/ui/ZenButton.tsx` | Modify | Add glowing shadow utilities on hover, refine minimalistic borders, and apply smooth scaling/color transitions. |
| `apps/web/components/ui/BentoCard.tsx` | Modify | Introduce subtle neon hover borders, modern surface colors, and smooth transition properties. |
| `apps/web/components/ui/StudyCard.tsx` | Modify | Refine typography, spacing, and interactive state aesthetics. |
| `apps/web/components/ui/AppHeader.tsx` | Modify | Adjust spacing and visual hierarchy to match the new minimalist layout. |
| `apps/web/app/layout.tsx` | Modify | Enhance the root mobile container's styling (e.g., subtle glowing border on the main element) without changing its constraints. |

## Interfaces / Contracts

No changes to existing TypeScript interfaces, props, or API contracts. Components will accept their current props and only change their internal `className` strings.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual | Components render with new styles | Manual visual inspection in dev mode across all major views (Dashboard, Study). |
| Unit / E2E | Core flows remain functional | Manual smoke testing to ensure interactions (clicks, form submissions) are not obstructed by z-index or layout issues. |

## Migration / Rollout

No data migration required. Rollout involves a standard deployment of the updated static frontend assets. If visual regressions occur, we will rollback the commit affecting the UI layer.

## Open Questions

- None
