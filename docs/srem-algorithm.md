# SREM — Spaced Repetition Engine for Macitta

> **"Low Friction, Long Term"**

SREM is a custom spaced repetition scheduling algorithm built in TypeScript, designed for vocabulary acquisition in educational platforms. It ships as the core of [Macitta](https://www.macitta.app) and lives in `packages/shared/src/sem.ts`.

---

## Why Not Just Use SM-2 or FSRS?

**SM-2** (the algorithm behind Anki) has three known failure modes that SREM addresses:

| Problem | SM-2 / Anki Behavior | SREM Behavior |
|---|---|---|
| **Interval inflation** | Penalises the *stored* interval when a card is late | Penalises *real elapsed time* since last review |
| **Step/interval desync** | After Hard, step and interval can diverge silently | Step is recalibrated to always match the actual interval |
| **Lapse over-promotion** | Easy always advances 2 steps, even after multiple failures | Easy advances only 1 step for cards with lapse history |

**FSRS** is well-researched but requires per-user parameter optimization (15+ parameters), making it impractical for small-scale deployments without a large training dataset. SREM is deliberately simpler: deterministic, transparent, and tunable with a single difficulty score.

---

## The Growth Curve

SREM uses a 9-step exponential progression toward long-term retention:

```
Step:     0    1    2    3    4     5     6     7     8
Days:     0    1    3    7   16    35    75   150   365
State: [new] ──────[learning]──── [review] ──────[mastered]
```

- **Step 0** — Brand-new or fully reset card. Due immediately.
- **Steps 1–1** — Learning phase. Card is seen frequently to build initial retention.
- **Steps 2–7** — Review phase. Graduated from learning; shown at spaced intervals.
- **Step 8** — Mastered. ~1 year interval. Only reached after consistent Good/Easy grades.

---

## Grade System

Each review produces one of four grades, determined by **slot accuracy** and **response time**:

```
calculateSEMGrade(accuracy: number, timeMs: number, thresholds?) → SEMGrade
```

| Accuracy | Response Time | Grade |
|---|---|---|
| 100% | `< thresholds.easy` (default: 3000ms) | **Easy** |
| 100% | `≤ thresholds.good` (default: 7000ms) | **Good** |
| 100% | `> thresholds.good` | **Hard** |
| ≥ 66% (partial) | any | **Hard** |
| < 66% | any | **Again** |

> Thresholds are configurable per card type. A kanji card may use `{ easy: 5000, good: 10000 }` while a vocabulary card uses the defaults. This is exposed via the `SEMTimeThresholds` interface.

---

## Scheduling Rules

### ✅ Easy

```
advance = lapses === 0 ? 2 : 1
nextStep = min(step + advance, MAX_STEP)
nextInterval = round(GROWTH_STEPS[nextStep] × difficultyFactor(difficulty))
difficulty -= 0.3
```

Lapse-capped: if a card has failed before (`lapses > 0`), Easy only advances 1 step instead of 2. This prevents rapid re-promotion of chronically difficult cards.

---

### ✅ Good

```
nextStep = min(step + 1, MAX_STEP)
nextInterval = round(GROWTH_STEPS[nextStep] × difficultyFactor(difficulty))
difficulty -= 0.1
```

Standard advancement. Difficulty modulates the interval without changing the step.

---

### ⚠️ Hard

```
penalty = accuracy < 1.0 ? 0.50 : 0.15
nextInterval = max(1, round(elapsedDays × (1 − penalty)))
nextStep = stepForInterval(nextInterval)   // recalibration
difficulty += 0.3
```

**Key invariant:** `elapsedDays` is real wall-clock time since `lastReview` — not the stored `interval`. This fixes the classic bug where a card stored as "3-day interval" but reviewed after 14 days would only be penalised 2 days (`round(3 × 0.5)`), instead of the correct 7 days (`round(14 × 0.5)`).

After computing `nextInterval`, SREM recalibrates `nextStep` to the largest step `i` where `GROWTH_STEPS[i] ≤ nextInterval`. This ensures the card's step always reflects its true position in the curve.

---

### ❌ Again (partial failure — accuracy ≥ 33% but < 66%)

```
nextStep = max(0, step - 2)
nextInterval = max(1, round(elapsedDays × 0.15))
lapses += 1
difficulty += 0.5
```

---

### ❌ Again (total failure — accuracy = 0)

```
nextStep = 0           // full reset
nextInterval = 1       // review tomorrow
lapses += 1
difficulty += 0.5
```

---

## Difficulty Factor

Difficulty is a running score (1–10) that modulates the interval via a linear multiplier:

```typescript
function difficultyFactor(difficulty: number): number {
    return Math.max(0.5, Math.min(1.5, 1.0 - (difficulty - 5.5) * 0.06));
}
```

| Difficulty | Factor | Effect |
|---|---|---|
| 1.0 (very easy) | ~1.27 | +27% longer interval |
| 5.5 (neutral) | 1.00 | No change |
| 10.0 (very hard) | ~0.73 | −27% shorter interval |

The factor is clamped to `[0.5, 1.5]` to prevent extreme outlier intervals.

---

## State Machine

```
        ┌──────────────┐
        │     new      │ ← createEmptySEMState()
        └──────┬───────┘
               │ Good/Easy
        ┌──────▼───────┐
        │   learning   │ ← steps 0–1
        └──────┬───────┘
               │ step >= 2
        ┌──────▼───────┐      Again
        │    review    │ ◄─────────────────┐
        └──────┬───────┘                   │
               │ step = 8 + Good/Easy      │ (step -= 2, back to review or learning)
        ┌──────▼───────┐                   │
        │   mastered   │ ──────────────────┘ (if Again at mastered)
        └──────────────┘
```

---

## API Reference

### `createEmptySEMState(): SEMCardState`

Returns a default state for a brand-new card.

---

### `evaluateSEM(current, accuracy, timeMs, thresholds?): SEMResult`

The core scheduling function.

```typescript
interface SEMCardState {
    step: number;        // Current step (0–8)
    interval: number;    // Current interval in days
    difficulty: number;  // Running score (1–10)
    lapses: number;      // Count of Again events
    state: 'new' | 'learning' | 'review' | 'mastered';
    lastReview: string | null;   // ISO 8601
    dueDate: string;             // ISO 8601
}

interface SEMResult {
    grade: SEMGrade;          // What grade was assigned
    nextState: SEMCardState;  // Updated state to persist
    isMastered: boolean;      // Convenience flag
}
```

---

### `calculateSEMGrade(accuracy, timeMs, thresholds?): SEMGrade`

Calculates the grade without updating card state. Useful for testing and UI preview.

---

### `calculateSlotAccuracy(slotResults): number`

Converts a map of slot results (`{ status: 'correct' | 'incorrect' | 'neutral' }`) to an accuracy ratio `[0.0, 1.0]`. Enables granular slot-based scoring (2/3 correct ≠ 0/3 correct).

---

### `migrateFromFSRS(fsrsData): SEMCardState`

Migration helper. Converts existing FSRS user data (with `stability` in days) to SREM state by mapping stability to the nearest growth step.

---

## Usage Example (framework-agnostic)

```typescript
import {
    createEmptySEMState,
    evaluateSEM,
    calculateSEMGrade,
    SEMGrade,
} from '@maccita/shared';

// New card — first review
let state = createEmptySEMState();

// Student answered all slots correctly in 2.1 seconds (Easy)
const result = evaluateSEM(state, 1.0, 2100);

console.log(result.grade);              // SEMGrade.Easy (3)
console.log(result.nextState.step);     // 2
console.log(result.nextState.interval); // 3 (days)
console.log(result.nextState.dueDate);  // 3 days from now (ISO 8601)

// Persist result.nextState to your database
state = result.nextState;

// Student answers 2/3 slots correctly the next session (Hard)
const result2 = evaluateSEM(state, 0.66, 4000);
console.log(result2.grade);             // SEMGrade.Hard (1)
```

---

## Test Coverage

The engine ships with **40+ tests** using [Vitest](https://vitest.dev), organised by invariant:

| Test Suite | Coverage |
|---|---|
| Growth curve shape | Step values, curve monotonicity |
| Good/Easy scheduling | On-time and late study (today-anchor invariant) |
| Hard/Again penalties | Real elapsed time, total vs. partial failure |
| Hard step recalibration | Step/interval sync after penalty |
| Difficulty factor | Neutral point, extremes, clamping |
| Lapse-capped advancement | Easy with 0 vs. 1+ lapses |
| Edge cases | Interval ≥ 1, step clamping, state transitions |
| Configurable thresholds | Custom easy/good time windows |
| `migrateFromFSRS` | Stability mapping, state inference |
| State bookkeeping | `lastReview` and `dueDate` correctness |

Run tests:

```bash
cd packages/shared
npm run test
```

---

## Design Principles

1. **Today-anchor**: `dueDate` is always `now + nextInterval`. Late study never inflates future intervals.
2. **Penalty on real time**: Hard/Again penalise `elapsedDays` (wall-clock), not stored `interval`.
3. **Step/interval sync**: After any grade, `step` always reflects the card's true position in the growth curve.
4. **Lapse memory**: Cards that have failed before are promoted more conservatively.
5. **Configurable thresholds**: Response time windows are parameterized, not hardcoded.

---

*SREM is part of the [Macitta](https://www.macitta.app) open-source project. MIT License.*
