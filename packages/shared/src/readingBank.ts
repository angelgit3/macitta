import {
    countReadingWords,
    validateReadingPassage,
    validateReadingQuestion,
    type ReadingDomain,
    type ReadingOptionId,
    type ReadingPassage,
    type ReadingQuestion,
    type ReadingSkill,
} from "./reading";
import {
    OPTION_IDS,
    type ReadingPassageSeed,
    type ReadingQuestionSeed,
    type ReadingSkillCode,
} from "./readingBankTypes";
import { ARTS_PASSAGES } from "./readingBankSeeds/arts";
import { HISTORY_PASSAGES } from "./readingBankSeeds/history";
import { NATURAL_SCIENCE_PASSAGES } from "./readingBankSeeds/naturalScience";
import { SOCIAL_SCIENCE_PASSAGES } from "./readingBankSeeds/socialScience";
import { TECHNOLOGY_PASSAGES } from "./readingBankSeeds/technology";

interface SkillDefinition {
    code: ReadingSkillCode;
    name: string;
    description: string;
}

interface DomainDefinition {
    code: string;
    name: string;
    skills: readonly SkillDefinition[];
}

const DOMAIN_DEFINITIONS: readonly DomainDefinition[] = [
    {
        code: "global_comprehension",
        name: "Comprensión global",
        skills: [
            {
                code: "READ_MAIN_IDEA",
                name: "Idea principal",
                description: "Identificar la afirmación que integra el contenido esencial de toda la lectura.",
            },
            {
                code: "READ_PRIMARY_PURPOSE",
                name: "Propósito principal",
                description: "Reconocer la razón comunicativa dominante por la que se presenta el texto.",
            },
            {
                code: "READ_ORGANIZATION",
                name: "Organización",
                description: "Seguir la estructura lógica y la función de las partes dentro del pasaje.",
            },
        ],
    },
    {
        code: "local_comprehension",
        name: "Comprensión local",
        skills: [
            {
                code: "READ_DETAIL",
                name: "Detalle explícito",
                description: "Localizar información afirmada directamente y distinguirla de aproximaciones.",
            },
            {
                code: "READ_NEGATIVE_DETAIL",
                name: "Detalle negativo",
                description: "Identificar la alternativa que el pasaje no afirma entre varias opciones cercanas.",
            },
        ],
    },
    {
        code: "inference_reasoning",
        name: "Inferencia y razonamiento",
        skills: [
            {
                code: "READ_INFERENCE",
                name: "Inferencia",
                description: "Derivar una conclusión necesaria o razonable a partir de evidencia textual.",
            },
            {
                code: "READ_RHETORICAL_PURPOSE",
                name: "Propósito retórico",
                description: "Explicar por qué el autor incluye un ejemplo, contraste o información concreta.",
            },
            {
                code: "READ_TONE",
                name: "Tono y postura",
                description: "Reconocer el grado de certeza, cautela o valoración expresado por el autor.",
            },
        ],
    },
    {
        code: "language_in_context",
        name: "Lenguaje en contexto",
        skills: [
            {
                code: "READ_VOCAB_CONTEXT",
                name: "Vocabulario en contexto",
                description: "Determinar el sentido que una palabra adquiere dentro de su oración y pasaje.",
            },
            {
                code: "READ_REFERENCE",
                name: "Referencia y cohesión",
                description: "Resolver a qué idea, entidad o proceso remite una expresión del texto.",
            },
            {
                code: "READ_PARAPHRASE",
                name: "Paráfrasis",
                description: "Reconocer una reformulación fiel que conserva las relaciones de significado.",
            },
        ],
    },
];

export interface ReadingCatalog {
    domains: ReadingDomain[];
    skills: ReadingSkill[];
    passages: ReadingPassage[];
    questions: ReadingQuestion[];
}

export interface ReadingCatalogAuditIssue {
    item: string;
    message: string;
}

