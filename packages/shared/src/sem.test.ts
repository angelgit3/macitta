/**
 * sem.test.ts — SREM Scheduling Engine Tests
 *
 * Core invariants:
 *
 *  1. Good / Easy → nextInterval = SEM_GROWTH_STEPS[nextStep].
 *     Studying late does NOT inflate the interval; the today-anchor on
 *     dueDate is the implicit fairness (you're never scheduled in the past).
 *
 *  2. Hard / Again → penalty is proportional to elapsedDays (real time since
 *     lastReview), NOT the stored interval.
 *     Fixes: stored=3d, actual=14d → old code penalised only 2 days.
 *
 *  3. dueDate is ALWAYS from today (now), never from lastReview or stored dueDate.
 */

import { describe, it, expect } from "vitest";
import {
    evaluateSEM,
    migrateFromFSRS,
    createEmptySEMState,
    SEM_GROWTH_STEPS,
    SEMGrade,
    type SEMCardState,
} from "./sem";

// ─── Helpers ─────────────────────────────────────────────────────────

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

/** Build a minimal SEMCardState with sane defaults (step 1, on-time). */
function makeState(overrides: Partial<SEMCardState> = {}): SEMCardState {
    return {
        step: 1,
        interval: SEM_GROWTH_STEPS[1], // 3
        difficulty: 5.0,
        lapses: 0,
        state: "learning",
        lastReview: daysAgo(3),
        dueDate: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * Returns how many whole days from now until the result's dueDate.
 * Math.round absorbs sub-millisecond timing jitter in tests.
 */
function daysUntilDue(result: ReturnType<typeof evaluateSEM>): number {
    const due = new Date(result.nextState.dueDate);
    const ms = due.getTime() - Date.now();
    return Math.round(ms / 86_400_000);
}

// ─── Good / Easy: growth curve drives the interval ───────────────────

describe("evaluateSEM — Good/Easy always follow the growth curve", () => {

    it("Good (on-time): nextInterval = SEM_GROWTH_STEPS[nextStep]", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(3) });
        const result = evaluateSEM(state, 1.0, 4000); // 100%, 4 s → Good

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(2);
        // step 1 → 2, SEM_GROWTH_STEPS[2] = 7
        expect(result.nextState.interval).toBe(7);
        expect(daysUntilDue(result)).toBe(7);
    });

    it("Good (late, 23 days): same interval as on-time — curve only", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(23) });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(2);
        // elapsedDays = 23, but interval must still be SEM_GROWTH_STEPS[2] = 7
        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[2]);
        expect(daysUntilDue(result)).toBe(7);
    });

    it("Easy (on-time): nextInterval = SEM_GROWTH_STEPS[nextStep + 2]", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(3) });
        const result = evaluateSEM(state, 1.0, 1500); // 100%, < 3 s → Easy

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(3);
        // step 1 → 3, SEM_GROWTH_STEPS[3] = 16
        expect(result.nextState.interval).toBe(16);
        expect(daysUntilDue(result)).toBe(16);
    });

    it("Easy (late, 23 days): same interval as on-time — no elapsed inflation", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(23) });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(3);
        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[3]); // 16
        expect(daysUntilDue(result)).toBe(16);
    });

    it("Good: dueDate is always in the future even on very late cards", () => {
        const state = makeState({ step: 2, lastReview: daysAgo(60) });
        const result = evaluateSEM(state, 1.0, 4000);

        // step 2 → 3, curve = 16 days → due 16 days from now (not in the past)
        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[3]); // 16
        expect(new Date(result.nextState.dueDate).getTime()).toBeGreaterThan(Date.now());
    });
});

// ─── Hard / Again: elapsedDays drives the penalty ────────────────────

