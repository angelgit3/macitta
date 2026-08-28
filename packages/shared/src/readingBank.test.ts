import { describe, expect, it } from "vitest";
import {
    auditReadingCatalog,
    createReadingCatalog,
    READING_CATALOG,
} from "./readingBank";
import { ARTS_PASSAGES } from "./readingBankSeeds/arts";

describe("Reading authored catalog", () => {
    it("passes structural and editorial publication gates", () => {
        expect(auditReadingCatalog(READING_CATALOG)).toEqual([]);
    });

    it("ships the complete v1 bank with short, standard, and long work", () => {
        expect(READING_CATALOG.passages).toHaveLength(40);
        expect(READING_CATALOG.questions).toHaveLength(250);
        expect(READING_CATALOG.passages[0].id).toBe("60000000-0000-4000-8000-000000000001");
        expect(READING_CATALOG.passages.at(-1)?.id).toBe("60000000-0000-4000-8000-000000000040");
        expect(READING_CATALOG.questions[0].id).toBe("70000000-0000-4000-8000-000000000001");
        expect(READING_CATALOG.questions.at(-1)?.id).toBe("70000000-0000-4000-8000-000000000250");
        expect(
            READING_CATALOG.passages.filter((passage) => passage.length_band === "long"),
        ).toHaveLength(10);
        expect(new Set(READING_CATALOG.passages.map((passage) => passage.title)).size)
            .toBe(40);
        expect(new Set(READING_CATALOG.passages.map((passage) => passage.topic_es)).size)
            .toBe(40);

        const passagesByGenre = new Map<string, number>();
        for (const passage of READING_CATALOG.passages) {
            passagesByGenre.set(
                passage.genre,
                (passagesByGenre.get(passage.genre) ?? 0) + 1,
            );
        }
        expect([...passagesByGenre.values()]).toEqual([8, 8, 8, 8, 8]);
    });

    it("keeps authored passage and question ids when seeds are reordered", () => {
        const original = createReadingCatalog(ARTS_PASSAGES);
        const reordered = createReadingCatalog([...ARTS_PASSAGES].reverse());
        expect(new Set(reordered.passages.map((passage) => passage.id)))
            .toEqual(new Set(original.passages.map((passage) => passage.id)));
        expect(new Set(reordered.questions.map((question) => question.id)))
            .toEqual(new Set(original.questions.map((question) => question.id)));
    });

    it("covers every skill with enough transfer items", () => {
        const questionsBySkill = new Map<string, number>();
        for (const question of READING_CATALOG.questions) {
            questionsBySkill.set(
                question.skill_code,
                (questionsBySkill.get(question.skill_code) ?? 0) + 1,
            );
        }
        expect(questionsBySkill.size).toBe(READING_CATALOG.skills.length);
        expect(Math.min(...questionsBySkill.values())).toBeGreaterThanOrEqual(10);
    });

    it("makes every five-question block internally varied", () => {
        for (const passage of READING_CATALOG.passages) {
            const blocks = passage.length_band === "long" ? [1, 2] : [1];
            for (const block of blocks) {
                const questions = READING_CATALOG.questions.filter(
                    (question) =>
                        question.passage_id === passage.id &&
                        question.block_index === block,
                );
                expect(new Set(questions.map((question) => question.skill_code)).size)
                    .toBe(5);
                expect(new Set(questions.map((question) => question.domain_id)).size)
                    .toBeGreaterThanOrEqual(3);
            }
        }
    });
});
