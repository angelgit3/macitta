/**
 * SREM — Sistema de Repetición Espaciada Macitta
 * "Low Friction, Long Term"
 *
 * Custom spaced repetition engine. Unlike generic FSRS, SREM uses:
 * - Granular slot accuracy (2/3 ≠ 0/3)
 * - Proportional penalties instead of hard resets
 * - An 8-step growth curve toward mastery (365 days)
 */

// ─── Growth Curve ───────────────────────────────────────────────────
// 8 steps from first encounter to mastery (days until next review)
export const SEM_GROWTH_STEPS = [0, 3, 7, 16, 35, 75, 150, 365] as const;
export const SEM_MAX_STEP = SEM_GROWTH_STEPS.length - 1; // 7

// ─── Grades ─────────────────────────────────────────────────────────
export enum SEMGrade {
    Again = 0,  // < 66% accuracy — critical failure
    Hard = 1,  // ≥ 66% partial OR 100% slow (> 7s)
    Good = 2,  // 100% + fluid (3-7s)
    Easy = 3,  // 100% + instant (< 3s)
}

// ─── Types ──────────────────────────────────────────────────────────
export type SEMState = 'new' | 'learning' | 'review' | 'mastered';

export interface SEMCardState {
    step: number;        // Current position in growth curve (0-7)
    interval: number;    // Current interval in days
    difficulty: number;  // Running difficulty score (1-10)
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

// ─── Default State ──────────────────────────────────────────────────
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

// ─── Grade Calculation ──────────────────────────────────────────────
/**
 * Determines the SREM grade from slot accuracy and response time.
 *
 * | Accuracy | Time     | Grade |
 * |----------|----------|-------|
 * | 100%     | < 3s     | Easy  |
 * | 100%     | 3-7s     | Good  |
 * | 100%     | > 7s     | Hard  |
 * | ≥ 66%    | any      | Hard  |
 * | < 66%    | any      | Again |
 */
export function calculateSEMGrade(accuracy: number, timeMs: number): SEMGrade {
    if (accuracy < 0.66) {
        return SEMGrade.Again;
    }

    if (accuracy < 1.0) {
        // Partial success (e.g., 2/3 slots) — always Hard
        return SEMGrade.Hard;
    }

    // 100% correct — time determines fluency
    if (timeMs < 3000) return SEMGrade.Easy;
    if (timeMs <= 7000) return SEMGrade.Good;
    return SEMGrade.Hard; // Slow but correct
}

// ─── Slot Accuracy ──────────────────────────────────────────────────
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

// ─── Core Scheduling Engine ─────────────────────────────────────────
/**
 * The heart of SREM. Takes the current card state + performance,
 * returns the next state with updated interval and due date.
 */
export function evaluateSEM(
    current: SEMCardState,
    accuracy: number,
    timeMs: number,
): SEMResult {
    const grade = calculateSEMGrade(accuracy, timeMs);
    const now = new Date();

    let nextStep = current.step;
    let nextInterval: number;
    let nextLapses = current.lapses;
    let nextDifficulty = current.difficulty;
    let nextState: SEMState;

    switch (grade) {
        case SEMGrade.Easy:
            // Reward: advance 2 steps (accelerated progression)
            nextStep = Math.min(current.step + 2, SEM_MAX_STEP);
            nextInterval = SEM_GROWTH_STEPS[nextStep];
            nextDifficulty = Math.max(1, nextDifficulty - 0.3);
            break;

        case SEMGrade.Good:
            // Standard: advance 1 step
            nextStep = Math.min(current.step + 1, SEM_MAX_STEP);
            nextInterval = SEM_GROWTH_STEPS[nextStep];
            nextDifficulty = Math.max(1, nextDifficulty - 0.1);
            break;

        case SEMGrade.Hard: {
            // Penalty depends on whether it was slow (100%) or partial (< 100%)
            const penalty = accuracy < 1.0 ? 0.50 : 0.15;
            nextInterval = Math.max(1, Math.round(current.interval * (1 - penalty)));
            // Don't advance step; stay where you are
            nextDifficulty = Math.min(10, nextDifficulty + 0.3);
            break;
        }

        case SEMGrade.Again: {
            nextLapses += 1;
            nextDifficulty = Math.min(10, nextDifficulty + 0.5);

            if (accuracy === 0) {
                // Total failure (0/3): -100%, reset to step 0
                nextStep = 0;
                nextInterval = 1; // Tomorrow
            } else {
                // Partial failure (1/3): -85%, go back 2 steps
                nextStep = Math.max(0, current.step - 2);
                nextInterval = Math.max(1, Math.round(current.interval * 0.15));
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

    // Calculate due date
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

// ─── Migration Helper ───────────────────────────────────────────────
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

    // Map FSRS difficulty (0-10 ish) to SREM difficulty (1-10)
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

    return {
        step: closestStep,
        interval: SEM_GROWTH_STEPS[closestStep],
        difficulty,
        lapses: fsrsData.lapses,
        state,
        lastReview: fsrsData.last_review,
        dueDate: fsrsData.due_date,
    };
}
