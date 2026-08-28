import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "Documentos extra/ejercicios_listening.md");
const bankPath = resolve(root, "packages/shared/src/listeningBank.ts");

const markdown = readFileSync(sourcePath, "utf8");
const source = readFileSync(bankPath, "utf8");

const clean = (value) =>
  value
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^[-\s]+/, "")
    .trim();

const exercises = new Map();
const blocks = markdown.split(/(?=^### Ejercicio \d+)/gm);

for (const block of blocks) {
  const numberMatch = block.match(/^### Ejercicio (\d+)/m);
  if (!numberMatch) continue;

  const number = Number(numberMatch[1]);
  const speakers = [
    ...block.matchAll(/^\s*- \*\*\((man|woman)\)\*\*: \*(.+)\*$/gm),
  ].map((match) => clean(match[2]));
  const narrator = block.match(/^\s*- \*\*\(narrator\)\*\*: \*(.+)\*$/m)?.[1];
  const options = [...block.matchAll(/^\s*- \(([A-D])\) (.+)$/gm)].map(
    (match) => ({ id: match[1], text: clean(match[2]) }),
  );
  const solution = block.match(
    /^\s*- \*\*💡 Solución:\*\* \*\*\(([A-D])\)/m,
  )?.[1];
  const explanationBlock =
    block.match(
      /^\s*- \*\*💡 Solución:.*?\n([\s\S]*?)(?=\n---|\n### |(?![\s\S]))/m,
    )?.[1] ?? "";
  const explanation = explanationBlock
    .split("\n")
    .map(clean)
    .filter(Boolean)
    .join(" ");

  if (
    speakers.length >= 2 &&
    narrator &&
    options.length === 4 &&
    solution &&
    explanation
  ) {
    exercises.set(number, {
      prompt: clean(narrator),
      options,
      correct: solution,
      explanation,
      evidence: speakers.at(-1),
    });
  }
}

const calls = [];
let cursor = 0;
while ((cursor = source.indexOf("question(", cursor)) !== -1) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let end = cursor;
  for (; end < source.length; end += 1) {
    const character = source[end];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth += 1;
    else if (character === ")" && --depth === 0) {
      end += 1;
      if (source[end] === ",") end += 1;
      break;
    }
  }
  calls.push({ start: cursor, end, text: source.slice(cursor, end) });
  cursor = end;
}

let updated = source;
let synchronized = 0;
for (const call of calls.reverse()) {
  const header = call.text.match(
    /^question\(\s*"q-(skill[^"]+)",\s*"([^"]+)",\s*(\d+),\s*"([^"]+)",\s*(\d+),/s,
  );
  if (!header) continue;
  const [, questionSuffix, unitId, order, skill, difficulty] = header;
  const numberMatch = unitId.match(/(?:-|^)(\d+)(?:-|$)/);
  const number = numberMatch ? Number(numberMatch[1]) : null;
  const exercise = number === null ? null : exercises.get(number);
  if (!exercise)
    throw new Error(`No se encontró el ejercicio fuente para ${unitId}`);

  const optionCalls = exercise.options
    .map(
      (item) =>
        `option(${JSON.stringify(item.id)}, ${JSON.stringify(item.text)})`,
    )
    .join(", ");
  const replacement = `question(${JSON.stringify(`q-${questionSuffix}`)}, ${JSON.stringify(unitId)}, ${order}, ${JSON.stringify(skill)}, ${difficulty}, ${JSON.stringify(exercise.prompt)}, [${optionCalls}], ${JSON.stringify(exercise.correct)}, ${JSON.stringify(exercise.explanation)}, ${JSON.stringify(exercise.evidence)}),`;
  updated = `${updated.slice(0, call.start)}${replacement}${updated.slice(call.end)}`;
  synchronized += 1;
}

if (synchronized !== 88)
  throw new Error(
    `Se esperaban 88 preguntas y se encontraron ${synchronized}.`,
  );
writeFileSync(bankPath, updated, "utf8");
console.log(`Sincronizadas ${synchronized} preguntas desde ${sourcePath}`);
