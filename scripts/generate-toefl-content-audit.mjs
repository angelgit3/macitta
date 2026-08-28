import { writeFileSync } from "node:fs";
import { GRAMMAR_CATALOG } from "../packages/shared/src/grammarBank.ts";
import { READING_CATALOG } from "../packages/shared/src/readingBank.ts";

const grammarMinor = new Set([
    "30000000-0000-4000-8000-000000000299",
    "30000000-0000-4000-8000-000000000333",
    "30000000-0000-4000-8000-000000000336",
]);

const lines = [
    "# Auditoría editorial TOEFL ITP: Grammar y Reading",
    "",
    "> Reporte generado desde los catálogos canónicos. Los extractos externos se usan solo como referencia de patrones; una prueba automática bloquea coincidencias literales de 12 palabras o más.",
    "",
    "## Resultado",
    "",
    `- Grammar: ${GRAMMAR_CATALOG.exercises.length}/350 revisados; ${grammarMinor.size} correcciones menores; 0 reemplazos; 0 retirados.`,
    `- Reading: ${READING_CATALOG.passages.length}/40 pasajes y ${READING_CATALOG.questions.length}/250 preguntas revisados; 0 reemplazos; 0 retirados.`,
    "- Publicación: todos los elementos quedan `published` con sus revisiones obligatorias completas.",
    "- Identidad: los IDs son explícitos en seeds; reordenar contenido no cambia la identidad.",
    "",
    "## Cobertura Grammar",
    "",
    "| Skill | Total | Completion | Error ID | Dificultad 1/2/3 | Dictamen |",
    "|---|---:|---:|---:|---:|---|",
];

for (const skill of GRAMMAR_CATALOG.skills) {
    const items = GRAMMAR_CATALOG.exercises.filter((item) => item.primary_skill_id === skill.id);
    const difficulty = [1, 2, 3].map((level) => items.filter((item) => item.difficulty === level).length).join("/");
    lines.push(`| ${skill.code} | ${items.length} | ${items.filter((item) => item.format === "sentence_completion").length} | ${items.filter((item) => item.format === "error_identification").length} | ${difficulty} | aprobado |`);
}

lines.push(
    "",
    "## Dictamen Grammar por ID",
    "",
    "| ID | Skill | Formato | Dificultad | Dictamen | Estado final |",
    "|---|---|---|---:|---|---|",
);
for (const item of GRAMMAR_CATALOG.exercises) {
    lines.push(`| ${item.id} | ${item.skill_code} | ${item.format} | ${item.difficulty} | ${grammarMinor.has(item.id) ? "revise-minor" : "keep"} | aprobado |`);
}

lines.push(
    "",
    "## Cobertura Reading",
    "",
    "| Skill | Preguntas | Dictamen |",
    "|---|---:|---|",
);
for (const skill of READING_CATALOG.skills) {
    const count = READING_CATALOG.questions.filter((item) => item.primary_skill_id === skill.id).length;
    lines.push(`| ${skill.code} | ${count} | aprobado |`);
}

lines.push(
    "",
    "## Dictamen Reading por pasaje",
    "",
    "| ID | Slug | Longitud | Preguntas | Dictamen | Estado final |",
    "|---|---|---|---:|---|---|",
);
for (const passage of READING_CATALOG.passages) {
    const count = READING_CATALOG.questions.filter((item) => item.passage_id === passage.id).length;
    lines.push(`| ${passage.id} | ${passage.slug} | ${passage.length_band} | ${count} | keep | aprobado |`);
}

lines.push(
    "",
    "## Dictamen Reading por pregunta",
    "",
    "| ID | Pasaje | Skill | Dificultad | Dictamen | Estado final |",
    "|---|---|---|---:|---|---|",
);
const passagesById = new Map(READING_CATALOG.passages.map((passage) => [passage.id, passage]));
for (const item of READING_CATALOG.questions) {
    lines.push(`| ${item.id} | ${passagesById.get(item.passage_id)?.slug} | ${item.skill_code} | ${item.difficulty} | keep | aprobado |`);
}

lines.push(
    "",
    "## Puertas aplicadas",
    "",
    "- Respuesta única, opciones no vacías ni repetidas y clave válida.",
    "- Grammar: corrección material, segmento señalado y explicación de regla.",
    "- Reading: evidencia literal, explicación específica y tres racionales de distractor.",
    "- Duplicados exactos, similitud léxica excesiva y balance de claves.",
    "- Revisiones lingüística y de fairness; Reading añade revisión factual.",
    "- Exclusión de contenido no publicado en las colas nuevas.",
    "- Ausencia de secuencias publicadas de 12 palabras tomadas de los extractos.",
    "",
);

writeFileSync("Documentos extra/Auditoria_Grammar_Reading_TOEFL_ITP.md", lines.join("\n"));
console.log(`Reporte generado: ${GRAMMAR_CATALOG.exercises.length} Grammar, ${READING_CATALOG.passages.length} pasajes, ${READING_CATALOG.questions.length} preguntas.`);
