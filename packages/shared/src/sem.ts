/**
 * SREM — Sistema de Repetición Espaciada Macitta
 * "Low Friction, Long Term"
 *
 * Custom spaced repetition engine. Unlike generic FSRS, SREM uses:
 * - Granular slot accuracy (2/3 ≠ 0/3)
 * - Proportional penalties instead of hard resets
 * - A 9-step growth curve toward mastery (0 → 365 days)
 *
 * ─── Scheduling invariants ────────────────────────────────────────────
 * 1. dueDate is ALWAYS from today (now). Late study ≠ scheduled in the past.
 * 2. Good/Easy → interval = SEM_GROWTH_STEPS[nextStep] × difficultyFactor.
 *    Elapsed time does NOT inflate the interval; the today-anchor is the
 *    implicit fairness for late study.
 * 3. Hard/Again → penalty on elapsedDays (real time since lastReview), not
 *    the stored interval. Prevents: stored=3d, actual=14d → penalised 2d.
 * 4. After Hard, the step is recalibrated to stay in sync with the new interval,
 *    preventing a hidden desync between step and actual card difficulty.
 * 5. Card difficulty modulates the curve interval (±27% at extremes, neutral at 5.5).
 * 6. Lapse history caps Easy's double-step advance to a single step, preventing
 *    over-promotion of cards that have historically failed.
 */

// ─── Growth Curve ─────────────────────────────────────────────────────────────
/**
 * 9 steps from first encounter to mastery.
 * Step 0 = brand-new / reset card (due immediately, no review yet).
 * Step 1 = 1 day:  consolidation buffer after first successful review.
 * Steps 2-8 grow exponentially toward yearly mastery.
 */
export const SEM_GROWTH_STEPS = [0, 1, 3, 7, 16, 35, 75, 150, 365] as const;
export const SEM_MAX_STEP = SEM_GROWTH_STEPS.length - 1; // 8

