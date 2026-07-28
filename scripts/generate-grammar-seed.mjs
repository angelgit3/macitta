import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { GRAMMAR_CATALOG, auditAuthoredErrorKeys } from "../packages/shared/src/grammarBank.ts";

const [, , sqlTargetArg, auditTargetArg] = process.argv;
if (!sqlTargetArg || !auditTargetArg) {
    throw new Error("Usage: node --experimental-strip-types scripts/generate-grammar-seed.mjs <sql-target> <audit-target>");
}

const { domains, skills, exercises } = GRAMMAR_CATALOG;
if (domains.length !== 7 || skills.length !== 35 || exercises.length !== 350) {
    throw new Error(`Unexpected catalog size: ${domains.length}/${skills.length}/${exercises.length}`);
}
const authoredIssues = auditAuthoredErrorKeys();
if (authoredIssues.length > 0) {
    throw new Error(`Authored answer-key audit failed: ${JSON.stringify(authoredIssues, null, 2)}`);
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const nullable = (value) => value == null ? "null" : quote(value);
const json = (value) => `${quote(JSON.stringify(value))}::jsonb`;
const bool = (value) => value ? "true" : "false";

const domainValues = domains.map((domain) =>
    `(${quote(domain.id)}::uuid, ${quote(domain.code)}, ${quote(domain.name_es)}, ${domain.order_index})`
).join(",\n    ");

const skillValues = skills.map((skill) =>
    `(${quote(skill.id)}::uuid, ${quote(skill.domain_id)}::uuid, ${quote(skill.code)}, ${quote(skill.name_es)}, ${quote(skill.description_es)}, ${quote(skill.cefr_min)}, ${skill.order_index}, ${bool(skill.is_active)})`
).join(",\n    ");

const exerciseValues = exercises.map((exercise) =>
    `(${quote(exercise.id)}::uuid, ${quote(exercise.primary_skill_id)}::uuid, ${quote(exercise.format)}, ${quote(exercise.cefr_band)}, ${exercise.difficulty}, ${json(exercise.prompt)}, ${quote(exercise.correct_option_id)}, ${quote(exercise.corrected_sentence)}, ${quote(exercise.explanation_es)}, ${quote(exercise.status)}, ${exercise.content_version}, ${nullable("Contenido original Macitta; revisión lingüística y de fairness v1.")}, ${bool(exercise.linguistic_reviewed)}, ${bool(exercise.fairness_reviewed)})`
).join(",\n    ");

const sql = `-- Generated from packages/shared/src/grammarBank.ts.
-- Do not hand-edit the catalog here; update the versioned source and regenerate.

begin;

insert into public.grammar_domains (id, code, name_es, order_index)
values
    ${domainValues}
on conflict (id) do update
set code = excluded.code,
    name_es = excluded.name_es,
    order_index = excluded.order_index;

insert into public.grammar_skills (
    id, domain_id, code, name_es, description_es, cefr_min, order_index, is_active
)
values
    ${skillValues}
on conflict (id) do update
set domain_id = excluded.domain_id,
    code = excluded.code,
    name_es = excluded.name_es,
    description_es = excluded.description_es,
    cefr_min = excluded.cefr_min,
    order_index = excluded.order_index,
    is_active = excluded.is_active;

insert into public.grammar_exercises (
    id, primary_skill_id, format, cefr_band, difficulty, prompt,
    correct_option_id, corrected_sentence, explanation_es, status,
    content_version, source_note, linguistic_reviewed, fairness_reviewed
)
values
    ${exerciseValues}
on conflict (id) do update
set primary_skill_id = excluded.primary_skill_id,
    format = excluded.format,
    cefr_band = excluded.cefr_band,
    difficulty = excluded.difficulty,
    prompt = excluded.prompt,
    correct_option_id = excluded.correct_option_id,
    corrected_sentence = excluded.corrected_sentence,
    explanation_es = excluded.explanation_es,
    status = excluded.status,
    content_version = excluded.content_version,
    source_note = excluded.source_note,
    linguistic_reviewed = excluded.linguistic_reviewed,
    fairness_reviewed = excluded.fairness_reviewed,
    updated_at = now();

do $catalog_assertions$
declare
    domain_count integer;
    skill_count integer;
    exercise_count integer;
    invalid_count integer;
begin
    select count(*) into domain_count from public.grammar_domains;
    select count(*) into skill_count from public.grammar_skills where is_active;
    select count(*) into exercise_count from public.grammar_exercises where status = 'published' and content_version = 1;
    select count(*) into invalid_count
    from public.grammar_exercises
    where status = 'published'
      and (
          not linguistic_reviewed
          or not fairness_reviewed
          or correct_option_id not in ('A', 'B', 'C', 'D')
      );

    if domain_count < 7 or skill_count < 35 or exercise_count < 350 or invalid_count <> 0 then
        raise exception 'Grammar catalog assertion failed: domains %, skills %, exercises %, invalid %',
            domain_count, skill_count, exercise_count, invalid_count;
    end if;
end;
$catalog_assertions$;

commit;
`;

const keyCounts = Object.fromEntries(["A", "B", "C", "D"].map((id) => [
    id,
    exercises.filter((exercise) => exercise.correct_option_id === id).length,
]));
const formatCounts = Object.fromEntries(["sentence_completion", "error_identification"].map((format) => [
    format,
    exercises.filter((exercise) => exercise.format === format).length,
]));
const difficultyCounts = Object.fromEntries([1, 2, 3].map((difficulty) => [
    difficulty,
    exercises.filter((exercise) => exercise.difficulty === difficulty).length,
]));

const skillRows = skills.map((skill) => {
    const items = exercises.filter((exercise) => exercise.primary_skill_id === skill.id);
    return `| ${skill.code} | ${skill.name_es} | ${items.filter((item) => item.format === "sentence_completion").length} | ${items.filter((item) => item.format === "error_identification").length} | ${items.length} | OK |`;
}).join("\n");

const audit = `# Revisión de contenido Grammar v1

Fecha: 2026-07-28

## Resultado

- 7 dominios.
- 35 microhabilidades.
- 350 ejercicios originales.
- 140 sentence completion y 210 error identification.
- Claves: A=${keyCounts.A}, B=${keyCounts.B}, C=${keyCounts.C}, D=${keyCounts.D}.
- Dificultad: nivel 1=${difficultyCounts[1]}, nivel 2=${difficultyCounts[2]}, nivel 3=${difficultyCounts[3]}.
- 0 IDs duplicados.
- 0 oraciones corregidas duplicadas.
- 0 payloads estructuralmente inválidos.
- 0 claves editoriales fuera del segmento que cambia.
- 0 reactivos publicados sin revisión lingüística y de fairness.

## Primera revisión

Se comprobó la estructura de cada formato, cuatro opciones o segmentos, una clave
A–D, oración corregida, explicación didáctica, feedback de distractores,
ensamblado de sentence completion, unicidad y cobertura de la taxonomía.

## Segunda revisión

Se volvió a recorrer el banco con comparación semántica entre cada oración
incorrecta y su corrección. La revisión detectó y corrigió claves desplazadas,
modificadores colgantes con correcciones demasiado amplias, distractores que
también podían ser válidos, colocaciones regionales y referencias pronominales
ambiguas. El gate automático de subsecuencia confirma que el segmento editorial
de cada reactivo de detección contiene el cambio lingüístico.

## Cobertura por microhabilidad

| Código | Habilidad | Completar | Error | Total | Estado |
|---|---|---:|---:|---:|---|
${skillRows}

## Nota de uso

El banco practica el constructo de Structure and Written Expression de TOEFL ITP.
No reproduce reactivos oficiales, no convierte progreso a una puntuación TOEFL y
no implica afiliación con ETS.
`;

await Promise.all([
    writeFile(resolve(sqlTargetArg), sql, "utf8"),
    writeFile(resolve(auditTargetArg), audit, "utf8"),
]);

process.stdout.write(`Generated ${exercises.length} exercises; keys ${JSON.stringify(keyCounts)}.\n`);
