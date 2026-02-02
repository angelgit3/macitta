# Maccita God - Project Context & Map

> **SYSTEM INSTRUCTION**: This file is the Source of Truth for the project structure. Always refer to this map when creating or searching for files.

## 1. Project Identity
*   **Name**: Macitta God (SaaS V2).
*   **Core Logic**: Active Recall + Spaced Repetition (FSRS algorithm).
*   **Design System**: "Obsidian Zen" (Dark, Minimalist, Premium).

## 2. Directory Map (The Rule)

### `apps/web` (The Application)
**Path**: `/apps/web`
**Tech**: Next.js 16 (App Router), React 19, Tailwind v4.
*   **`app/`**: Application routes and pages.
    *   `layout.tsx`: Root layout defining the "Mobile Tunnel" (max-w-480px).
    *   `globals.css`: Global styles and "Obsidian Zen" variables.
*   **`components/ui/`**: Reusable UI components (BentoCard, ZenDock).
*   **`lib/`**: Client-side logic, Supabase clients.

### `packages/shared` (The Core Logic)
**Path**: `/packages/shared`
**Tech**: TypeScript, pure logic.
*   **Purpose**: Shared business logic, types, and algorithms.
*   **`index.ts`**: Main entry point exporting:
    *   FSRS Algorithm implementation.
    *   Zod schemas for validation.
    *   Shared TypeScript interfaces (`Verb`, `UserProgress`).

## 3. Persistent Development Rules
1.  **Distrobox**: Always run node/npm commands inside the `next` container (`distrobox enter next -- ...`).
2.  **Styles**: Use Tailwind v4. No config file needed for simple things, but `globals.css` is the theme source.
3.  **Strict Typing**: All shared types MUST live in `packages/shared`.

## 4. Key Files Map
| File | Purpose |
|Data Model| `packages/shared/src/types.ts` (Planned) |
|SRS Logic| `packages/shared/src/srs.ts` (Planned) |
|Global Styles| `apps/web/app/globals.css` |
|Layout Config| `apps/web/app/layout.tsx` |

---
**Last Updated**: Feb 2026