// ─── Grades ───────────────────────────────────────────────────────────────────
export enum SEMGrade {
    Again = 0, // < 66% accuracy — critical failure
    Hard  = 1, // ≥ 66% partial OR 100% slow (above good threshold)
    Good  = 2, // 100% + fluid (between thresholds)
    Easy  = 3, // 100% + instant (below easy threshold)
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type SEMState = 'new' | 'learning' | 'review' | 'mastered';

export interface SEMCardState {
    step: number;        // Current position in growth curve (0–8)
    interval: number;    // Current interval in days
    difficulty: number;  // Running difficulty score (1–10)
    lapses: number;      // Count of Again events
    state: SEMState;
    lastReview: string | null;
    dueDate: string;
}

export interface SEMResult {
    grade: SEMGrade;
    nextState: SEMCardState;
    isMastered: boolean;
}

/**
 * Optional time thresholds for grade calculation.
 * Allows different card types (e.g., kanji vs. vocabulary) to use
 * context-appropriate response-time expectations.
 */
export interface SEMTimeThresholds {
    /** Responses faster than this (ms) are graded Easy. */
    easy: number;
    /** Responses between easy and good (ms) are graded Good; above = Hard. */
    good: number;
}

const DEFAULT_THRESHOLDS: SEMTimeThresholds = { easy: 3000, good: 7000 };

// ─── Default State ────────────────────────────────────────────────────────────
export function createEmptySEMState(): SEMCardState {
    return {
        step: 0,
        interval: 0,
        difficulty: 5.0,
        lapses: 0,
        state: 'new',
        lastReview: null,
        dueDate: new Date().toISOString(),
    };
}

// ─── Grade Calculation ────────────────────────────────────────────────────────
/**
 * Determines the SREM grade from slot accuracy and response time.
 *
 * | Accuracy | Time               | Grade |
 * |----------|--------------------|-------|
 * | 100%     | < thresholds.easy  | Easy  |
 * | 100%     | ≤ thresholds.good  | Good  |
 * | 100%     | > thresholds.good  | Hard  |
 * | ≥ 66%    | any                | Hard  |
 * | < 66%    | any                | Again |
 */
export function calculateSEMGrade(
    accuracy: number,
    timeMs: number,
    thresholds: SEMTimeThresholds = DEFAULT_THRESHOLDS,
): SEMGrade {
    if (accuracy < 0.66) return SEMGrade.Again;
    if (accuracy < 1.0)  return SEMGrade.Hard; // Partial — always Hard

    // 100% correct: time determines fluency
    if (timeMs < thresholds.easy)  return SEMGrade.Easy;
    if (timeMs <= thresholds.good) return SEMGrade.Good;
    return SEMGrade.Hard;
}

// ─── Slot Accuracy ────────────────────────────────────────────────────────────
/**
 * Calculates accuracy as a ratio of correct slots to total slots.
 * Returns a value between 0.0 and 1.0.
 */
export function calculateSlotAccuracy(
    slotResults: Record<string, { status: 'correct' | 'incorrect' | 'neutral' }>
): number {
    const entries = Object.values(slotResults);
    if (entries.length === 0) return 0;
    const correct = entries.filter(e => e.status === 'correct').length;
    return correct / entries.length;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the number of whole days elapsed from `from` until `to`.
 * Returns 0 if `from` is null (brand-new card with no review history).
 */
function daysBetween(from: string | null, to: Date): number {
    if (!from) return 0;
    const msPerDay = 86_400_000;
    return Math.max(0, Math.floor((to.getTime() - new Date(from).getTime()) / msPerDay));
}

/**
 * Converts a difficulty score (1–10) into an interval multiplier.
 *
 * Neutral point (5.5) → 1.00 (no change).
 * Low difficulty     → > 1.00 (longer interval: easy cards earn more spacing).
 * High difficulty    → < 1.00 (shorter interval: hard cards get more repetition).
 * Clamped to [0.5, 1.5] to prevent extreme values.
 */
function difficultyFactor(difficulty: number): number {
    return Math.max(0.5, Math.min(1.5, 1.0 - (difficulty - 5.5) * 0.06));
}

/**
 * Finds the largest step index i where SEM_GROWTH_STEPS[i] <= interval.
 * Used to keep step and interval in sync after Hard penalises the interval.
 */
function stepForInterval(interval: number): number {
    for (let i = SEM_GROWTH_STEPS.length - 1; i >= 0; i--) {
        if (SEM_GROWTH_STEPS[i] <= interval) return i;
    }
    return 0;
}

// ─── Core Scheduling Engine ───────────────────────────────────────────────────
/**
 * The heart of SREM. Takes the current card state + performance,
 * returns the next state with updated interval and due date.
 *
 * Interval rules:
 *  Good/Easy → SEM_GROWTH_STEPS[nextStep] × difficultyFactor(difficulty).
 *              Curve drives the interval; today-anchor = implicit fairness.
 *  Hard      → elapsedDays × (1 − penalty). Step recalibrated to match.
 *  Again     → elapsedDays × 0.15, or 1 day for total failure.
 */
export function evaluateSEM(
    current: SEMCardState,
    accuracy: number,
    timeMs: number,
    thresholds: SEMTimeThresholds = DEFAULT_THRESHOLDS,
): SEMResult {
    const grade = calculateSEMGrade(accuracy, timeMs, thresholds);
    const now = new Date();

    // Real days since last review. Used by Hard/Again for proportional penalties.
    // Min 1 so brand-new cards (lastReview = null) receive a sane fallback.
    const elapsedDays = Math.max(1, daysBetween(current.lastReview, now));

    let nextStep = current.step;
    let nextInterval: number;
    let nextLapses = current.lapses;
    let nextDifficulty = current.difficulty;
    let nextState: SEMState;

    switch (grade) {
        case SEMGrade.Easy: {
            // Advance 2 steps normally; cap to 1 if the card has any lapse history
            // to prevent over-promotion of cards that have previously failed.
            const advance = current.lapses === 0 ? 2 : 1;
            nextStep = Math.min(current.step + advance, SEM_MAX_STEP);
            nextInterval = Math.max(1, Math.round(
                SEM_GROWTH_STEPS[nextStep] * difficultyFactor(current.difficulty)
            ));
            nextDifficulty = Math.max(1, nextDifficulty - 0.3);
            break;
        }

        case SEMGrade.Good:
            // Standard: advance 1 step. Difficulty moderates the curve interval.
            nextStep = Math.min(current.step + 1, SEM_MAX_STEP);
            nextInterval = Math.max(1, Math.round(
                SEM_GROWTH_STEPS[nextStep] * difficultyFactor(current.difficulty)
            ));
            nextDifficulty = Math.max(1, nextDifficulty - 0.1);
            break;

        case SEMGrade.Hard: {
            // Penalty on real elapsed time — not the stored interval.
            // Fixes: stored=3d, actual=14d → old code penalised only 2 days.
            const penalty = accuracy < 1.0 ? 0.50 : 0.15;
            nextInterval = Math.max(1, Math.round(elapsedDays * (1 - penalty)));
            // Recalibrate step to the largest step whose curve value ≤ nextInterval.
            // Keeps step and interval always in sync; prevents phantom jumps on the
            // next Good review.
            nextStep = stepForInterval(nextInterval);
            nextDifficulty = Math.min(10, nextDifficulty + 0.3);
            break;
        }

        case SEMGrade.Again: {
            nextLapses += 1;
            nextDifficulty = Math.min(10, nextDifficulty + 0.5);

            if (accuracy === 0) {
                // Total failure (0/3): reset to step 0, review tomorrow
                nextStep = 0;
                nextInterval = 1;
            } else {
                // Partial failure: go back 2 steps, short cooldown on elapsed time
                nextStep = Math.max(0, current.step - 2);
                nextInterval = Math.max(1, Math.round(elapsedDays * 0.15));
            }
            break;
        }
    }

    // Determine state
    if (nextStep >= SEM_MAX_STEP && grade >= SEMGrade.Good) {
        nextState = 'mastered';
    } else if (nextStep === 0 && nextLapses > 0) {
        nextState = 'learning'; // Re-learning after a lapse
    } else if (nextStep >= 2) {
        nextState = 'review';
    } else {
        nextState = 'learning';
    }

    // Due date always anchors to today — never to lastReview or stored dueDate.
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + nextInterval);

    return {
        grade,
        nextState: {
            step: nextStep,
            interval: nextInterval,
            difficulty: Math.round(nextDifficulty * 100) / 100,
            lapses: nextLapses,
            state: nextState,
            lastReview: now.toISOString(),
            dueDate: dueDate.toISOString(),
        },
        isMastered: nextState === 'mastered',
    };
}

// ─── Migration Helper ─────────────────────────────────────────────────────────
/**
 * Converts existing FSRS user_items data to SREM state.
 * Maps FSRS stability (days) to the nearest SREM growth step.
 */
export function migrateFromFSRS(fsrsData: {
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: string;
    last_review: string | null;
    due_date: string;
}): SEMCardState {
    // Find the closest growth step based on stability
    let closestStep = 0;
    let minDiff = Infinity;
    for (let i = 0; i < SEM_GROWTH_STEPS.length; i++) {
        const diff = Math.abs(fsrsData.stability - SEM_GROWTH_STEPS[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestStep = i;
        }
    }

    // Map FSRS difficulty (0–10 ish) to SREM difficulty (1–10)
    const difficulty = Math.max(1, Math.min(10, fsrsData.difficulty));

    // Map state
    let state: SEMState;
    if (closestStep >= SEM_MAX_STEP) {
        state = 'mastered';
    } else if (fsrsData.state === 'review' || closestStep >= 2) {
        state = 'review';
    } else {
        state = 'learning';
    }

    // Use real FSRS stability as interval reference.
    // Minimum 1 to prevent interval=0 edge cases post-migration (#4).
    const rawInterval = typeof fsrsData.stability === 'number' && fsrsData.stability > 0
        ? Math.round(fsrsData.stability)
        : SEM_GROWTH_STEPS[closestStep];

    return {
        step: closestStep,
        interval: Math.max(1, rawInterval),
        difficulty,
        lapses: fsrsData.lapses,
        state,
        lastReview: fsrsData.last_review,
        dueDate: fsrsData.due_date,
    };
}
