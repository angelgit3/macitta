# Design: Onboarding Redesign (Layout Segregation)

## Technical Approach

Use Next.js Route Group layouts (`(app)`, `(marketing)`, `auth`) to define viewport constraints rather than forcing a global `480px` constraint in the `RootLayout`. The root layout will be stripped back to provide only providers and global HTML/Body tags. A new shared `<BackgroundEffects />` component will handle the ambient glowing orbs and grids, allowing it to be used in full-width contexts or constrained contexts as needed.

## Architecture Decisions

### Decision: Next.js Layout Segregation

**Choice**: Remove the `max-w-[480px]` container from `RootLayout` and move it into `(app)/layout.tsx`.
**Alternatives considered**: Using `usePathname()` in `RootLayout` to conditionally apply classes.
**Rationale**: Client-side conditionals in the root layout force the entire app wrapper to become a Client Component or cause layout shift. Native route group layouts perfectly isolate these concerns and retain static rendering.

### Decision: Reusable Background Effects Component

**Choice**: Extract the absolute grid and glow `div`s into `apps/web/components/ui/BackgroundEffects.tsx`.
**Alternatives considered**: Duplicating the HTML in every layout.
**Rationale**: DRY principle. Ensures the visual signature (glowing orbs, grid pattern) stays consistent across the app and marketing pages while allowing props (like `className` or `variant`) to adjust scaling for full-width vs. mobile-constrained views.

### Decision: CSS-Based Animations for Landing Page

**Choice**: Use Tailwind's built-in utilities or custom `globals.css` keyframes (like `animate-in`, `fade-in`, `slide-in-from-bottom`) combined with group-hover for the spotlight effects.
**Alternatives considered**: Heavy JavaScript animation libraries like Framer Motion.
**Rationale**: The marketing page should be as lightweight and fast as possible. Tailwind CSS covers 90% of glassmorphism (`backdrop-blur-xl`, `bg-white/5`) and entrance animations without shipping large JS bundles.

## Data Flow

    [RootLayout] (No constraints, just providers)
      ├─ [ /(app)/layout.tsx ] (max-w-[480px] centered mobile view)
      │    └─ [App Pages]
      ├─ [ /(marketing)/layout.tsx ] (Full width, relative wrapper)
      │    └─ [BackgroundEffects full-width]
      │    └─ [page.tsx] (Glassmorphism, animations)
      └─ [ /auth/layout.tsx ] (Full width, relative wrapper)
           └─ [BackgroundEffects full-width]
           └─ [Auth Pages] (Centered auth card)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/app/layout.tsx` | Modify | Strip out the `<main max-w-[480px]>` wrapper and background effects. |
| `apps/web/components/ui/BackgroundEffects.tsx` | Create | Shared component for grid and glowing orbs. |
| `apps/web/app/(app)/layout.tsx` | Create | Introduce the constrained `480px` wrapper with `BackgroundEffects`. |
| `apps/web/app/(marketing)/layout.tsx` | Modify | Update to render `BackgroundEffects` and ensure it can span full width. |
| `apps/web/app/(marketing)/page.tsx` | Modify | Add `backdrop-blur`, entrance animations, and spotlight hover effects to features. |
| `apps/web/app/auth/layout.tsx` | Modify | Rebuild to center the `children` within a full-viewport screen over the background. |
| `apps/web/tailwind.config.ts` | Modify | Add custom animation keyframes if needed (e.g., `fade-in-up`). |

## Interfaces / Contracts

```tsx
// apps/web/components/ui/BackgroundEffects.tsx
export interface BackgroundEffectsProps {
    className?: string;
    variant?: "constrained" | "full-width";
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `<BackgroundEffects />` | Verify it renders without crashing and accepts variants. |
| E2E | Layout Boundaries | Visual regression or simple Playwright test checking that `(app)` container width is `<= 480px` and `(marketing)` container width matches viewport. |

## Migration / Rollout

No data migration required. This is a pure UI refactor. Will require checking any fixed/absolute positioned elements within `(app)` to ensure they use `absolute` within the relative 480px container rather than `fixed` to the viewport.

## Open Questions

- [ ] Does the `ZenDock` component rely on `fixed` positioning to the viewport? If so, it must be refactored to `absolute` relative to the `(app)` layout.
