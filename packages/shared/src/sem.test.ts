/**
 * sem.test.ts — SREM Scheduling Engine Tests
 *
 * Tests organised by feature area. Each describe block focuses on one invariant
 * or one enhancement introduced in feature/srem-enhancements.
 *
 * ─── Core invariants ──────────────────────────────────────────────────────────
 * 1. Good/Easy → interval = SEM_GROWTH_STEPS[nextStep] × difficultyFactor.
 *    Late study does NOT inflate the interval (today-anchor = implicit fairness).
 * 2. Hard/Again → penalty on elapsedDays (real time since lastReview).
 * 3. After Hard, step is recalibrated to stay in sync with the new interval.
 * 4. Card difficulty modulates the curve interval (±~27% at extremes).
 * 5. Lapse history caps Easy to +1 step instead of +2.
 * 6. SEM_GROWTH_STEPS = [0,1,3,7,16,35,75,150,365], SEM_MAX_STEP = 8.
 * 7. dueDate is always strictly in the future.
 */

import { describe, it, expect } from "vitest";
import {
    evaluateSEM,
    migrateFromFSRS,
    createEmptySEMState,
    calculateSEMGrade,
    SEM_GROWTH_STEPS,
    SEM_MAX_STEP,
    SEMGrade,
    type SEMCardState,
    type SEMTimeThresholds,
} from "./sem";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

/** Minimal SEMCardState with sane defaults (step=1, on-time, mid-difficulty). */
function makeState(overrides: Partial<SEMCardState> = {}): SEMCardState {
    return {
        step: 1,
        interval: SEM_GROWTH_STEPS[1], // 1
        difficulty: 5.0,
        lapses: 0,
        state: "learning",
        lastReview: daysAgo(1), // on-time for step 1 (1-day interval)
        dueDate: new Date().toISOString(),
        ...overrides,
    };
}

/**
 * How many whole days from now until the result's dueDate.
 * Math.round absorbs sub-millisecond timing jitter.
 */
function daysUntilDue(result: ReturnType<typeof evaluateSEM>): number {
    const ms = new Date(result.nextState.dueDate).getTime() - Date.now();
    return Math.round(ms / 86_400_000);
}

// ─── #6 — Growth curve ────────────────────────────────────────────────────────

describe("Growth curve (feature #6)", () => {

    it("SEM_GROWTH_STEPS has 9 values: [0,1,3,7,16,35,75,150,365]", () => {
        expect(SEM_GROWTH_STEPS).toEqual([0, 1, 3, 7, 16, 35, 75, 150, 365]);
    });

    it("SEM_MAX_STEP = 8", () => {
        expect(SEM_MAX_STEP).toBe(8);
    });

    it("Good on brand-new card: step 0→1, interval = 1 day", () => {
        const result = evaluateSEM(createEmptySEMState(), 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(1);
        expect(result.nextState.interval).toBe(1);
        expect(daysUntilDue(result)).toBe(1);
    });

    it("Easy on brand-new card: step 0→2, interval = 3 days", () => {
        const result = evaluateSEM(createEmptySEMState(), 1.0, 1500);

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(2);
        expect(result.nextState.interval).toBe(3);
        expect(daysUntilDue(result)).toBe(3);
    });

    it("Ideal 8-session progression with Good hits Mastered at step 8", () => {
        let state = createEmptySEMState();
        const intervals: number[] = [];

        for (let session = 0; session < 8; session++) {
            state = { ...state, lastReview: new Date().toISOString() };
            const result = evaluateSEM(state, 1.0, 4000); // Good each time
            intervals.push(result.nextState.interval);
            state = result.nextState;
        }

        // Last session should be Mastered (step 8, interval ~365)
        expect(state.step).toBe(SEM_MAX_STEP);
        expect(state.state).toBe("mastered");
        // Verify the curve shape: each interval >= the previous
        for (let i = 1; i < intervals.length; i++) {
            expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
        }
    });
});

// ─── Good/Easy: curve drives the interval ─────────────────────────────────────

describe("Good/Easy — growth curve drives the interval", () => {

    it("Good (on-time, step 1): interval = SEM_GROWTH_STEPS[2] = 3", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(1) });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(2);
        expect(daysUntilDue(result)).toBe(3);
    });

    it("Good (late, 23 days): same interval as on-time — curve only", () => {
        const onTime = evaluateSEM(makeState({ step: 1, lastReview: daysAgo(1) }), 1.0, 4000);
        const late   = evaluateSEM(makeState({ step: 1, lastReview: daysAgo(23) }), 1.0, 4000);

        expect(daysUntilDue(onTime)).toBe(daysUntilDue(late));
    });

    it("Easy (on-time, step 1): step 1→3, interval = SEM_GROWTH_STEPS[3] = 7", () => {
        const state = makeState({ step: 1, lastReview: daysAgo(1) });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.grade).toBe(SEMGrade.Easy);
        expect(result.nextState.step).toBe(3);
        expect(daysUntilDue(result)).toBe(7);
    });

    it("Easy (late, 23 days): same interval as on-time", () => {
        const onTime = evaluateSEM(makeState({ step: 1, lastReview: daysAgo(1) }), 1.0, 1500);
        const late   = evaluateSEM(makeState({ step: 1, lastReview: daysAgo(23) }), 1.0, 1500);

        expect(daysUntilDue(onTime)).toBe(daysUntilDue(late));
    });

    it("dueDate is always in the future (= today + curveInterval) even for very late cards", () => {
        const state = makeState({ step: 3, lastReview: daysAgo(60) });
        const result = evaluateSEM(state, 1.0, 4000); // Good

        expect(new Date(result.nextState.dueDate).getTime()).toBeGreaterThan(Date.now());
    });
});

