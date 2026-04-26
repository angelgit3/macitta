# Tasks: Onboarding Redesign (Layout Segregation)

## Phase 1: Foundation & Shared UI

- [x] 1.1 Create `apps/web/components/ui/BackgroundEffects.tsx`. Move the glowing orb and grid pattern from `RootLayout` here. Add a `variant` prop (`"constrained" | "full-width"`).
- [x] 1.2 Modify `apps/web/tailwind.config.ts` (or `globals.css`) to add animation utilities if not already present (e.g., `animate-fade-in-up`).

## Phase 2: Core Layout Segregation

- [x] 2.1 Create `apps/web/app/(app)/layout.tsx`. Implement the `w-full max-w-[480px] min-h-screen relative` container here. Include `<BackgroundEffects variant="constrained" />`.
- [x] 2.2 Modify `apps/web/app/layout.tsx`. Remove the `480px` wrapper, leaving only the `<html>`, `<body>`, and `<ClientProviders>` tags. Ensure `<body>` has `min-h-screen bg-void text-stone-100 flex justify-center`.

## Phase 3: Marketing & Auth UI Polish

- [x] 3.1 Modify `apps/web/app/(marketing)/layout.tsx`. Inject `<BackgroundEffects variant="full-width" />` and ensure the main container allows full-width expansion (`w-full flex-1`).
- [x] 3.2 Modify `apps/web/app/(marketing)/page.tsx`. Apply glassmorphism (`backdrop-blur-xl`, `bg-white/5`) to the navbar and feature cards. Add entrance animations to the hero section. Implement CSS spotlight hover effects (`group-hover:shadow-[...]`) on feature cards.
- [x] 3.3 Modify `apps/web/app/auth/layout.tsx`. Wrap the `children` in a centered container (`min-h-screen flex items-center justify-center`). Add `<BackgroundEffects variant="full-width" />` and ensure the auth form looks like a premium card (`backdrop-blur-lg border border-white/10`).

## Phase 4: Verification & Cleanup

- [x] 4.1 Audit `apps/web/app/(app)` components for broken fixed positioning (e.g., sticky headers or ZenDock) and update to use `absolute` or sticky relative to the `480px` container.
- [x] 4.2 Verify marketing and auth pages on desktop resolutions to ensure they span the full viewport correctly.
