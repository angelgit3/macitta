import { describe, expect, it } from "vitest";
import {
    aggregateListeningProgress,
    buildListeningQueue,
    createEmptyListeningQuestionProgress,
    createEmptyListeningSkillProgress,
    evaluateListeningAnswer,
} from "./listening";
import { LISTENING_QUESTIONS, LISTENING_UNITS } from "./listeningBank";

const NOW = new Date("2026-07-29T12:00:00.000Z");
const quickUnit = LISTENING_UNITS.find((unit) => unit.kind === "quick")!;
const quickQuestion = LISTENING_QUESTIONS.find((question) => question.unit_id === quickUnit.id)!;

describe("Listening two-point scoring", () => {
    it("cleans a first-listen correct response", () => {
        const result = evaluateListeningAnswer(
            createEmptyListeningQuestionProgress("user", quickQuestion.id),
            createEmptyListeningSkillProgress("user", quickQuestion.primary_skill_code),
            true,
            1,
            NOW,
        );
        expect(result.earnedPoints).toBe(2);
        expect(result.questionProgress.points).toBe(2);
    });

    it("awards only one point after a replay and requires a later recovery", () => {
        const first = evaluateListeningAnswer(
            createEmptyListeningQuestionProgress("user", quickQuestion.id),
            createEmptyListeningSkillProgress("user", quickQuestion.primary_skill_code),
            true,
            2,
            NOW,
        );
        const second = evaluateListeningAnswer(
            first.questionProgress,
            first.skillProgress,
            true,
            1,
            new Date("2026-07-31T12:00:00.000Z"),
        );
        expect(first.earnedPoints).toBe(1);
        expect(first.questionProgress.points).toBe(1);
        expect(second.questionProgress.points).toBe(2);
    });

    it("sends an incorrect response back to immediate recovery", () => {
        const result = evaluateListeningAnswer(
            { ...createEmptyListeningQuestionProgress("user", quickQuestion.id), points: 1, attempts: 1 },
            createEmptyListeningSkillProgress("user", quickQuestion.primary_skill_code),
            false,
            1,
            NOW,
        );
        expect(result.questionProgress.points).toBe(0);
        expect(result.questionProgress.dueAt).toBe(NOW.toISOString());
    });
});

describe("Listening adaptive queues", () => {
    it("forms five distinct short listening prompts for a new learner", () => {
        const candidates = LISTENING_QUESTIONS
            .filter((question) => LISTENING_UNITS.some((unit) => unit.id === question.unit_id && unit.kind === "quick"))
            .map((question) => ({ unit: LISTENING_UNITS.find((unit) => unit.id === question.unit_id)!, question }));
        const queue = buildListeningQueue(candidates, { userId: "new-user", mode: "quick", now: NOW });
        expect(queue).toHaveLength(5);
        expect(new Set(queue.map((item) => item.unit.id)).size).toBe(5);
    });

    it("keeps all five questions from exactly one long audio together", () => {
        const candidates = LISTENING_QUESTIONS.map((question) => ({
            unit: LISTENING_UNITS.find((unit) => unit.id === question.unit_id)!,
            question,
        }));
        const queue = buildListeningQueue(candidates, { userId: "new-user", mode: "long", now: NOW });
        expect(queue).toHaveLength(5);
        expect(new Set(queue.map((item) => item.unit.id)).size).toBe(1);
        expect(queue.every((item) => item.unit.kind === "long")).toBe(true);
    });

    it("does not surface a recovering exact item before it is due", () => {
        const progress = {
            ...createEmptyListeningQuestionProgress("user", quickQuestion.id),
            attempts: 1,
            dueAt: "2026-07-29T12:30:00.000Z",
        };
        const queue = buildListeningQueue([{ unit: quickUnit, question: quickQuestion, progress }], {
            userId: "user", mode: "quick", now: NOW,
        });
        expect(queue).toHaveLength(0);
    });
});

describe("Listening catalog progress", () => {
    it("reports clean and recovery counts independently", () => {
        const first = { ...createEmptyListeningQuestionProgress("user", LISTENING_QUESTIONS[0].id), points: 2 as const, attempts: 1 };
        const second = { ...createEmptyListeningQuestionProgress("user", LISTENING_QUESTIONS[1].id), attempts: 1 };
        expect(aggregateListeningProgress(LISTENING_QUESTIONS.slice(0, 2), [first, second])).toEqual({
            total: 2, clean: 1, started: 2, recovery: 1, percent: 50,
        });
    });
});
