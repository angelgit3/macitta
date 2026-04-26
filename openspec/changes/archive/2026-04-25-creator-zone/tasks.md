# Tasks: creator-zone

## Phase 1: Cleanup (Removing Feedback Feature)

- [x] 1.1 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, remove all feedback-related states (`feedbackOpen`, `feedbackType`, `feedbackMsg`, `feedbackLoading`, `feedbackSent`) and the `FEEDBACK_TYPES` array.
- [x] 1.2 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, remove the Supabase API `insert` logic targeting the `feedback` table.
- [x] 1.3 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, remove the entire Feedback UI section from the JSX render.
- [x] 1.4 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, remove unused `lucide-react` imports (`MessageSquare`, `Bug`, `Lightbulb`, `MessageCircle`, `Send`).

## Phase 2: Core Implementation (Creator Zone)

- [x] 2.1 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, import `Instagram`, `Twitter`, and `Github` icons from `lucide-react`.
- [x] 2.2 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, build the "Desarrollado por" section showing initials "AA" and name "Alberto Anaya" with `bg-stone-surface` and standard profile card styling.
- [x] 2.3 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, implement the Instagram `ZenButton` using `onClick={() => window.open('https://www.instagram.com/aalberto_anaya/', '_blank')}`.
- [x] 2.4 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, implement the Twitter `ZenButton` using `onClick={() => window.open('https://x.com/aalberto_anaya', '_blank')}`.
- [x] 2.5 In `apps/web/app/(app)/usuario/ProfileClient.tsx`, implement the GitHub `ZenButton` using `onClick={() => window.open('https://github.com/angelgit3/macitta', '_blank')}`.

## Phase 3: Testing / Verification

- [x] 3.1 Verify `ProfileClient` renders locally without throwing missing import or undeclared state errors.
- [x] 3.2 Verify clicking the social `ZenButton` instances opens the exact correct external URLs in new tabs.
- [x] 3.3 Verify all feedback UI and API calls are completely removed from the user profile.
