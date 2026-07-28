import { READING_CATALOG, auditReadingCatalog } from "../packages/shared/src/readingBank.ts";

const issues = auditReadingCatalog(READING_CATALOG);
const stemCounts = new Map();
const optionLengthOutliers = [];
const paragraphReferenceMismatches = [];

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
}

const repeatedStems = [...stemCounts.entries()]
    .filter(([, count]) => count >= 8)
    .sort((left, right) => right[1] - left[1]);

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

console.log(JSON.stringify({
    passages: READING_CATALOG.passages.length,
    questions: READING_CATALOG.questions.length,
    repeatedStems,
    optionLengthOutliers,
    paragraphReferenceMismatches,
    issues,
}, null, 2));

if (issues.length > 0) process.exitCode = 1;
