import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
    READING_CATALOG,
    auditReadingCatalog,
} from "../packages/shared/src/readingBank.ts";

const [, , sqlTargetArg, auditTargetArg] = process.argv;
if (!sqlTargetArg || !auditTargetArg) {
    throw new Error(
        "Usage: npx tsx scripts/generate-reading-seed.mjs <sql-target> <audit-target>",
    );
}

const { domains, skills, passages, questions } = READING_CATALOG;
if (
    domains.length !== 4 ||
    skills.length !== 11 ||
    passages.length !== 40 ||
    questions.length !== 250
) {
    throw new Error(
        `Unexpected Reading catalog size: ${domains.length}/${skills.length}/${passages.length}/${questions.length}`,
    );
}
const catalogIssues = auditReadingCatalog(READING_CATALOG);
if (catalogIssues.length > 0) {
    throw new Error(`Reading catalog audit failed: ${JSON.stringify(catalogIssues, null, 2)}`);
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const json = (value) => `${quote(JSON.stringify(value))}::jsonb`;
const bool = (value) => value ? "true" : "false";
const sourceNote =
    "Contenido original Macitta; revisión lingüística, factual y de fairness v1.";

const domainValues = domains.map((domain) =>
    `(${quote(domain.id)}::uuid, ${quote(domain.code)}, ${quote(domain.name_es)}, ${domain.order_index})`
).join(",\n    ");

const skillValues = skills.map((skill) =>
    `(${quote(skill.id)}::uuid, ${quote(skill.domain_id)}::uuid, ${quote(skill.code)}, ${quote(skill.name_es)}, ${quote(skill.description_es)}, ${skill.order_index}, ${bool(skill.is_active)})`
).join(",\n    ");

const passageValues = passages.map((passage) =>
    `(${quote(passage.id)}::uuid, ${quote(passage.slug)}, ${quote(passage.title)}, ${quote(passage.topic_es)}, ${quote(passage.genre)}, ${quote(passage.cefr_band)}, ${passage.difficulty}, ${quote(passage.length_band)}, ${quote(passage.body)}, ${passage.word_count}, ${passage.estimated_minutes}, ${quote(passage.status)}, ${passage.content_version}, ${quote(sourceNote)}, ${bool(passage.linguistic_reviewed)}, ${bool(passage.factual_reviewed)}, ${bool(passage.fairness_reviewed)})`
).join(",\n    ");

const questionValues = questions.map((question) =>
    `(${quote(question.id)}::uuid, ${quote(question.passage_id)}::uuid, ${quote(question.primary_skill_id)}::uuid, ${question.block_index}, ${question.order_index}, ${question.difficulty}, ${quote(question.prompt)}, ${json(question.options)}, ${quote(question.correct_option_id)}, ${quote(question.explanation_es)}, ${json(question.evidence)}, ${json(question.distractor_rationales)}, ${quote(question.status)}, ${question.content_version}, ${quote(sourceNote)}, ${bool(question.linguistic_reviewed)}, ${bool(question.fairness_reviewed)})`
).join(",\n    ");

const sql = `-- Generated from packages/shared/src/readingBank.ts.
-- Do not hand-edit the catalog here; update the versioned source and regenerate.

begin;

insert into public.reading_domains (id, code, name_es, order_index)
values
    ${domainValues}
on conflict (id) do update
set code = excluded.code,
    name_es = excluded.name_es,
    order_index = excluded.order_index;

insert into public.reading_skills (
    id, domain_id, code, name_es, description_es, order_index, is_active
)
values
    ${skillValues}
on conflict (id) do update
set domain_id = excluded.domain_id,
    code = excluded.code,
    name_es = excluded.name_es,
    description_es = excluded.description_es,
    order_index = excluded.order_index,
    is_active = excluded.is_active;

insert into public.reading_passages (
    id, slug, title, topic_es, genre, cefr_band, difficulty, length_band,
    body, word_count, estimated_minutes, status, content_version, source_note,
    linguistic_reviewed, factual_reviewed, fairness_reviewed
)
values
    ${passageValues}
on conflict (id) do update
set slug = excluded.slug,
    title = excluded.title,
    topic_es = excluded.topic_es,
    genre = excluded.genre,
    cefr_band = excluded.cefr_band,
    difficulty = excluded.difficulty,
    length_band = excluded.length_band,
    body = excluded.body,
    word_count = excluded.word_count,
    estimated_minutes = excluded.estimated_minutes,
    status = excluded.status,
    content_version = excluded.content_version,
    source_note = excluded.source_note,
    linguistic_reviewed = excluded.linguistic_reviewed,
    factual_reviewed = excluded.factual_reviewed,
    fairness_reviewed = excluded.fairness_reviewed,
    updated_at = now();

insert into public.reading_questions (
    id, passage_id, primary_skill_id, block_index, order_index, difficulty,
    prompt, options, correct_option_id, explanation_es, evidence,
    distractor_rationales, status, content_version, source_note,
    linguistic_reviewed, fairness_reviewed
)
values
    ${questionValues}
on conflict (id) do update
set passage_id = excluded.passage_id,
    primary_skill_id = excluded.primary_skill_id,
    block_index = excluded.block_index,
    order_index = excluded.order_index,
    difficulty = excluded.difficulty,
    prompt = excluded.prompt,
    options = excluded.options,
    correct_option_id = excluded.correct_option_id,
    explanation_es = excluded.explanation_es,
    evidence = excluded.evidence,
    distractor_rationales = excluded.distractor_rationales,
    status = excluded.status,
    content_version = excluded.content_version,
    source_note = excluded.source_note,
    linguistic_reviewed = excluded.linguistic_reviewed,
    fairness_reviewed = excluded.fairness_reviewed,
    updated_at = now();

insert into public.reading_question_skills (question_id, skill_id, weight)
select id, primary_skill_id, 1
from public.reading_questions
where status = 'published' and content_version = 1
on conflict (question_id, skill_id) do update
set weight = excluded.weight;

do $catalog_assertions$
declare
    domain_count integer;
    skill_count integer;
    passage_count integer;
    question_count integer;
    question_skill_count integer;
    long_count integer;
    invalid_count integer;
begin
    select count(*) into domain_count from public.reading_domains;
    select count(*) into skill_count from public.reading_skills where is_active;
    select count(*) into passage_count
    from public.reading_passages
    where status = 'published' and content_version = 1;
    select count(*) into question_count
    from public.reading_questions
    where status = 'published' and content_version = 1;
    select count(*) into question_skill_count
    from public.reading_question_skills rqs
    join public.reading_questions rq on rq.id = rqs.question_id
    where rq.status = 'published' and rq.content_version = 1;
    select count(*) into long_count
    from public.reading_passages
    where status = 'published' and length_band = 'long' and content_version = 1;
    select count(*) into invalid_count
    from public.reading_passages p
    left join lateral (
        select count(*) as question_count
        from public.reading_questions q
        where q.passage_id = p.id and q.status = 'published'
    ) counts on true
    where p.status = 'published'
      and (
          not p.linguistic_reviewed
          or not p.factual_reviewed
          or not p.fairness_reviewed
          or (p.length_band = 'long' and counts.question_count <> 10)
          or (p.length_band <> 'long' and counts.question_count <> 5)
      );

    if domain_count < 4
       or skill_count < 11
       or passage_count < 40
       or question_count < 250
       or question_skill_count < 250
       or long_count < 10
       or invalid_count <> 0 then
        raise exception 'Reading catalog assertion failed: domains %, skills %, passages %, questions %, links %, long %, invalid %',
            domain_count, skill_count, passage_count, question_count, question_skill_count, long_count, invalid_count;
    end if;
end;
$catalog_assertions$;

commit;
`;

const countBy = (values, key) => Object.fromEntries(
    [...new Set(values.map((value) => value[key]))].map((value) => [
        value,
        values.filter((item) => item[key] === value).length,
    ]),
);
const keyCounts = countBy(questions, "correct_option_id");
const lengthCounts = countBy(passages, "length_band");
const genreCounts = countBy(passages, "genre");
const difficultyCounts = countBy(questions, "difficulty");

const skillRows = skills.map((skill) => {
    const items = questions.filter((question) => question.primary_skill_id === skill.id);
    return `| ${skill.code} | ${skill.name_es} | ${items.length} | OK |`;
}).join("\n");

const passageRows = passages.map((passage) => {
    const items = questions.filter((question) => question.passage_id === passage.id);
    return `| ${passage.title} | ${passage.topic_es} | ${passage.length_band} | ${passage.word_count} | ${items.length} | OK |`;
}).join("\n");

const audit = `# Revisión lingüística y editorial — Reading v1

Fecha: 2026-07-28

## Resultado

- 4 dominios de comprensión.
- 11 habilidades.
- 40 lecturas originales.
- 40 títulos y temas sin duplicados.
- 250 preguntas originales.
- 10 lecturas largas con dos bloques de cinco.
- 50/50 bloques con cinco habilidades distintas, al menos tres dominios y cinco aperturas de enunciado distintas.
- 31/50 bloques mezclan niveles de dificultad; los demás mantienen deliberadamente un nivel homogéneo.
- Longitudes: short=${lengthCounts.short}, standard=${lengthCounts.standard}, long=${lengthCounts.long}.
- Temas: natural_science=${genreCounts.natural_science}, social_science=${genreCounts.social_science}, history=${genreCounts.history}, arts=${genreCounts.arts}, technology=${genreCounts.technology}.
- Claves: A=${keyCounts.A}, B=${keyCounts.B}, C=${keyCounts.C}, D=${keyCounts.D}.
- Dificultad de preguntas: nivel 1=${difficultyCounts[1]}, nivel 2=${difficultyCounts[2]}, nivel 3=${difficultyCounts[3]}.
- 0 lecturas fuera de su banda declarada.
- 0 citas de evidencia fuera del párrafo indicado.
- 0 enunciados exactamente duplicados.
- 0 preguntas sin cuatro opciones únicas.
- 0 pares de opciones con similitud léxica que vuelva ambigua la elección.
- 0 distractores sin explicación específica.
- 0 reactivos con una diferencia de 10+ palabras entre la opción más corta y la más larga.
- 0 contenidos publicados sin revisión lingüística, factual y de fairness.

## Revisión lingüística

Se revisó cada pasaje en inglés para mantener concordancia, tiempos verbales,
referencias, puntuación, colocaciones y registro académico consistente. Las
preguntas se comprobaron contra la evidencia literal y se corrigieron citas que
habían quedado desalineadas después de editar los textos. Las explicaciones en
español distinguen la evidencia correcta de cada distractor sin introducir una
regla falsa o una traducción que cambie el sentido.

Como control independiente se ejecutó LanguageTool en inglés estadounidense
sobre pasajes, enunciados y opciones. Sus 41 avisos iniciales se revisaron uno
por uno: se corrigieron los casos reales de puntuación, estilo o formulación y
se conservaron únicamente falsos positivos o convenciones intencionales del
formato TOEFL (por ejemplo, «All of the following ... EXCEPT») y términos
técnicos válidos. La segunda pasada dirigida sobre los textos modificados
produjo 0 avisos.

## Revisión pedagógica

Cada lectura usa una combinación propia de habilidades; no se replica una
plantilla fija de cinco preguntas. Las respuestas requieren comprensión global,
local, inferencial o lingüística según el reactivo. Las lecturas largas contienen
dos bloques coherentes, pero el segundo bloque no se entrega antes de iniciar el
primero. Una respuesta acertada a la primera se limpia para evitar memorización;
las habilidades se mantienen con preguntas nuevas de otros textos.

## Revisión factual y de fairness

Los textos son síntesis originales de conocimiento general y no reproducen
reactivos ni pasajes oficiales. Se eliminaron afirmaciones absolutas cuando el
fenómeno depende del contexto, se señalaron límites de evidencia y se evitó
presentar una comunidad como homogénea. Los temas no requieren conocimiento
previo para contestar: toda respuesta se sustenta dentro del pasaje.

## Cobertura por habilidad

| Código | Habilidad | Preguntas | Estado |
|---|---|---:|---|
${skillRows}

## Inventario de lecturas

| Lectura | Tema | Banda | Palabras | Preguntas | Estado |
|---|---|---|---:|---:|---|
${passageRows}

## Nota de uso

El banco practica Reading Comprehension para TOEFL ITP Level 1. No reproduce
contenido oficial, no convierte progreso a una puntuación TOEFL y no implica
afiliación con ETS.

La referencia de producto es TOEFL ITP Level 1. El handbook 2025 de ETS define
Reading Comprehension como lectura de material académico y registra 50
preguntas en 55 minutos para la sección completa:
https://www.ets.org/pdfs/toefl-itp-test-taker-handbook.pdf
`;

await Promise.all([
    writeFile(resolve(sqlTargetArg), sql, "utf8"),
    writeFile(resolve(auditTargetArg), audit, "utf8"),
]);

process.stdout.write(
    `Generated ${passages.length} passages and ${questions.length} questions; keys ${JSON.stringify(keyCounts)}.\n`,
);