function stableUuid(namespace: string, index: number): string {
    return `${namespace}0000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function makeQuestion(
    seed: ReadingQuestionSeed,
    passage: ReadingPassage,
    skill: ReadingSkill,
    questionIndex: number,
    orderIndex: number,
): ReadingQuestion {
    const correctId = OPTION_IDS[questionIndex % OPTION_IDS.length];
    let distractorIndex = 0;
    const options = OPTION_IDS.map((id) => ({
        id,
        text: id === correctId ? seed.correct : seed.distractors[distractorIndex++],
    }));
    distractorIndex = 0;
    const distractorRationales: Partial<Record<ReadingOptionId, string>> = {};
    for (const id of OPTION_IDS) {
        if (id === correctId) continue;
        distractorRationales[id] = seed.distractorReasonsEs[distractorIndex++];
    }
    return {
        id: seed.id,
        passage_id: passage.id,
        primary_skill_id: skill.id,
        domain_id: skill.domain_id,
        skill_code: skill.code,
        block_index: orderIndex <= 5 ? 1 : 2,
        order_index: orderIndex,
        difficulty: seed.difficulty ?? passage.difficulty,
        prompt: seed.prompt,
        options,
        correct_option_id: correctId,
        explanation_es: seed.explanationEs,
        evidence: {
            paragraph: seed.evidenceParagraph,
            quote: seed.evidenceQuote,
        },
        distractor_rationales: distractorRationales,
        status: "published",
        content_version: 1,
        linguistic_reviewed: true,
        fairness_reviewed: true,
    };
}

export function createReadingCatalog(
    passageSeeds: readonly ReadingPassageSeed[] = [
        ...NATURAL_SCIENCE_PASSAGES,
        ...SOCIAL_SCIENCE_PASSAGES,
        ...HISTORY_PASSAGES,
        ...ARTS_PASSAGES,
        ...TECHNOLOGY_PASSAGES,
    ],
): ReadingCatalog {
    const domains: ReadingDomain[] = [];
    const skills: ReadingSkill[] = [];
    const passages: ReadingPassage[] = [];
    const questions: ReadingQuestion[] = [];
    const skillsByCode = new Map<string, ReadingSkill>();
    let skillIndex = 0;

    for (const [domainOffset, definition] of DOMAIN_DEFINITIONS.entries()) {
        const domainId = stableUuid("4", domainOffset + 1);
        domains.push({
            id: domainId,
            code: definition.code,
            name_es: definition.name,
            order_index: domainOffset + 1,
        });
        for (const [skillOffset, skillDefinition] of definition.skills.entries()) {
            skillIndex += 1;
            const skill: ReadingSkill = {
                id: stableUuid("5", skillIndex),
                domain_id: domainId,
                code: skillDefinition.code,
                name_es: skillDefinition.name,
                description_es: skillDefinition.description,
                order_index: skillOffset + 1,
                is_active: true,
            };
            skills.push(skill);
            skillsByCode.set(skill.code, skill);
        }
    }

    let questionIndex = 0;
    for (const seed of passageSeeds) {
        const body = seed.paragraphs.join("\n\n");
        const passage: ReadingPassage = {
            id: seed.id,
            slug: seed.slug,
            title: seed.title,
            topic_es: seed.topicEs,
            genre: seed.genre,
            cefr_band: seed.cefr,
            difficulty: seed.difficulty,
            length_band: seed.length,
            body,
            word_count: countReadingWords(body),
            estimated_minutes: seed.estimatedMinutes,
            status: "published",
            content_version: 1,
            linguistic_reviewed: true,
            factual_reviewed: true,
            fairness_reviewed: true,
        };
        passages.push(passage);
        for (const [questionOffset, questionSeed] of seed.questions.entries()) {
            const skill = skillsByCode.get(questionSeed.skill);
            if (!skill) throw new Error(`Unknown Reading skill: ${questionSeed.skill}`);
            questions.push(
                makeQuestion(
                    questionSeed,
                    passage,
                    skill,
                    questionIndex,
                    questionOffset + 1,
                ),
            );
            questionIndex += 1;
        }
    }

    return { domains, skills, passages, questions };
}

export function auditReadingCatalog(catalog: ReadingCatalog): ReadingCatalogAuditIssue[] {
    const issues: ReadingCatalogAuditIssue[] = [];
    const questionsByPassage = new Map<string, ReadingQuestion[]>();
    for (const question of catalog.questions) {
        const list = questionsByPassage.get(question.passage_id) ?? [];
        list.push(question);
        questionsByPassage.set(question.passage_id, list);
    }
    for (const passage of catalog.passages) {
        for (const item of validateReadingPassage(passage).issues) {
            issues.push({ item: passage.slug, message: `${item.path}: ${item.message}` });
        }
        const passageQuestions = questionsByPassage.get(passage.id) ?? [];
        const expected = passage.length_band === "long" ? 10 : 5;
        if (passageQuestions.length !== expected) {
            issues.push({
                item: passage.slug,
                message: `Se esperaban ${expected} preguntas y hay ${passageQuestions.length}.`,
            });
        }
        if (
            passage.length_band === "long" &&
            (
                passageQuestions.filter((question) => question.block_index === 1).length !== 5 ||
                passageQuestions.filter((question) => question.block_index === 2).length !== 5
            )
        ) {
            issues.push({
                item: passage.slug,
                message: "Una lectura larga debe tener dos bloques de cinco preguntas.",
            });
        }
        const blockIndexes = passage.length_band === "long" ? [1, 2] as const : [1] as const;
        for (const blockIndex of blockIndexes) {
            const blockQuestions = passageQuestions.filter(
                (question) => question.block_index === blockIndex,
            );
            const distinctSkills = new Set(
                blockQuestions.map((question) => question.skill_code),
            ).size;
            const distinctDomains = new Set(
                blockQuestions.map((question) => question.domain_id),
            ).size;
            const distinctStems = new Set(
                blockQuestions.map((question) =>
                    question.prompt
                        .trim()
                        .toLocaleLowerCase("en")
                        .replace(/[“”‘’'"?.!,]/g, "")
                        .split(/\s+/)
                        .slice(0, 5)
                        .join(" "),
                ),
            ).size;
            if (blockQuestions.length === 5 && distinctSkills !== 5) {
                issues.push({
                    item: `${passage.slug}/block-${blockIndex}`,
                    message: "Cada bloque debe practicar cinco habilidades distintas.",
                });
            }
            if (blockQuestions.length === 5 && distinctDomains < 3) {
                issues.push({
                    item: `${passage.slug}/block-${blockIndex}`,
                    message: "Cada bloque debe cubrir al menos tres dominios de comprensión.",
                });
            }
            if (blockQuestions.length === 5 && distinctStems !== 5) {
                issues.push({
                    item: `${passage.slug}/block-${blockIndex}`,
                    message: "Los cinco reactivos no deben repetir la misma apertura.",
                });
            }
        }
        for (const question of passageQuestions) {
            for (const item of validateReadingQuestion(question, passage).issues) {
                issues.push({
                    item: `${passage.slug}/${question.order_index}`,
                    message: `${item.path}: ${item.message}`,
                });
            }
        }
    }

    const slugs = catalog.passages.map((passage) => passage.slug);
    if (new Set(slugs).size !== slugs.length) {
        issues.push({ item: "catalog", message: "Hay slugs de lectura duplicados." });
    }
    const titles = catalog.passages.map((passage) =>
        passage.title.trim().toLocaleLowerCase("en"),
    );
    if (new Set(titles).size !== titles.length) {
        issues.push({ item: "catalog", message: "Hay títulos de lectura duplicados." });
    }
    const topics = catalog.passages.map((passage) =>
        passage.topic_es.trim().toLocaleLowerCase("es"),
    );
    if (new Set(topics).size !== topics.length) {
        issues.push({ item: "catalog", message: "Hay temas de lectura duplicados." });
    }
    const promptCounts = new Map<string, number>();
    for (const question of catalog.questions) {
        const prompt = question.prompt.trim().toLocaleLowerCase("en");
        promptCounts.set(prompt, (promptCounts.get(prompt) ?? 0) + 1);
    }
    const duplicatePrompt = [...promptCounts.entries()].find(([, count]) => count > 1);
    if (duplicatePrompt) {
        issues.push({
            item: "catalog",
            message: `Hay un enunciado duplicado: «${duplicatePrompt[0]}».`,
        });
    }
    const answerCounts = Object.fromEntries(OPTION_IDS.map((id) => [id, 0])) as Record<ReadingOptionId, number>;
    for (const question of catalog.questions) answerCounts[question.correct_option_id] += 1;
    if (Math.max(...Object.values(answerCounts)) - Math.min(...Object.values(answerCounts)) > 1) {
        issues.push({ item: "catalog", message: "Las claves A–D no están equilibradas." });
    }
    return issues;
}

export const READING_CATALOG = createReadingCatalog();
