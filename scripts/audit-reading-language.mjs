import { READING_CATALOG } from "../packages/shared/src/readingBank.ts";

const passagesByGenre = Map.groupBy(
    READING_CATALOG.passages,
    (passage) => passage.genre,
);
const questionsByPassage = Map.groupBy(
    READING_CATALOG.questions,
    (question) => question.passage_id,
);
const findings = [];
const tasks = [];
const requestedSlugs = new Set(
    (process.argv[2] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
);

async function checkText(body, label) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        const response = await fetch("https://api.languagetool.org/v2/check", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body,
            signal: AbortSignal.timeout(20_000),
        });
        if (response.ok) return response.json();
        if (attempt === 3 || response.status < 500) {
            throw new Error(`LanguageTool ${response.status} for ${label}`);
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
}

for (const [genre, passages] of passagesByGenre) {
    const sections = passages.map((passage) => {
        if (requestedSlugs.size > 0 && !requestedSlugs.has(passage.slug)) return null;
        const questions = questionsByPassage.get(passage.id) ?? [];
        return [
            `TITLE: ${passage.title}`,
            passage.body,
            ...questions.flatMap((question) => [
                `QUESTION: ${question.prompt}`,
                ...question.options.map((option) => `${option.id}. ${option.text}`),
            ]),
        ].join("\n");
    });
    for (const [index, text] of sections.entries()) {
        if (!text) continue;
        tasks.push({ genre, passage: passages[index].slug, index, text });
    }
}

let cursor = 0;
async function worker() {
    while (cursor < tasks.length) {
        const task = tasks[cursor];
        cursor += 1;
        const body = new URLSearchParams({
            language: "en-US",
            enabledOnly: "false",
            text: task.text,
        });
        const result = await checkText(body, `${task.genre}/${task.index + 1}`);
        for (const match of result.matches ?? []) {
            findings.push({
                genre: task.genre,
                passage: task.passage,
                rule: match.rule?.id,
                category: match.rule?.category?.id,
                message: match.message,
                context: match.context?.text,
                replacements: (match.replacements ?? []).slice(0, 3).map((item) => item.value),
            });
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
}

await Promise.all([worker(), worker()]);

console.log(JSON.stringify({ findingCount: findings.length, findings }, null, 2));
