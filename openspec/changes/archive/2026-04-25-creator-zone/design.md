# Design: creator-zone

## Technical Approach

We will replace the internal Supabase feedback form within `ProfileClient.tsx` with a new "Creator Zone" section. This entails removing all React state, Supabase logic, and UI related to the feedback feature. In its place, we'll implement a static attribution UI block utilizing existing Tailwind classes (`bg-stone-surface`, etc.) to match the surrounding profile cards. We will use the `ZenButton` component configured to open external links to the creator's social media platforms via `window.open` (since `ZenButton` is fundamentally a `<button>`).

## Architecture Decisions

### Decision: Using `window.open` for Social Links

**Choice**: Use `window.open(url, '_blank')` in the `onClick` handler of `ZenButton` components.
**Alternatives considered**: Wrapping `ZenButton` in an HTML `<a>` tag or modifying `ZenButton` to support an `as="a"` prop.
**Rationale**: The `ZenButton` component currently hardcodes a `<button>` element. Refactoring `ZenButton` is out of scope for this change. Wrapping a `<button>` inside an `<a>` is invalid HTML and can cause hydration issues or unexpected accessibility behavior. `window.open` is a straightforward and safe alternative for external links in this context.

### Decision: State and Code Cleanup

**Choice**: Completely remove `feedbackOpen`, `feedbackType`, `feedbackMsg`, `feedbackLoading`, `feedbackSent`, the `FEEDBACK_TYPES` array, and unused Lucide icon imports (`MessageSquare`, `Bug`, `Lightbulb`, `MessageCircle`, `Send`).
**Alternatives considered**: Commenting them out or leaving them.
**Rationale**: Keeping dead code goes against clean code principles. Since the feedback feature is entirely removed, deleting the associated logic maintains a smaller footprint and prevents confusion.

## Data Flow

Data flow is simplified in this change. The `ProfileClient` component will no longer send `INSERT` queries to the `feedback` table in Supabase. The new Creator Zone is purely presentational and stateless, directing users out of the application for social links.

    User Profile UI ──(onClick)──> window.open() ──> External Social Site

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/app/(app)/usuario/ProfileClient.tsx` | Modify | Remove feedback states, Supabase insert logic, and unused icons. Add Instagram, Twitter, Github icons. Replace the feedback UI block with the "Desarrollado por Alberto Anaya" section containing the initials badge ('AA') and `ZenButton` social links. |

## Interfaces / Contracts

No new interfaces or API contracts are being created. We are removing the reliance on the Supabase `feedback` table structure from this client component.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component Rendering | Ensure `ProfileClient` renders without throwing missing import errors after the cleanup. |
| Integration | Social Links | Manually verify that clicking the social `ZenButton` components opens the intended URLs in a new tab. |
| Integration | Supabase Client | Verify that no feedback-related API calls are made upon any interaction. |

## Migration / Rollout

No database migration is required. The `feedback` table in Supabase will simply stop receiving inserts from this client. We can leave the table intact in the database for historical records.

## Open Questions

- [ ] What are the exact URLs for Alberto Anaya's Instagram, Twitter, and GitHub? (Will use standard placeholder domain paths like `https://github.com/albertoanaya` for now).