// ─── Hard/Again: elapsedDays drives the penalty ───────────────────────────────

describe("Hard/Again — real elapsed time drives penalties", () => {

    it("Hard (partial, 50%) penalises elapsed days, not stored interval — original bug", () => {
        // BUG: stored interval=1, elapsedDays=17 → old code: round(1*0.50)=1 day
        // FIX:                                  → new code: round(17*0.50)=9 days
        const state = makeState({ step: 1, interval: 1, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 0.66, 4000);

        expect(result.grade).toBe(SEMGrade.Hard);
        expect(daysUntilDue(result)).toBeGreaterThan(1);
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(8);
        expect(daysUntilDue(result)).toBeLessThanOrEqual(10);
    });

    it("Hard (slow, 15%): round(17 × 0.85) = 14 days", () => {
        const state = makeState({ step: 2, interval: 3, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 1.0, 9000);

        expect(result.grade).toBe(SEMGrade.Hard);
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(13);
        expect(daysUntilDue(result)).toBeLessThanOrEqual(15);
    });

    it("Again (total failure): resets to step 0, review tomorrow", () => {
        const result = evaluateSEM(makeState({ step: 5, lastReview: daysAgo(100) }), 0.0, 5000);

        expect(result.grade).toBe(SEMGrade.Again);
        expect(result.nextState.step).toBe(0);
        expect(daysUntilDue(result)).toBe(1);
    });

    it("Again (partial): cooldown scales with elapsed time, lapses incremented", () => {
        const state = makeState({ step: 3, interval: 7, lastReview: daysAgo(17) });
        const result = evaluateSEM(state, 0.33, 5000);

        expect(result.grade).toBe(SEMGrade.Again);
        expect(daysUntilDue(result)).toBeGreaterThanOrEqual(1);
        expect(result.nextState.lapses).toBe(1);
    });
});

// ─── #2 — Hard recalibrates step ──────────────────────────────────────────────

describe("Hard step recalibration (feature #2)", () => {

    it("step is recalibrated to match the penalised interval, not stuck at old step", () => {
        // step=4 (curve=35d), elapsed=20d, Hard partial (50%):
        // nextInterval = round(20 * 0.50) = 10
        // stepForInterval(10): SEM_GROWTH_STEPS = [...,7,16,...] → step 3 (7 ≤ 10 < 16)
        const state = makeState({ step: 4, interval: 35, lastReview: daysAgo(20) });
        const result = evaluateSEM(state, 0.66, 5000);

        expect(result.grade).toBe(SEMGrade.Hard);
        expect(result.nextState.interval).toBe(10);
        expect(result.nextState.step).toBe(3); // SEM_GROWTH_STEPS[3]=7 ≤ 10 < 16
    });

    it("Hard recalibration: after Hard, next Good advances one step from calibrated position", () => {
        // Same scenario as above, but now verify the next Good step is sane
        const hardState = makeState({ step: 4, interval: 35, lastReview: daysAgo(20) });
        const afterHard = evaluateSEM(hardState, 0.66, 5000);

        // nextStep after Hard = 3, interval = 10
        expect(afterHard.nextState.step).toBe(3);

        // Simulate a Good the next day
        const afterGood = evaluateSEM(
            { ...afterHard.nextState, lastReview: daysAgo(10) },
            1.0, 4000,
        );
        // Good from step 3 → step 4, SEM_GROWTH_STEPS[4] = 16
        expect(afterGood.nextState.step).toBe(4);
        expect(daysUntilDue(afterGood)).toBeGreaterThanOrEqual(11); // ~16 × diffFactor
    });

    it("Hard at step 0 stays at step 0 (cannot go below 0)", () => {
        const state = makeState({ step: 0, lastReview: daysAgo(5) });
        const result = evaluateSEM(state, 0.66, 5000);

        expect(result.nextState.step).toBeGreaterThanOrEqual(0);
    });
});

// ─── #1 — Difficulty modulates interval ───────────────────────────────────────

describe("Difficulty factor (feature #1)", () => {

    it("difficulty=1 gives a longer interval than difficulty=10 at the same step", () => {
        const base = { step: 3, lastReview: daysAgo(16) };
        const easy = makeState({ ...base, difficulty: 1.0 });
        const hard = makeState({ ...base, difficulty: 10.0 });

        const easyResult = evaluateSEM(easy, 1.0, 4000); // Good
        const hardResult = evaluateSEM(hard, 1.0, 4000);

        expect(easyResult.nextState.interval).toBeGreaterThan(hardResult.nextState.interval);
    });

    it("difficulty=5.5 (neutral) produces exactly the curve interval", () => {
        // difficultyFactor(5.5) = 1.0 → round(7 * 1.0) = 7
        const state = makeState({ step: 3, difficulty: 5.5, lastReview: daysAgo(16) });
        const result = evaluateSEM(state, 1.0, 4000); // Good → step 4, STEPS[4]=16

        expect(result.nextState.interval).toBe(SEM_GROWTH_STEPS[4]); // 16
    });

    it("difficulty=10 shortens the interval (factor ≈ 0.73)", () => {
        // step 3→4, STEPS[4]=16, factor=0.73 → round(16*0.73) = round(11.68) = 12
        const state = makeState({ step: 3, difficulty: 10.0, lastReview: daysAgo(16) });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.nextState.interval).toBeLessThan(SEM_GROWTH_STEPS[4]); // < 16
        expect(result.nextState.interval).toBeGreaterThanOrEqual(1);
    });

    it("difficulty=1 lengthens the interval (factor ≈ 1.27)", () => {
        // step 3→4, STEPS[4]=16, factor=1.27 → round(16*1.27) = round(20.32) = 20
        const state = makeState({ step: 3, difficulty: 1.0, lastReview: daysAgo(16) });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.nextState.interval).toBeGreaterThan(SEM_GROWTH_STEPS[4]); // > 16
    });

    it("difficulty factor is clamped: extreme values stay within reasonable range", () => {
        // Min interval = max(1, round(STEPS[1] * 0.5)) = max(1,1) = 1
        // Max interval = max(1, round(STEPS[8] * 1.5)) ≤ round(365*1.5) = 548
        const veryHard  = makeState({ step: 1, difficulty: 10.0 });
        const veryEasy  = makeState({ step: 8, difficulty: 1.0 });

        const hardResult = evaluateSEM(veryHard, 1.0, 4000);
        const easyResult = evaluateSEM(veryEasy, 1.0, 4000);

        expect(hardResult.nextState.interval).toBeGreaterThanOrEqual(1);
        expect(easyResult.nextState.interval).toBeLessThanOrEqual(548);
    });
});

