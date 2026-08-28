import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GRAMMAR_CATALOG } from "./grammarBank";
import { READING_CATALOG } from "./readingBank";
import {
    auditGrammarEditorialQuality,
    auditReadingEditorialQuality,
    findSharedWordSequence,
} from "./contentQuality";

const REFERENCE_FILES = [
    "completar_con_el_correcto.md",
    "elegir_el_incorrecto.md",
    "lecturas.md",
];

function referenceCorpus(): string {
    return REFERENCE_FILES.map((name) =>
        readFileSync(resolve(process.cwd(), "../../Documentos extra", name), "utf8")
    ).join("\n");
}

describe("Grammar and Reading editorial quality", () => {
    it("passes the automated Grammar editorial audit", () => {
        expect(auditGrammarEditorialQuality(GRAMMAR_CATALOG.exercises)).toEqual([]);
    });

    it("passes the automated Reading editorial audit", () => {
        expect(auditReadingEditorialQuality(
            READING_CATALOG.passages,
            READING_CATALOG.questions,
        )).toEqual([]);
    });

    it("does not publish long verbatim sequences from the reference extracts", () => {
        const references = referenceCorpus();
        const published = [
            ...GRAMMAR_CATALOG.exercises.flatMap((exercise) => [
                exercise.corrected_sentence,
                exercise.prompt.kind === "sentence_completion"
                    ? exercise.prompt.options.map((option) => option.text).join(" ")
                    : exercise.prompt.segments.map((segment) => segment.text).join(" "),
            ]),
            ...READING_CATALOG.passages.map((passage) => passage.body),
            ...READING_CATALOG.questions.flatMap((question) => [
                question.prompt,
                question.options.map((option) => option.text).join(" "),
            ]),
        ];
        const overlaps = published
            .map((text) => findSharedWordSequence(text, references, 12))
            .filter((sequence): sequence is string => sequence !== null);
        expect(overlaps).toEqual([]);
    });

    it("contains no pending review content in the published catalogs", () => {
        expect(GRAMMAR_CATALOG.exercises.every((item) => item.status === "published")).toBe(true);
        expect(READING_CATALOG.passages.every((item) => item.status === "published")).toBe(true);
        expect(READING_CATALOG.questions.every((item) => item.status === "published")).toBe(true);
    });
});
