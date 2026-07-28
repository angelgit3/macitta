import { READING_CATALOG, auditReadingCatalog } from "../packages/shared/src/readingBank.ts";

const issues = auditReadingCatalog(READING_CATALOG);
const stemCounts = new Map();
const optionLengthOutliers = [];
const paragraphReferenceMismatches = [];
const blockProfiles = [];
const nearDuplicateOptions = [];
const stopWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "because", "by", "for",
    "from", "has", "in", "is", "it", "of", "on", "or", "that", "the",
    "their", "they", "this", "to", "was", "were", "with",
]);

function contentWords(value) {
    return new Set(
        value
            .toLocaleLowerCase("en")
            .replace(/[^a-z0-9\s-]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2 && !stopWords.has(word)),
    );
}

function jaccard(left, right) {
    const intersection = [...left].filter((word) => right.has(word)).length;
    const union = new Set([...left, ...right]).size;
    return union === 0 ? 0 : intersection / union;
}

for (const question of READING_CATALOG.questions) {
    const stem = question.prompt
        .toLocaleLowerCase("en")
        .replace(/[“”‘’'"?.!,]/g, "")
        .split(/\s+/)
        .slice(0, 5)
        .join(" ");
    stemCounts.set(stem, (stemCounts.get(stem) ?? 0) + 1);

    const lengths = question.options.map((option) => option.text.split(/\s+/).length);
    if (Math.max(...lengths) - Math.min(...lengths) >= 10) {
        optionLengthOutliers.push({
            prompt: question.prompt,
            lengths,
        });
    }

    const referencedParagraph = question.prompt.match(/\bparagraph\s+(\d+)\b/i);
    if (
        referencedParagraph &&
        Number(referencedParagraph[1]) !== question.evidence.paragraph &&
        question.skill_code !== "READ_NEGATIVE_DETAIL"
    ) {
        paragraphReferenceMismatches.push({
            prompt: question.prompt,
            promptParagraph: Number(referencedParagraph[1]),
            evidenceParagraph: question.evidence.paragraph,
        });
    }
    for (let leftIndex = 0; leftIndex < question.options.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < question.options.length; rightIndex += 1) {
            const left = question.options[leftIndex];
            const right = question.options[rightIndex];
            const leftWords = contentWords(left.text);
            const rightWords = contentWords(right.text);
            const similarity = jaccard(leftWords, rightWords);
            if (Math.min(leftWords.size, rightWords.size) >= 3 && similarity >= 0.75) {
                nearDuplicateOptions.push({
                    prompt: question.prompt,
                    options: [left.id, right.id],
                    similarity: Number(similarity.toFixed(2)),
                });
            }
        }
    }
}

for (const passage of READING_CATALOG.passages) {
    const blocks = passage.length_band === "long" ? [1, 2] : [1];
    for (const block of blocks) {
        const questions = READING_CATALOG.questions.filter(
            (question) => question.passage_id === passage.id && question.block_index === block,
        );
        blockProfiles.push({
            passage: passage.slug,
            block,
            skills: new Set(questions.map((question) => question.skill_code)).size,
            domains: new Set(questions.map((question) => question.domain_id)).size,
            difficulties: [...new Set(questions.map((question) => question.difficulty))].sort(),
            stems: new Set(
                questions.map((question) =>
                    question.prompt.toLocaleLowerCase("en").split(/\s+/).slice(0, 5).join(" "),
                ),
            ).size,
        });
    }
}

const repeatedStems = [...stemCounts.entries()]
    .filter(([, count]) => count >= 8)
    .sort((left, right) => right[1] - left[1]);

const weakBlocks = blockProfiles.filter(
    (profile) => profile.skills !== 5 || profile.domains < 3 || profile.stems !== 5,
);

if (optionLengthOutliers.length > 0) {
    issues.push({
        path: "questions.options",
        message: `${optionLengthOutliers.length} reactivos tienen una diferencia de 10+ palabras entre opciones.`,
    });
}
if (paragraphReferenceMismatches.length > 0) {
    issues.push({
        path: "questions.evidence",
        message: `${paragraphReferenceMismatches.length} reactivos remiten a un párrafo distinto de su evidencia.`,
    });
}
if (repeatedStems.some(([, count]) => count >= 20)) {
    issues.push({
        path: "questions.prompt",
        message: "Una misma apertura de enunciado aparece 20 veces o más.",
    });
}
if (weakBlocks.length > 0) {
    issues.push({
        path: "questions.blocks",
        message: `${weakBlocks.length} bloques no alcanzan la variedad interna requerida.`,
    });
}
if (nearDuplicateOptions.length > 0) {
    issues.push({
        path: "questions.options",
        message: `${nearDuplicateOptions.length} pares de opciones son léxicamente demasiado similares.`,
    });
}

console.log(JSON.stringify({
    passages: READING_CATALOG.passages.length,
    questions: READING_CATALOG.questions.length,
    repeatedStems,
    optionLengthOutliers,
    paragraphReferenceMismatches,
    blockSummary: {
        total: blockProfiles.length,
        fiveDistinctSkills: blockProfiles.filter((profile) => profile.skills === 5).length,
        threeOrMoreDomains: blockProfiles.filter((profile) => profile.domains >= 3).length,
        fiveDistinctStems: blockProfiles.filter((profile) => profile.stems === 5).length,
        mixedDifficulty: blockProfiles.filter((profile) => profile.difficulties.length >= 2).length,
    },
    weakBlocks,
    nearDuplicateOptions,
    issues,
}, null, 2));

if (issues.length > 0) process.exitCode = 1;
