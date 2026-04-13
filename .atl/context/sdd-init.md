# Project Context: Macitta

## Stack
- **Language**: TypeScript 5 (strict mode)
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS, RPCs)
- **Monorepo**: Turborepo v2.3 + npm workspaces (`apps/*`, `packages/*`)
- **Package Manager**: npm 10.2.4
- **Local DB**: Dexie.js (IndexedDB) — offline-first with bidirectional sync
- **PWA**: Serwist service worker for offline caching

## Architecture
- **apps/web** — Next.js 15 app with App Router, PWA, Supabase SSR auth
- **packages/shared** — Framework-agnostic SREM core engine + validator
- **supabase/migrations** — SQL database migrations
- **docs/** — Algorithm and project documentation

## SREM Engine (Core IP)
- Custom spaced repetition algorithm — 9-step growth curve: `[0,1,3,7,16,35,75,150,365]`
- Difficulty modulation (1-10 scale, ±27% interval effect)
- Lapse-capped advancement (Easy capped to +1 step if lapses > 0)
- Hard grade recalibrates step position to stay synced
- Configurable time thresholds per card type
- FSRS migration support
- Levenshtein-based answer validation (tolerance for typos)

## Testing
- **Test Runner**: Vitest v4.1.2 — `cd packages/shared && npm test` (vitest run)
- **Unit Tests**: ✅ 2 test files, 45+ tests passing
  - `sem.test.ts` — SREM engine: growth curve, grading, difficulty, lapses, recalibration, FSRS migration, state bookkeeping
  - `validator.test.ts` — Answer validation: normalize, string, anyOf, allOf, kOf, edge cases
- **Integration Tests**: ❌ (no @testing-library/react, no API integration tests)
- **E2E Tests**: ❌ (no Playwright, Cypress, or similar)
- **Coverage**: ✅ available — `vitest run --coverage` (flag supported, no config yet)

## Quality Tools
| Tool | Available | Command |
|------|-----------|---------|
| Linter | ✅ | `turbo lint` → `next lint` (web) + `eslint .` (shared, ESLint v9 flat config) |
| Type Checker | ✅ | `tsc --noEmit` (TypeScript 5, strict mode) |
| Formatter | ✅ | `prettier --write "**/*.{ts,tsx,md}"` |

## CI/CD
- GitHub: issue templates (bug_report, feature_request) + PR template
- No automated CI workflow detected (no `.github/workflows/*.yml`)

## Strict TDD Mode: enabled ✅
Vitest is configured and actively used. The SREM core engine has 45+ comprehensive unit tests. The algorithm is fully spec-driven via test invariants documented at the top of `sem.test.ts`.

## Conventions
- **Monorepo**: Turborepo pipeline — `build` depends on `^build`, `dev` is persistent/uncached
- **Offline-first**: All study operations go through Dexie.js → sync queue → Supabase
- **Dark-mode first UI**: Obsidian Zen aesthetic via Tailwind CSS v4
- **React Compiler**: `babel-plugin-react-compiler` enabled
- **Living docs**: ARCHITECTURE.md is a living document, CHANGELOG.md tracks history
- **ESLint**: Flat config (`eslint.config.js`) in shared package with `typescript-eslint`
- **TypeScript**: strict mode, ES2017 target, bundler module resolution in both workspaces