// ─── #3 — Lapses cap Easy advancement ────────────────────────────────────────

describe("Lapse-capped advancement (feature #3)", () => {

    it("Easy with lapses=0: advances 2 steps", () => {
        const state = makeState({ step: 2, lapses: 0, difficulty: 5.5 });
        const result = evaluateSEM(state, 1.0, 1500); // Easy

        expect(result.nextState.step).toBe(4); // 2 + 2
    });

    it("Easy with lapses=1: advances only 1 step (same as Good)", () => {
        const state = makeState({ step: 2, lapses: 1, difficulty: 5.5 });
        const result = evaluateSEM(state, 1.0, 1500); // Easy

        expect(result.nextState.step).toBe(3); // 2 + 1 (capped)
    });

    it("Easy with lapses=5: still only advances 1 step", () => {
        const state = makeState({ step: 2, lapses: 5, difficulty: 5.5 });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.nextState.step).toBe(3);
    });

    it("Good advances 1 step regardless of lapses", () => {
        const withLapses    = makeState({ step: 2, lapses: 5 });
        const withoutLapses = makeState({ step: 2, lapses: 0 });

        expect(evaluateSEM(withLapses, 1.0, 4000).nextState.step).toBe(3);
        expect(evaluateSEM(withoutLapses, 1.0, 4000).nextState.step).toBe(3);
    });
});

