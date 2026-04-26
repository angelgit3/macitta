# Proposal: Onboarding Redesign (Layout Segregation & Premium SaaS Aesthetics)

## Intent

Currently, the `RootLayout` enforces a strict 480px max-width container designed for the mobile-first PWA experience. This inadvertently squishes the marketing and auth pages on desktop, preventing them from being full-width. This change aims to decouple the application layout from the marketing/auth layouts, allowing the landing and auth pages to be expansive, visually stunning, and full-width, while preserving the focused PWA feel for the core app.

## Scope

### In Scope
- Refactor `RootLayout` to act as a pure HTML/Body/Provider wrapper.
- Move the 480px mobile-first wrapper, borders, and fixed PWA backgrounds into a new `(app)/layout.tsx`.
- Rebuild the `(marketing)` layout and page to span full-width with premium SaaS aesthetics (glassmorphism, spotlight hover effects, animated entrances).
- Refactor the `auth` layout to present a centered auth card on a full-width premium background.
- Extract background effects (grid, glowing orbs) into a reusable `<BackgroundEffects />` component.

### Out of Scope
- Redesign of the internal `(app)` screens (they will retain their current mobile-first layout).
- Changes to the authentication logic or database schema.

## Capabilities

### New Capabilities
- `landing-page`: Requirements for the full-width marketing page, including premium SaaS aesthetics, glassmorphism, and animated entrances.
- `auth-ui`: Requirements for the authentication layout, focusing on a centered card approach over a full-width immersive background.

### Modified Capabilities
- `global-ui`: The layout strictness is changing. `RootLayout` no longer enforces the 480px container globally.

## Approach

Use Next.js Route Group Segregation. The `max-w-[480px]` constraint and absolute background elements will be moved from `RootLayout` into `(app)/layout.tsx`. The `(marketing)` and `auth` routes will implement their own layouts utilizing the full viewport. Premium SaaS aesthetic enhancements (glassmorphism, subtle animations, spotlight hover effects) will be applied to the marketing and auth pages.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/app/layout.tsx` | Modified | Stripped of layout constraints to become a pure global wrapper. |
| `apps/web/app/(app)/layout.tsx` | New | Will contain the `max-w-[480px]` mobile-first layout wrapper. |
| `apps/web/app/(marketing)/layout.tsx` | Modified | Updated to be full-width with immersive backgrounds. |
| `apps/web/app/(marketing)/page.tsx` | Modified | Upgraded with glassmorphism, spotlight hover effects, and animations. |
| `apps/web/app/auth/layout.tsx` | Modified | Centered auth card on full-width background. |
| `apps/web/components/BackgroundEffects.tsx` | New | Extracted scalable background graphics component. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fixed positioning in `(app)` breaks | Med | Ensure the `(app)` wrapper has `relative` positioning and audit fixed elements like the `ZenDock` to constrain to the 480px container. |
| Z-index collisions with full-width bg | Low | Implement a strict z-index stacking context for the extracted `<BackgroundEffects />` component. |

## Rollback Plan

Revert the git commit. Restore the original `apps/web/app/layout.tsx` which contained the global wrapper, and remove the newly introduced `(app)/layout.tsx`.

## Dependencies

- Framer Motion (for spotlight and smooth entrance animations, if not already present, though CSS can be used as a fallback).
- Tailwind CSS (existing).

## Success Criteria

- [ ] Marketing page (`/`) renders full-width on desktop screens.
- [ ] Core app routes (`/(app)/*`) remain constrained to the 480px mobile-first view centered on desktop.
- [ ] Auth pages render a centered card over a full-width background.
- [ ] Landing page features glassmorphism, animated entrances, and spotlight hover effects.