describe("evaluateSEM — Hard/Again use real elapsed time for penalties", () => {

    it("Hard (partial, 50% penalty) penalises elapsed days, not stored interval", () => {
        // THE ORIGINAL BUG: step=1, stored interval=3.
        // Old code: round(3 * 0.50) = 2 days — absurdly small.
        // Correct:  round(17 * 0.50) = 9 days.
        const state = makeState({ step: 1, interval: 3, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 0.66, 4000);

        expect(result.grade).toBe(SEMGrade.Hard);
        expect(daysUntilDue(result)).toBeGreaterThan(2);      // not the buggy value
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(8); // round(17*0.50)=9 ±1
        expect(daysUntilDue(result)).toBeLessThanOrEqual(10);
    });

    it("Hard (slow, 15% penalty) on overdue card uses elapsed days", () => {
        const state = makeState({ step: 2, interval: 7, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 1.0, 9000); // 100%, > 7 s → Hard

        expect(result.grade).toBe(SEMGrade.Hard);
        // Old code: round(7 * 0.85) = 6 days
        // Correct:  round(17 * 0.85) = 14 days
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(13);
        expect(daysUntilDue(result)).toBeLessThanOrEqual(15);
    });

    it("Again (total failure, 0%): resets to step 0, review tomorrow", () => {
        const state = makeState({ step: 5, lastReview: daysAgo(100) });
        const result = evaluateSEM(state, 0.0, 5000);

        expect(result.grade).toBe(SEMGrade.Again);
        expect(result.nextState.step).toBe(0);
        expect(daysUntilDue(result)).toBe(1);
    });

    it("Again (partial failure): cooldown scales with elapsed time", () => {
        // elapsedDays = 17 → round(17 * 0.15) = 3 days
        const state = makeState({ step: 3, interval: 16, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 0.33, 5000);

        expect(result.grade).toBe(SEMGrade.Again);
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(1);
        expect(result.nextState.lapses).toBe(1);
    });
});

// ─── New card (lastReview = null) ─────────────────────────────────────

describe("New card (lastReview = null)", () => {

    it("Good: uses curve step (elapsedDays floored to 1 for null)", () => {
        const state = createEmptySEMState();
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(1);
        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[1]); // 3
        expect(daysUntilDue(result)).toBe(3);
    });

    it("Easy: advances 2 steps from 0, uses curve", () => {
        const state = createEmptySEMState();
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(2);
        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[2]); // 7
        expect(daysUntilDue(result)).toBe(7);
    });

    it("Hard on a brand-new card: elapsedDays=1, at least 1 day forward", () => {
        const state = createEmptySEMState();
        const result = evaluateSEM(state, 0.66, 4000);

        expect(result.grade).toBe(SEMGrade.Hard);
        // round(1 * 0.50) = 1, max(1,1) = 1
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(1);
    });
});

// ─── Regression: the original bug scenario ───────────────────────────

describe("Regression — card reviewed 17 days late", () => {

    it("Hard: should NOT produce a tiny interval based on stored interval", () => {
        const state: SEMCardState = {
            step: 1,
            interval: 3, // small value stored in DB
            difficulty: 5.0,
            lapses: 0,
            state: "learning",
            lastReview: daysAgo(17),
            dueDate: daysAgo(14),
        };
        const result = evaluateSEM(state, 0.66, 5000);

        // BUG: old code → round(3 * 0.50) = 2 days
        // FIX:            round(17 * 0.50) = 9 days
        expect(daysUntilDue(result)).toBeGreaterThan(2);
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(8);
    });

    it("Good: uses the curve (7 days from today), not elapsedDays", () => {
        const state: SEMCardState = {
            step: 1,
            interval: 3,
            difficulty: 5.0,
            lapses: 0,
            state: "learning",
            lastReview: daysAgo(17),
            dueDate: daysAgo(14),
        };
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        // step 1 → 2, SEM_GROWTH_STEPS[2] = 7 — not 18 (elapsedDays+1)
        expect(result.nextState.interval).toBe(7);
        expect(daysUntilDue(result)).toBe(7);
    });
});

// ─── migrateFromFSRS ─────────────────────────────────────────────────

describe("migrateFromFSRS — stability is preserved", () => {

    it("uses real stability (e.g. 14.5 days) instead of binned step value", () => {
        const result = migrateFromFSRS({
            stability: 14.5,
            difficulty: 5,
            reps: 4,
            lapses: 0,
            state: "review",
            last_review: daysAgo(10),
            due_date: daysAgo(3),
        });

        expect(result.interval).toBe(14.5);
        expect(result.step).toBeDefined();
    });

    it("falls back to curve step if stability is 0", () => {
        const result = migrateFromFSRS({
            stability: 0,
            difficulty: 5,
            reps: 0,
            lapses: 0,
            state: "new",
            last_review: null,
            due_date: new Date().toISOString(),
        });

        expect(result.interval).toBe(SEM_GROWTH_STEPS[0]); // 0
    });

    it("maps to 'mastered' for stability ≥ 365 (step 7)", () => {
        const result = migrateFromFSRS({
            stability: 365,
            difficulty: 2,
            reps: 10,
            lapses: 0,
            state: "review",
            last_review: daysAgo(200),
            due_date: daysAgo(150),
        });

        expect(result.state).toBe("mastered");
    });

    it("maps to 'learning' for low stability (step < 2)", () => {
        const result = migrateFromFSRS({
            stability: 3,
            difficulty: 6,
            reps: 1,
            lapses: 0,
            state: "learning",
            last_review: daysAgo(5),
            due_date: daysAgo(2),
        });

        expect(result.state).toBe("learning");
    });
});

// ─── Step progression & difficulty ────────────────────────────────────

describe("Step and difficulty evolution", () => {

    it("Easy advances 2 steps and decreases difficulty", () => {
        const state = makeState({ step: 2, difficulty: 6.0, lastReview: daysAgo(7) });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(4); // 2 + 2
        expect(result.nextState.difficulty).toBeLessThan(6.0);
    });

    it("Good advances 1 step and decreases difficulty", () => {
        const state = makeState({ step: 2, difficulty: 6.0, lastReview: daysAgo(7) });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(3); // 2 + 1
        expect(result.nextState.difficulty).toBeLessThan(6.0);
    });

    it("Hard keeps the same step and increases difficulty", () => {
        const state = makeState({ step: 3, difficulty: 5.0, lastReview: daysAgo(14) });
        const result = evaluateSEM(state, 0.66, 5000);

        expect(result.grade).toBe(SEMGrade.Hard);
        expect(result.nextState.step).toBe(3); // unchanged
        expect(result.nextState.difficulty).toBeGreaterThan(5.0);
    });

    it("Again goes back 2 steps and increments lapses", () => {
        const state = makeState({ step: 4, difficulty: 5.0, lapses: 0, lastReview: daysAgo(14) });
        const result = evaluateSEM(state, 0.33, 5000);

        expect(result.grade).toBe(SEMGrade.Again);
        expect(result.nextState.step).toBe(2); // 4 - 2
        expect(result.nextState.difficulty).toBeGreaterThan(5.0);
        expect(result.nextState.lapses).toBe(1);
    });

    it("Easy at step 6 (max - 1) produces 'mastered'", () => {
        const state = makeState({ step: 6, lastReview: daysAgo(150) });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.nextState.state).toBe("mastered");
        expect(result.isMastered).toBe(true);
    });

    it("step is clamped at SEM_MAX_STEP (7)", () => {
        const state = makeState({ step: 7, lastReview: daysAgo(365) });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.nextState.step).toBe(7);
    });
});

// ─── State bookkeeping ────────────────────────────────────────────────

describe("State bookkeeping", () => {

    it("lastReview is set to now after any review", () => {
        const before = Date.now();
        const state = makeState({ lastReview: daysAgo(10) });
        const result = evaluateSEM(state, 1.0, 3000);
        const after = Date.now();

        const reviewTime = new Date(result.nextState.lastReview!).getTime();
        expect(reviewTime).toBeGreaterThanOrEqual(before);
        expect(reviewTime).toBeLessThanOrEqual(after);
    });

    it("dueDate is always strictly in the future for all grades", () => {
        const now = new Date();
        const state = makeState({ lastReview: daysAgo(14) });

        for (const [accuracy, timeMs] of [[1.0, 2000], [1.0, 5000], [0.66, 5000]]) {
            const result = evaluateSEM(state, accuracy as number, timeMs as number);
            expect(new Date(result.nextState.dueDate).getTime()).toBeGreaterThan(now.getTime());
        }
    });
});