// ─── #4/#6 — Edge case: interval never 0 ─────────────────────────────────────

describe("Edge case: interval is always ≥ 1 (features #4 + #6)", () => {

    it("migrateFromFSRS with stability=0 returns interval >= 1", () => {
        const result = migrateFromFSRS({
            stability: 0, difficulty: 5, reps: 0, lapses: 0,
            state: "new", last_review: null,
            due_date: new Date().toISOString(),
        });

        expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it("Hard on brand-new card (elapsedDays=1): at least 1 day", () => {
        const result = evaluateSEM(createEmptySEMState(), 0.66, 4000);
        expect(result.nextState.interval).toBeGreaterThanOrEqual(1);
    });

    it("SEM_GROWTH_STEPS[0] = 0 only for 'brand-new' marker; first reviewed card gets ≥ 1", () => {
        expect(SEM_GROWTH_STEPS[0]).toBe(0);    // new card marker (never reviewed)
        expect(SEM_GROWTH_STEPS[1]).toBe(1);    // first review → 1 day
    });
});

// ─── #5 — Configurable time thresholds ───────────────────────────────────────

describe("Configurable time thresholds (feature #5)", () => {

    it("default thresholds: 3000ms easy, 7000ms good", () => {
        expect(calculateSEMGrade(1.0, 2999)).toBe(SEMGrade.Easy);
        expect(calculateSEMGrade(1.0, 3000)).toBe(SEMGrade.Good);
        expect(calculateSEMGrade(1.0, 7000)).toBe(SEMGrade.Good);
        expect(calculateSEMGrade(1.0, 7001)).toBe(SEMGrade.Hard);
    });

    it("custom thresholds: longer windows grade differently", () => {
        const kanji: SEMTimeThresholds = { easy: 5000, good: 10000 };

        expect(calculateSEMGrade(1.0, 4000, kanji)).toBe(SEMGrade.Easy);  // < 5000 = Easy
        expect(calculateSEMGrade(1.0, 7000, kanji)).toBe(SEMGrade.Good);  // 5000-10000 = Good
        expect(calculateSEMGrade(1.0, 11000, kanji)).toBe(SEMGrade.Hard); // > 10000 = Hard
    });

    it("evaluateSEM accepts thresholds and grades accordingly", () => {
        const state = makeState({ step: 2 });
        const kanji: SEMTimeThresholds = { easy: 8000, good: 15000 };

        // 8000ms → Hard with default (> 7000), but Good with kanji (≤ 15000)
        const defaultResult = evaluateSEM(state, 1.0, 8000);
        const kanjiResult   = evaluateSEM(state, 1.0, 8000, kanji);

        expect(defaultResult.grade).toBe(SEMGrade.Hard);
        expect(kanjiResult.grade).toBe(SEMGrade.Good);
    });
});

// ─── migrateFromFSRS ──────────────────────────────────────────────────────────

describe("migrateFromFSRS", () => {

    it("preserves real stability (e.g. 14.5 → rounded to 15)", () => {
        const result = migrateFromFSRS({
            stability: 14.5, difficulty: 5, reps: 4, lapses: 0,
            state: "review", last_review: daysAgo(10), due_date: daysAgo(3),
        });

        expect(result.interval).toBe(15); // Math.round(14.5) = 15
        expect(result.step).toBeDefined();
    });

    it("falls back to max(1, curve step) if stability=0", () => {
        const result = migrateFromFSRS({
            stability: 0, difficulty: 5, reps: 0, lapses: 0,
            state: "new", last_review: null, due_date: new Date().toISOString(),
        });

        // SEM_GROWTH_STEPS[0]=0 → max(1, 0) = 1
        expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it("maps stability=365 to 'mastered'", () => {
        const result = migrateFromFSRS({
            stability: 365, difficulty: 2, reps: 10, lapses: 0,
            state: "review", last_review: daysAgo(200), due_date: daysAgo(150),
        });
        expect(result.state).toBe("mastered");
    });

    it("maps stability=1 (step 1 in new curve) to 'learning'", () => {
        // With new curve [0,1,3,...], stability=1 → step 1 (< 2) → 'learning'
        const result = migrateFromFSRS({
            stability: 1, difficulty: 6, reps: 1, lapses: 0,
            state: "learning", last_review: daysAgo(1), due_date: daysAgo(0),
        });
        expect(result.state).toBe("learning");
    });
});

// ─── Step progression & state ─────────────────────────────────────────────────

describe("Step progression and state evolution", () => {

    it("Easy (no lapses) advances 2 steps and decreases difficulty", () => {
        const state = makeState({ step: 2, difficulty: 6.0 });
        const result = evaluateSEM(state, 1.0, 1500);

        expect(result.nextState.step).toBe(4); // 2 + 2
        expect(result.nextState.difficulty).toBeLessThan(6.0);
    });

    it("Good advances 1 step and decreases difficulty", () => {
        const state = makeState({ step: 2, difficulty: 6.0 });
        const result = evaluateSEM(state, 1.0, 4000);

        expect(result.nextState.step).toBe(3); // 2 + 1
        expect(result.nextState.difficulty).toBeLessThan(6.0);
    });

    it("Hard keeps step recalibrated (not necessarily original step) and increases difficulty", () => {
        const state = makeState({ step: 3, difficulty: 5.0, lastReview: daysAgo(14) });
        const result = evaluateSEM(state, 0.66, 5000);

        expect(result.grade).toBe(SEMGrade.Hard);
        // step is recalibrated, not necessarily 3
        expect(result.nextState.step).toBeGreaterThanOrEqual(0);
        expect(result.nextState.difficulty).toBeGreaterThan(5.0);
    });

    it("Again (partial) goes back 2 steps and increments lapses", () => {
        const state = makeState({ step: 4, lapses: 0, lastReview: daysAgo(14) });
        const result = evaluateSEM(state, 0.33, 5000);

        expect(result.nextState.step).toBe(2); // 4 - 2
        expect(result.nextState.lapses).toBe(1);
        expect(result.nextState.difficulty).toBeGreaterThan(5.0);
    });

    it("Easy at step 7 (SEM_MAX_STEP - 1) produces 'mastered'", () => {
        const state = makeState({ step: 7, lapses: 0, lastReview: daysAgo(150) });
        const result = evaluateSEM(state, 1.0, 1500); // Easy → step 7+2=9 clamped to 8

        expect(result.nextState.state).toBe("mastered");
        expect(result.isMastered).toBe(true);
    });

    it("step is clamped at SEM_MAX_STEP (8)", () => {
        const state = makeState({ step: 8, lapses: 0, lastReview: daysAgo(365) });
        const result = evaluateSEM(state, 1.0, 1500); // Easy at max

        expect(result.nextState.step).toBe(8);
    });

    it("step 0 with lapses=0 is 'learning'", () => {
        const state = makeState({ step: 0, lapses: 0 });
        const result = evaluateSEM(state, 1.0, 4000);
        // After Good: step 0→1, still 'learning'
        expect(result.nextState.state).toBe("learning");
    });

    it("step 2 is 'review' (graduation from learning)", () => {
        const state = makeState({ step: 1, lapses: 0, lastReview: daysAgo(1) });
        const result = evaluateSEM(state, 1.0, 4000); // Good → step 2

        expect(result.nextState.step).toBe(2);
        expect(result.nextState.state).toBe("review");
    });
});

// ─── State bookkeeping ────────────────────────────────────────────────────────

describe("State bookkeeping", () => {

    it("lastReview is set to now after any review", () => {
        const before = Date.now();
        const result = evaluateSEM(makeState({ lastReview: daysAgo(10) }), 1.0, 3000);
        const after  = Date.now();

        const reviewTime = new Date(result.nextState.lastReview!).getTime();
        expect(reviewTime).toBeGreaterThanOrEqual(before);
        expect(reviewTime).toBeLessThanOrEqual(after);
    });

    it("dueDate is always strictly in the future for all grades", () => {
        const now = new Date();
        const state = makeState({ lastReview: daysAgo(14) });

        for (const [acc, ms] of [[1.0, 1500], [1.0, 4000], [1.0, 9000], [0.66, 5000]]) {
            const result = evaluateSEM(state, acc as number, ms as number);
            expect(new Date(result.nextState.dueDate).getTime()).toBeGreaterThan(now.getTime());
        }
    });
});
