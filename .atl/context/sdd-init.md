# Project Context: Macitta

## Stack
- **Language**: TypeScript
- **Framework**: Next.js 15 (App Router) + Turborepo monorepo
- **Build Tool**: Turborepo + npm workspaces
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RPCs)
- **Local DB**: Dexie.js (IndexedDB) for offline-first sync

## Testing
- **Test Runner**: Vitest — `vitest run` (in `packages/shared`)
- **Unit Tests**: ✅ (SREM engine — 40+ tests in `packages/shared/src/sem.test.ts`)
- **Integration Tests**: ❌ (no @testing-library, no http integration tests detected)
- **E2E Tests**: ❌ (no Playwright, Cypress, or similar)
- **Coverage**: ✅ — `vitest run --coverage` (coverage flag available but not yet configured in package.json)

## Quality Tools
| Tool | Available | Command |
|------|-----------|---------|
| Linter | ✅ | `turbo lint` → `next lint` (ESLint) + `eslint .` in shared |
| Type Checker | ✅ | `tsc --noEmit` (TypeScript 5) |
| Formatter | ✅ | `prettier --write "**/*.{ts,tsx,md}"` |

## Strict TDD Mode: enabled ✅
Test runner (Vitest) is configured and actively used. The SREM core engine has comprehensive unit test coverage.

## Conventions
- **Monorepo**: Turborepo with `apps/*` and `packages/*` workspaces
- **Architecture**: Offline-first with Dexie.js → Supabase bidirectional sync
- **Core Algorithm**: SREM (custom spaced repetition) with 9-step growth curve
- **Style**: Tailwind CSS v4, Obsidian Zen aesthetic
- **PWA**: Full offline support via Serwist service worker
- **Existing Docs**: ARCHITECTURE.md (living document), CHANGELOG.md, CONTRIBUTING.md
