import { describe, expect, it } from "vitest";
import { auditAuthoredErrorKeys, GRAMMAR_CATALOG } from "./grammarBank";
import { buildGrammarQueue, validateGrammarExercise, type GrammarOptionId } from "./grammar";

function normalized(value: string) {
    return value
        .replace(/\s+/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .trim();
}

describe("Grammar editorial bank", () => {
    it("contains the frozen 7-domain, 35-skill, 350-exercise catalog", () => {
        expect(GRAMMAR_CATALOG.domains).toHaveLength(7);
        expect(GRAMMAR_CATALOG.skills).toHaveLength(35);
        expect(GRAMMAR_CATALOG.exercises).toHaveLength(350);
        expect(GRAMMAR_CATALOG.exercises[0].id).toBe("30000000-0000-4000-8000-000000000001");
        expect(GRAMMAR_CATALOG.exercises.at(-1)?.id).toBe("30000000-0000-4000-8000-000000000350");
    });

    it("gives every skill four completion and six error-identification items", () => {
        for (const skill of GRAMMAR_CATALOG.skills) {
            const exercises = GRAMMAR_CATALOG.exercises.filter((item) => item.primary_skill_id === skill.id);
            expect(exercises, skill.code).toHaveLength(10);
            expect(exercises.filter((item) => item.format === "sentence_completion"), skill.code).toHaveLength(4);
            expect(exercises.filter((item) => item.format === "error_identification"), skill.code).toHaveLength(6);
        }
    });

    it("passes every structural and publication review gate", () => {
        const failures = GRAMMAR_CATALOG.exercises.flatMap((exercise) => {
            const result = validateGrammarExercise(exercise);
            return result.issues.map((issue) => `${exercise.id} ${exercise.skill_code} ${issue.path}: ${issue.message}`);
        });
        expect(failures).toEqual([]);
    });

    it("assembles every completion key into its reviewed corrected sentence", () => {
        const failures = GRAMMAR_CATALOG.exercises
            .filter((exercise) => exercise.prompt.kind === "sentence_completion")
            .flatMap((exercise) => {
                if (exercise.prompt.kind !== "sentence_completion") return [];
                const answer = exercise.prompt.options.find((option) => option.id === exercise.correct_option_id);
                const insertion = answer?.text === "—" ? "" : answer?.text ?? "";
                const assembled = normalized(`${exercise.prompt.before}${insertion}${exercise.prompt.after}`);
                return assembled === normalized(exercise.corrected_sentence)
                    ? []
                    : [`${exercise.id}: "${assembled}" != "${normalized(exercise.corrected_sentence)}"`];
            });
        expect(failures).toEqual([]);
    });

    it("makes every error sentence materially different from its correction", () => {
        const failures = GRAMMAR_CATALOG.exercises
            .filter((exercise) => exercise.prompt.kind === "error_identification")
            .filter((exercise) => exercise.prompt.kind === "error_identification" &&
                normalized(exercise.prompt.segments.map((segment) => segment.text).join(" ")) ===
                normalized(exercise.corrected_sentence)
            )
            .map((exercise) => exercise.id);
        expect(failures).toEqual([]);
    });

    it("marks an authored segment that actually contains the linguistic change", () => {
        expect(auditAuthoredErrorKeys()).toEqual([]);
    });

    it("contains no duplicate ids or corrected sentences", () => {
        expect(new Set(GRAMMAR_CATALOG.exercises.map((item) => item.id)).size).toBe(350);
        expect(new Set(GRAMMAR_CATALOG.exercises.map((item) => normalized(item.corrected_sentence).toLowerCase())).size).toBe(350);
    });

    it("balances answer keys and records two completed editorial reviews", () => {
        const counts = Object.fromEntries((["A", "B", "C", "D"] as GrammarOptionId[]).map((id) => [id, 0]));
        for (const exercise of GRAMMAR_CATALOG.exercises) {
            counts[exercise.correct_option_id] += 1;
            expect(exercise.linguistic_reviewed).toBe(true);
            expect(exercise.fairness_reviewed).toBe(true);
            expect(/[.!?]$/.test(exercise.corrected_sentence)).toBe(true);
        }
        expect(Math.max(...Object.values(counts)) - Math.min(...Object.values(counts))).toBeLessThanOrEqual(1);
    });

    it("does not claim official scoring or affiliation in exercise copy", () => {
        const corpus = JSON.stringify(GRAMMAR_CATALOG.exercises).toLowerCase();
        expect(corpus).not.toContain("official score");
        expect(corpus).not.toContain("ets affiliation");
        expect(corpus).not.toContain("puntaje oficial");
    });

    it("builds a real new-user group with three error items and two completion items", () => {
        const queue = buildGrammarQueue(
            GRAMMAR_CATALOG.exercises.map((exercise) => ({ exercise })),
            {
                userId: "00000000-0000-4000-8000-000000000001",
                now: new Date("2026-07-28T12:00:00.000Z"),
            },
        );
        expect(queue).toHaveLength(5);
        expect(queue.filter((item) => item.exercise.format === "error_identification")).toHaveLength(3);
        expect(queue.filter((item) => item.exercise.format === "sentence_completion")).toHaveLength(2);
    });
});
