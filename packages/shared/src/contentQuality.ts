import type { GrammarExercise } from "./grammar";
import type { ReadingPassage, ReadingQuestion } from "./reading";

export interface ContentQualityIssue {
    item: string;
    rule: string;
    message: string;
}

export function normalizeEditorialText(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("en")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function tokens(value: string): Set<string> {
    return new Set(normalizeEditorialText(value).split(" ").filter((word) => word.length > 2));
}

export function tokenJaccard(left: string, right: string): number {
    const a = tokens(left);
    const b = tokens(right);
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const word of a) if (b.has(word)) intersection += 1;
    return intersection / (a.size + b.size - intersection);
}

function duplicateAndSimilarityIssues(
    items: readonly { id: string; text: string }[],
    prefix: string,
): ContentQualityIssue[] {
    const issues: ContentQualityIssue[] = [];
    const normalized = items.map((item) => ({ ...item, normalized: normalizeEditorialText(item.text) }));
    const seen = new Map<string, string>();
    for (const item of normalized) {
        const prior = seen.get(item.normalized);
        if (prior) issues.push({ item: item.id, rule: `${prefix}_DUPLICATE`, message: `Duplica ${prior}.` });
        seen.set(item.normalized, item.id);
    }
    for (let left = 0; left < normalized.length; left += 1) {
        for (let right = left + 1; right < normalized.length; right += 1) {
            if (normalized[left].normalized.split(" ").length < 8 || normalized[right].normalized.split(" ").length < 8) continue;
            const similarity = tokenJaccard(normalized[left].text, normalized[right].text);
            if (similarity >= 0.88) {
                issues.push({
                    item: normalized[right].id,
                    rule: `${prefix}_NEAR_DUPLICATE`,
                    message: `Similitud ${similarity.toFixed(2)} con ${normalized[left].id}.`,
                });
            }
        }
    }
    return issues;
}

export function auditGrammarEditorialQuality(exercises: readonly GrammarExercise[]): ContentQualityIssue[] {
    const issues: ContentQualityIssue[] = duplicateAndSimilarityIssues(
        exercises.map((exercise) => ({ id: exercise.id, text: exercise.corrected_sentence })),
        "GRAMMAR",
    );
    for (const exercise of exercises) {
        if (exercise.status === "published" && (!exercise.linguistic_reviewed || !exercise.fairness_reviewed)) {
            issues.push({ item: exercise.id, rule: "GRAMMAR_REVIEW", message: "Publicado sin revisión completa." });
        }
        if (normalizeEditorialText(exercise.explanation_es).split(" ").length < 6) {
            issues.push({ item: exercise.id, rule: "GRAMMAR_EXPLANATION", message: "Explicación demasiado breve o genérica." });
        }
        if (exercise.prompt.kind === "sentence_completion") {
            const options = exercise.prompt.options.map((option) => normalizeEditorialText(option.text));
            if (new Set(options).size !== 4 || exercise.prompt.options.some((option) => option.text.trim().length === 0)) {
                issues.push({ item: exercise.id, rule: "GRAMMAR_OPTIONS", message: "Opciones vacías o repetidas." });
            }
        }
    }
    return issues;
}

export function auditReadingEditorialQuality(
    passages: readonly ReadingPassage[],
    questions: readonly ReadingQuestion[],
): ContentQualityIssue[] {
    const issues = duplicateAndSimilarityIssues(
        passages.map((passage) => ({ id: passage.id, text: passage.body })),
        "READING_PASSAGE",
    );
    issues.push(...duplicateAndSimilarityIssues(
        questions.map((question) => ({
            id: question.id,
            text: `${question.prompt} ${question.options.map((option) => option.text).join(" ")}`,
        })),
        "READING_QUESTION",
    ));
    const passagesById = new Map(passages.map((passage) => [passage.id, passage]));
    for (const passage of passages) {
        if (passage.status === "published" && (!passage.linguistic_reviewed || !passage.factual_reviewed || !passage.fairness_reviewed)) {
            issues.push({ item: passage.id, rule: "READING_PASSAGE_REVIEW", message: "Publicado sin revisión lingüística, factual y de fairness." });
        }
    }
    for (const question of questions) {
        const passage = passagesById.get(question.passage_id);
        if (!passage) continue;
        const optionTexts = question.options.map((option) => normalizeEditorialText(option.text));
        if (new Set(optionTexts).size !== 4 || optionTexts.some((option) => option.length === 0)) {
            issues.push({ item: question.id, rule: "READING_OPTIONS", message: "Opciones vacías o repetidas." });
        }
        if (normalizeEditorialText(question.explanation_es).split(" ").length < 6) {
            issues.push({ item: question.id, rule: "READING_EXPLANATION", message: "Explicación demasiado breve o genérica." });
        }
        if (!normalizeEditorialText(passage.body).includes(normalizeEditorialText(question.evidence.quote))) {
            issues.push({ item: question.id, rule: "READING_EVIDENCE", message: "La evidencia no aparece literalmente en el pasaje." });
        }
        if (question.status === "published" && (!question.linguistic_reviewed || !question.fairness_reviewed)) {
            issues.push({ item: question.id, rule: "READING_QUESTION_REVIEW", message: "Publicado sin revisión completa." });
        }
    }
    return issues;
}

export function findSharedWordSequence(left: string, right: string, minimumWords = 12): string | null {
    const leftWords = normalizeEditorialText(left).split(" ").filter(Boolean);
    const rightText = ` ${normalizeEditorialText(right)} `;
    for (let index = 0; index <= leftWords.length - minimumWords; index += 1) {
        const sequence = leftWords.slice(index, index + minimumWords).join(" ");
        if (rightText.includes(` ${sequence} `)) return sequence;
    }
    return null;
}
