## Exploration: Onboarding Redesign (Layout Separation & Premium SaaS Aesthetics)

### Current State
Currently, `apps/web/app/layout.tsx` (the `RootLayout`) enforces a strict `<main className="w-full max-w-[480px] ...">` wrapper. This creates an excellent mobile-first PWA feel for the app itself, but inadvertently squishes the `(marketing)` and `auth` routes, causing the landing page to be constrained to 480px on desktop screens. The root layout also injects the glowing ambient background and grid pattern globally.

### Affected Areas
- `apps/web/app/layout.tsx` — Must be stripped of layout constraints (`max-w-[480px]`, `border-x`, absolute background effects) to become a true global wrapper that allows full width.
- `apps/web/app/(app)/layout.tsx` — Must inherit the mobile constraints and background effects to preserve the focused, mobile-first app experience on desktop.
- `apps/web/app/(marketing)/layout.tsx` & `page.tsx` — Will now expand to full-width. Need to re-implement background effects to scale across the entire viewport.
- `apps/web/app/auth/layout.tsx` — Needs to be evaluated to either use a centered auth card within a full-width background, or adopt the mobile wrapper. (Full-width with centered card is standard for SaaS).

### Approaches

1. **Next.js Route Group Segregation (Recommended)**
   - **Description**: Move the `max-w-[480px]` container, border styles, and absolute background elements (glow/grid) from `RootLayout` into `(app)/layout.tsx`. Wrap the app layout in a full-width flex container (`flex justify-center w-full`) to center the mobile view on desktop. Apply full-width aesthetic enhancements to `(marketing)/page.tsx`.
   - **Pros**: Perfectly leverages Next.js App Router capabilities; clean separation of concerns; no client-side route checking required; fully static/server-renderable.
   - **Cons**: Some background effects (like the grid or glow) might need to be duplicated or extracted into a shared `<BackgroundEffects />` component if we want them in both the marketing page and the app.
   - **Effort**: Low

2. **Conditional Rendering in Root Layout (Anti-Pattern)**
   - **Description**: Use `headers()` or client-side `usePathname()` to conditionally apply the `max-w-[480px]` class.
   - **Pros**: Keeps all layout logic in one file.
   - **Cons**: Requires either making the root layout a client component (bad for performance/SEO) or relying on middleware/headers which breaks static generation for the layout.
   - **Effort**: High complexity, poor architectural choice.

### "Premium SaaS" Aesthetic Explorations for Marketing
To elevate the marketing page to a breathtaking, immersive state now that it has full width:
- **Immersive Backgrounds**: Extract the grid and glowing orbs into a scalable component. Animate the gradient orbs slowly. 
- **Glassmorphism**: Enhance the sticky navbar with a stronger `backdrop-blur-xl` and `bg-void/40`. Apply similar glass effects to the feature cards.
- **Spotlight Hover Effects**: Implement a CSS-based or framer-motion "spotlight" effect on the feature grid cards so they subtly glow when hovered.
- **Animated Entrances**: Add simple CSS `animate-in fade-in slide-in-from-bottom-4` to the hero text and buttons so they cascade in smoothly on load.
- **Glowing CTAs**: Give the primary "Empezar gratis" button an animated gradient border or a stronger drop shadow (`shadow-[0_0_20px_rgba(var(--accent-focus),0.4)]`).

### Recommendation
**Approach 1 (Route Group Segregation)** is the definitive way to solve this in Next.js. 
We should:
1. Strip `RootLayout` to bare HTML/Body/Providers.
2. Upgrade `(app)/layout.tsx` to handle the centered mobile column.
3. Enhance `(marketing)/page.tsx` with full-width glassmorphic and animated SaaS effects.

### Risks
- Moving the `max-w-[480px]` wrapper might subtly break fixed positioning within `(app)` (e.g., the `ZenDock` might need to be scoped to the 480px container rather than the viewport). We must ensure `relative` and `absolute/fixed` positioning is contained within the `(app)` wrapper.

### Ready for Proposal
Yes. The orchestrator can proceed to the `sdd-propose` phase with clear direction on layout segregation and aesthetic enhancements.