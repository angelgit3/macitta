import { describe, expect, it } from "vitest";
import {
    aggregateGrammarProgress,
    buildGrammarQueue,
    createEmptyGrammarProgress,
    evaluateGrammarReview,
    grammarProgressLabel,
    validateGrammarExercise,
    validateGrammarPrompt,
    type GrammarExercise,
    type GrammarProgress,
    type GrammarQueueCandidate,
} from "./grammar";
import { createEmptySEMState, SEMGrade } from "./sem";

const NOW = new Date("2026-07-28T12:00:00.000Z");

function exercise(
    id: string,
    overrides: Partial<GrammarExercise> = {},
): GrammarExercise {
    return {
        id,
        primary_skill_id: `skill-${id}`,
        domain_id: `domain-${Number(id.replace(/\D/g, "")) % 4}`,
        skill_code: `SKILL_${id}`,
        format: "sentence_completion",
        cefr_band: "B1",
        difficulty: 1,
        prompt: {
            kind: "sentence_completion",
            before: "The results ",
            after: " yesterday.",
            options: [
                { id: "A", text: "were published" },
                { id: "B", text: "publishes" },
                { id: "C", text: "publishing" },
                { id: "D", text: "has publish" },
            ],
        },
        correct_option_id: "A",
        corrected_sentence: "The results were published yesterday.",
        explanation_es: "El pasado pasivo requiere were seguido del participio published.",
        status: "published",
        content_version: 1,
        linguistic_reviewed: true,
        fairness_reviewed: true,
        ...overrides,
    };
}

function progress(id: string, overrides: Partial<GrammarProgress> = {}): GrammarProgress {
    return {
        ...createEmptyGrammarProgress("user-1", id),
        dueDate: "2026-07-27T12:00:00.000Z",
        ...overrides,
    };
}

describe("Grammar prompt validation", () => {
    it("accepts a valid sentence completion payload", () => {
        expect(validateGrammarExercise(exercise("1"))).toEqual({ valid: true, issues: [] });
    });

    it("rejects duplicate completion options", () => {
        const invalid = exercise("2");
        invalid.prompt = {
            kind: "sentence_completion",
            before: "The results ",
            after: ".",
            options: [
                { id: "A", text: "were published" },
                { id: "B", text: "were published" },
                { id: "C", text: "publish" },
                { id: "D", text: "publishing" },
            ],
        };
        expect(validateGrammarExercise(invalid).valid).toBe(false);
    });

    it("accepts exactly four selectable error segments", () => {
        expect(validateGrammarPrompt("error_identification", {
            kind: "error_identification",
            segments: [
                { text: "The reports " },
                { text: "was", optionId: "A" },
                { text: " carefully", optionId: "B" },
                { text: " checked", optionId: "C" },
                { text: " yesterday", optionId: "D" },
                { text: "." },
            ],
        }).valid).toBe(true);
    });

    it("blocks publication until both editorial reviews are complete", () => {
        expect(validateGrammarExercise(exercise("3", { fairness_reviewed: false })).issues)
            .toContainEqual(expect.objectContaining({ path: "status" }));
    });
});

describe("Grammar SREM adapter", () => {
    it("maps correct to Good and ignores response speed", () => {
        const result = evaluateGrammarReview(createEmptySEMState(), true, NOW);
        expect(result.grade).toBe(SEMGrade.Good);
        expect(result.nextState.step).toBe(1);
    });

    it("maps incorrect to Again", () => {
        const result = evaluateGrammarReview(createEmptySEMState(), false, NOW);
        expect(result.grade).toBe(SEMGrade.Again);
        expect(result.nextState.step).toBe(0);
        expect(result.nextState.lapses).toBe(1);
    });

    it("requires two separate eligible reviews to become completed", () => {
        const first = evaluateGrammarReview(createEmptySEMState(), true, NOW);
        expect(grammarProgressLabel(first.nextState.step)).toBe("learning");
        const second = evaluateGrammarReview(first.nextState, true, new Date("2026-07-29T12:00:00.000Z"));
        expect(second.nextState.step).toBe(2);
        expect(grammarProgressLabel(second.nextState.step)).toBe("completed");
    });
});

