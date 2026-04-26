# Tasks: UI Overhaul (Modern SaaS)

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Modify `apps/web/app/globals.css` to define the dark mode color palette (deep blacks, slate grays, neon accents) within the `@theme` block.
- [x] 1.2 Modify `apps/web/app/globals.css` to establish the global dark mode background, WCAG contrast colors, and base transition utilities.
- [x] 1.3 Modify `apps/web/app/layout.tsx` to apply subtle glowing borders and the minimalist structure styling to the root mobile container.

## Phase 2: Core Implementation (Presentational Components)

- [x] 2.1 Modify `apps/web/components/ui/ZenButton.tsx` to add glowing shadow utilities on hover and `transition-all duration-300` for smooth scaling.
- [x] 2.2 Modify `apps/web/components/ui/BentoCard.tsx` to introduce neon hover borders and modern dark surface colors.
- [x] 2.3 Modify `apps/web/components/ui/StudyCard.tsx` to refine typography, spacing, and dark interactive state aesthetics.
- [x] 2.4 Modify `apps/web/components/ui/AppHeader.tsx` to align spacing and visual hierarchy with the minimalist layout.

## Phase 3: Testing / Verification

- [x] 3.1 Verify initial load renders dark mode palette with WCAG contrast (Spec: Initial application load).
- [x] 3.2 Verify hover/focus on `ZenButton`, `BentoCard`, and `StudyCard` triggers glowing edges (Spec: User interaction with elements).
- [x] 3.3 Verify interactive state changes animate smoothly (Spec: UI state updates).
- [x] 3.4 Verify zero modifications were made to container logic/fetching components like `DashboardClient.tsx` (Spec: Container-Presentational Strictness).
