import { describe, expect, it } from "vitest";
import {
    auditReadingCatalog,
    READING_CATALOG,
} from "./readingBank";

describe("Reading authored catalog", () => {
    it("passes structural and editorial publication gates", () => {
        expect(auditReadingCatalog(READING_CATALOG)).toEqual([]);
    });

    it("ships the complete v1 bank with short, standard, and long work", () => {
        expect(READING_CATALOG.passages).toHaveLength(40);
        expect(READING_CATALOG.questions).toHaveLength(250);
        expect(
            READING_CATALOG.passages.filter((passage) => passage.length_band === "long"),
        ).toHaveLength(10);

        const passagesByGenre = new Map<string, number>();
        for (const passage of READING_CATALOG.passages) {
            passagesByGenre.set(
                passage.genre,
                (passagesByGenre.get(passage.genre) ?? 0) + 1,
            );
        }
        expect([...passagesByGenre.values()]).toEqual([8, 8, 8, 8, 8]);
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
});