describe("Adaptive Grammar queue", () => {
    it("puts due work before new work and caps new items at two", () => {
        const candidates: GrammarQueueCandidate[] = [
            ...["1", "2", "3"].map((id) => ({ exercise: exercise(id), progress: progress(id) })),
            ...["4", "5", "6", "7"].map((id) => ({ exercise: exercise(id) })),
        ];
        const queue = buildGrammarQueue(candidates, { userId: "user-1", now: NOW });
        expect(queue).toHaveLength(5);
        expect(queue.filter((item) => item.reason === "new")).toHaveLength(2);
        expect(queue.slice(0, 3).every((item) => item.reason !== "new")).toBe(true);
    });

    it("does not let format balancing move a new item ahead of due work", () => {
        const dueCompletion = ["1", "2", "3"].map((id) => ({
            exercise: exercise(id),
            progress: progress(id),
        }));
        const newErrors = ["4", "5"].map((id) => ({
            exercise: exercise(id, {
                format: "error_identification",
                prompt: {
                    kind: "error_identification" as const,
                    segments: [
                        { text: "Reports ", optionId: "A" as const },
                        { text: "was ", optionId: "B" as const },
                        { text: "checked ", optionId: "C" as const },
                        { text: "yesterday.", optionId: "D" as const },
                    ],
                },
            }),
        }));
        const queue = buildGrammarQueue([...dueCompletion, ...newErrors], { userId: "user-1", now: NOW });
        expect(queue.slice(0, 3).every((item) => item.reason !== "new")).toBe(true);
    });

    it("gives a brand-new learner a complete group of five", () => {
        const candidates = Array.from({ length: 8 }, (_, index) => ({
            exercise: exercise(String(index + 1)),
        }));
        expect(buildGrammarQueue(candidates, { userId: "new-user", now: NOW })).toHaveLength(5);
    });

    it("never queues retired content", () => {
        const queue = buildGrammarQueue([
            { exercise: exercise("1", { status: "retired" }), progress: progress("1") },
            { exercise: exercise("2"), progress: progress("2") },
        ], { userId: "user-1", now: NOW });
        expect(queue.map((item) => item.exercise.id)).toEqual(["2"]);
    });

    it("is deterministic for the same user, date, and session number", () => {
        const candidates = Array.from({ length: 8 }, (_, index) => ({
            exercise: exercise(String(index + 1)),
        }));
        const options = { userId: "user-1", now: NOW, sessionNumber: 3 };
        expect(buildGrammarQueue(candidates, options).map((item) => item.exercise.id))
            .toEqual(buildGrammarQueue(candidates, options).map((item) => item.exercise.id));
    });

    it("keeps the preferred 3/2 format split when diversity allows it", () => {
        const candidates = Array.from({ length: 10 }, (_, index) => ({
            exercise: exercise(String(index + 1), {
                format: index < 5 ? "error_identification" : "sentence_completion",
                prompt: index < 5 ? {
                    kind: "error_identification" as const,
                    segments: [
                        { text: "Reports " },
                        { text: "was", optionId: "A" as const },
                        { text: " carefully", optionId: "B" as const },
                        { text: " checked", optionId: "C" as const },
                        { text: " yesterday", optionId: "D" as const },
                    ],
                } : exercise("x").prompt,
            }),
            progress: progress(String(index + 1)),
        }));
        const queue = buildGrammarQueue(candidates, { userId: "user-1", now: NOW });
        expect(queue.filter((item) => item.exercise.format === "error_identification")).toHaveLength(3);
        expect(queue.filter((item) => item.exercise.format === "sentence_completion")).toHaveLength(2);
    });
});

describe("Grammar progress aggregation", () => {
    it("aggregates completion, mastery, due work, and accuracy by domain", () => {
        const exercises = [exercise("1", { domain_id: "syntax" }), exercise("2", { domain_id: "syntax" })];
        const rows = [
            progress("1", { step: 2, correctAttempts: 2, totalAttempts: 3 }),
            progress("2", { step: 8, correctAttempts: 4, totalAttempts: 4 }),
        ];
        expect(aggregateGrammarProgress(exercises, rows, NOW)).toEqual([{
            domainId: "syntax",
            seen: 2,
            completed: 2,
            mastered: 1,
            due: 2,
            correctAttempts: 6,
            totalAttempts: 7,
        }]);
    });
});
