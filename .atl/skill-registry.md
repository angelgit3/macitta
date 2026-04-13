# Skill Registry

> Skills are capabilities that can be invoked during the SDD workflow.
> Each skill maps to a specific phase of spec-driven development.

## Core Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| `sdd-explore` | Explore and analyze a topic or domain for spec creation | `sdd-explore <topic>` |
| `sdd-spec` | Draft a formal specification from exploration findings | After exploration |
| `sdd-design` | Create technical design from specification | After spec |
| `sdd-implement` | Guide implementation following spec and design | After design |
| `sdd-verify` | Verify implementation matches spec requirements | After implementation |
| `sdd-apply` | Apply implementation changes following design specs | After design approval |
| `sdd-propose` | Generate design proposals from requirements | `sdd-propose <feature>` |
| `sdd-init` | Initialize SDD workflow for new projects/modules | `sdd-init` |

## Specialized Subagents

| Subagent | Description | Use Case |
|----------|-------------|----------|
| `sdd-testing` | Testing specialist - test creation, execution, validation | TDD workflow, test coverage, regression prevention |
| `sdd-srem` | SREM engine specialist - algorithm understanding, modification, validation | Spaced repetition logic changes, parameter tuning, FSRS migration |

## Project-Specific Skills

| Skill | Description | Command |
|-------|-------------|---------|
| `srem-test` | Run SREM engine tests (Vitest) | `cd packages/shared && npm test` |
| `validator-test` | Run answer validator tests | `cd packages/shared && npx vitest run src/validator.test.ts` |
| `srem-test-coverage` | Run tests with coverage report | `cd packages/shared && npx vitest run --coverage` |
| `lint-all` | Run linting across all workspaces | `turbo lint` |
| `lint-shared` | Lint shared package only | `cd packages/shared && npm run lint` |
| `lint-web` | Lint web app only | `cd apps/web && npm run lint` |
| `format-all` | Format all TypeScript/Markdown files | `prettier --write "**/*.{ts,tsx,md}"` |
| `type-check-shared` | Type-check shared package | `cd packages/shared && npx tsc --noEmit` |
| `type-check-web` | Type-check web app | `cd apps/web && npx tsc --noEmit` |
| `dev` | Start Next.js dev server via Turborepo | `npm run dev` |
| `build` | Build all workspaces via Turborepo | `npm run build` |

## Active Test Suite

- **SREM Engine** (`packages/shared/src/sem.test.ts`) — 35+ tests
  - Growth curve validation (9 steps, max step = 8)
  - Good/Easy interval calculations (curve-driven, no inflation)
  - Hard/Again penalty logic (elapsed time driven)
  - Hard step recalibration
  - Difficulty modulation (1-10, ±27%)
  - Lapse-capped Easy advancement
  - Configurable time thresholds
  - FSRS migration
  - State progression & bookkeeping
  - Edge cases (interval ≥ 1, dueDate always future)

- **Validator** (`packages/shared/src/validator.test.ts`) — 10+ tests
  - `normalize()` — whitespace, case
  - `validateAnswer()` — string, string[], anyOf, allOf, kOf
  - Edge cases (empty input, unknown shapes)

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/src/sem.ts` | SREM scheduling engine (core algorithm) |
| `packages/shared/src/validator.ts` | Answer validation with Levenshtein |
| `packages/shared/src/types.ts` | Shared TypeScript type definitions |
| `packages/shared/src/algorithm.ts` | Levenshtein-based fuzzy matching |
| `apps/web/app/` | Next.js App Router pages |
| `ARCHITECTURE.md` | Living architecture document |
| `docs/srem-algorithm.md` | SREM algorithm documentation |
