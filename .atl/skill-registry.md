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

| Skill | Description | Notes |
|-------|-------------|-------|
| `srem-test` | Run SREM engine tests | `cd packages/shared && npm test` |
| `lint-all` | Run linting across all workspaces | `turbo lint` |
| `format-all` | Format all TypeScript/Markdown files | `npm run format` |

## Active Test Suite

- **SREM Engine** (`packages/shared/src/sem.test.ts`)
  - Growth curve validation
  - Good/Easy interval calculations
  - Hard/Again penalty logic
  - Step recalibration
  - Difficulty modulation
  - Lapse-capped advancement
  - Configurable time thresholds
  - FSRS migration
  - State progression & bookkeeping
