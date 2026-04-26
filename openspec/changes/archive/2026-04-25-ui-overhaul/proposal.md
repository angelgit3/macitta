# Proposal: UI Overhaul (Modern SaaS)

## Intent
Upgrade the visual design of the Macitta web app (`apps/web`) to a "Modern SaaS" aesthetic. The goal is to modernize the UI with a dark mode, minimalist vibe, glowing edges, and smooth transitions, strictly remaining a visual update without altering business logic.

## Scope

### In Scope
- Implement dark mode as the primary theme.
- Apply minimalist design principles across all screens.
- Add futuristic UI elements (e.g., glowing edges, neon accents).
- Add smooth layout animations and transitions.
- Update Tailwind v4 configuration for the new aesthetic.

### Out of Scope
- Refactoring business logic, state management, or algorithms.
- Modifying the Container-Presentational component structure.
- Introducing new functional features or capabilities.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Approach
- **Theming**: Configure Tailwind CSS v4 in `apps/web` with a dark mode color palette.
- **Styling**: Target presentational components to replace/enhance classes with minimalist and glowing-edge utilities.
- **Animations**: Introduce transition utilities and keyframes for smooth interactive state changes.
- **Isolation**: Strictly edit UI elements to ensure container components (logic/fetching) remain untouched.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/globals.css` / Tailwind Config | Modified | Update theme colors, animations, and global dark base. |
| `apps/web/src/components/ui/` | Modified | Update presentational components for the new aesthetic. |
| `apps/web/src/app/` | Modified | Update page layouts to apply new structural styling and transitions. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Logic regressions during UI update | Low | Strictly isolate changes to presentational components and CSS. |
| Accessibility loss (contrast issues) | Medium | Ensure dark mode colors maintain WCAG contrast ratios. |

## Rollback Plan
- Revert the PR/commit containing the UI styling changes and restore the previous Tailwind configuration.

## Dependencies
- Next.js 15
- Tailwind v4
- React 19

## Success Criteria
- [ ] Application strictly uses the new "Modern SaaS" dark aesthetic.
- [ ] Glowing edges and smooth transitions are visible on interactive elements.
- [ ] No changes or regressions observed in business logic or algorithms.
- [ ] Container-Presentational pattern remains fully intact.