# Proposal: creator-zone

## Intent
Replace the internal Supabase feedback form on the User Profile page with a "Developed by Alberto Anaya" creator zone to provide proper attribution and direct links to the creator's social profiles.

## Scope

### In Scope
- Remove the existing Supabase feedback form logic (state, API call, UI) in `ProfileClient.tsx`.
- Add a "Desarrollado por" section with initials 'AA' and name 'Alberto Anaya'.
- Add three social links using `lucide-react` icons (Instagram, Twitter, Github) and the `ZenButton` component.
- Maintain existing UI styling (Tailwind CSS).

### Out of Scope
- Refactoring other profile sections (e.g. settings, subscriptions).
- Adding new social profiles beyond the 3 specified.

## Capabilities

### New Capabilities
- `creator-zone`: Displays creator attribution and external social links in the user profile.

### Modified Capabilities
- `user-profile`: Removing the feedback submission requirement.

## Approach
1. Locate the feedback form section in `apps/web/app/(app)/usuario/ProfileClient.tsx`.
2. Delete the feedback-related React states (e.g., `feedbackText`, `isSubmitting`), functions, and Supabase database interactions.
3. Replace the feedback UI with a flex container representing the creator zone.
4. Implement the 'AA' initials badge and the creator's name.
5. Create three `ZenButton` instances configured as external links (`href`) for Instagram, Twitter, and GitHub, utilizing `lucide-react` icons.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/app/(app)/usuario/ProfileClient.tsx` | Modified | Replaces feedback form with creator zone UI and removes related logic |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Unused imports (e.g., Supabase client, Lucide icons) left behind | Low | Verify and clean up imports after removing feedback logic |
| Breakage of existing profile UI due to Tailwind flex/grid changes | Low | Validate UI integration keeping existing container styles |

## Rollback Plan
Revert changes to `apps/web/app/(app)/usuario/ProfileClient.tsx` to the previous commit to restore the feedback form.

## Dependencies
- `lucide-react` for icons.
- Custom `ZenButton` component (already exists in project).

## Success Criteria
- [ ] Supabase feedback logic and UI are completely removed.
- [ ] Creator zone displays name "Alberto Anaya" and initials "AA".
- [ ] Instagram, Twitter, and GitHub buttons correctly link to the specified URLs.
- [ ] The profile UI continues to render correctly without errors.