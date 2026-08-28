import { describe, expect, it } from "vitest";
import {
    aggregateReadingProgress,
    buildReadingQueue,
    createEmptyReadingQuestionProgress,
    createEmptyReadingSkillProgress,
    evaluateReadingAnswer,
    findResumableLongReading,
    validateReadingPassage,
    validateReadingQuestion,
    type ReadingPassage,
    type ReadingQuestion,
} from "./reading";

const body = [
    "Coastal fog forms when moist air moves across cold ocean water. The cooling causes water vapor to condense into tiny suspended droplets.",
    "Although fog can reduce visibility, it also supplies water to plants in regions where summer rain is scarce. Some leaves collect droplets and direct them toward the soil.",
].join("\n\n");

const passage: ReadingPassage = {
    id: "passage-1",
    slug: "coastal-fog",
    title: "Coastal Fog",
    topic_es: "Clima costero",
    genre: "natural_science",
    cefr_band: "B1",
    difficulty: 1,
    length_band: "short",
    body,
    word_count: 52,
    estimated_minutes: 4,
    status: "draft",
    content_version: 1,
    linguistic_reviewed: false,
    factual_reviewed: false,
    fairness_reviewed: false,
};

const question: ReadingQuestion = {
    id: "question-1",
    passage_id: passage.id,
    primary_skill_id: "skill-detail",
    domain_id: "domain-local",
    skill_code: "READ_DETAIL",
    block_index: 1,
    order_index: 1,
    difficulty: 1,
    prompt: "According to the passage, what causes water vapor to condense?",
    options: [
        { id: "A", text: "Cooling over cold water" },
        { id: "B", text: "A rise in summer rainfall" },
        { id: "C", text: "Heat released by leaves" },
        { id: "D", text: "Strong movement in the soil" },
    ],
    correct_option_id: "A",
    explanation_es: "El primer párrafo relaciona directamente el enfriamiento del aire con la condensación del vapor.",
    evidence: { paragraph: 1, quote: "The cooling causes water vapor to condense" },
    distractor_rationales: {
        B: "La lluvia de verano se describe como escasa, no como causa de la condensación.",
        C: "Las hojas recolectan gotas; el texto no afirma que produzcan calor.",
        D: "El suelo recibe agua, pero su movimiento no participa en la formación de niebla.",
    },
    status: "draft",
    content_version: 1,
    linguistic_reviewed: false,
    fairness_reviewed: false,
};

function makePassage(id: string, length: ReadingPassage["length_band"] = "short"): ReadingPassage {
    return {
        ...passage,
        id,
        slug: id,
        length_band: length,
        status: "published",
        linguistic_reviewed: true,
        factual_reviewed: true,
        fairness_reviewed: true,
    };
}

function makeQuestion(
    id: string,
    passageId: string,
    order: number,
    block: 1 | 2 = 1,
): ReadingQuestion {
    return {
        ...question,
        id,
        passage_id: passageId,
        primary_skill_id: `skill-${order}`,
        order_index: order,
        block_index: block,
        status: "published",
        linguistic_reviewed: true,
        fairness_reviewed: true,
    };
}

describe("Reading validation", () => {
    it("detects an incorrect word count", () => {
        const result = validateReadingPassage(passage);
        expect(result.valid).toBe(false);
        expect(result.issues.some((item) => item.path === "word_count")).toBe(true);
    });

    it("validates evidence and distractor rationales", () => {
        const result = validateReadingQuestion(question, passage);
        expect(result.valid).toBe(true);
    });

    it("rejects evidence that is not present in the declared paragraph", () => {
        const result = validateReadingQuestion(
            { ...question, evidence: { paragraph: 2, quote: "The cooling causes" } },
            passage,
        );
        expect(result.valid).toBe(false);
        expect(result.issues.some((item) => item.path === "evidence.quote")).toBe(true);
    });
});

describe("Reading learning model", () => {
    it("cleans a first-try correct item without scheduling exact repetition", () => {
        const questionProgress = createEmptyReadingQuestionProgress("user", question.id);
        const skillProgress = createEmptyReadingSkillProgress("user", question.primary_skill_id);
        const result = evaluateReadingAnswer(
            questionProgress,
            skillProgress,
            true,
            new Date("2026-07-28T12:00:00.000Z"),
        );
        expect(result.questionProgress.points).toBe(2);
        expect(result.skillTransition.grade).toBe(2);
    });

    it("requires two successful recoveries after an error", () => {
        const emptyQuestion = createEmptyReadingQuestionProgress("user", question.id);
        const skill = createEmptyReadingSkillProgress("user", question.primary_skill_id);
        const missed = evaluateReadingAnswer(emptyQuestion, skill, false);
        const recoveredOnce = evaluateReadingAnswer(missed.questionProgress, skill, true);
        const recoveredTwice = evaluateReadingAnswer(recoveredOnce.questionProgress, skill, true);
        expect(missed.questionProgress.points).toBe(0);
        expect(recoveredOnce.questionProgress.points).toBe(1);
        expect(recoveredTwice.questionProgress.points).toBe(2);
    });
});

describe("Reading queue", () => {
    it("forms a coherent five-question block from one passage", () => {
        const first = makePassage("first");
        const second = makePassage("second");
        const candidates = [first, second].flatMap((item) =>
            Array.from({ length: 5 }, (_, index) => ({
                passage: item,
                question: makeQuestion(`${item.id}-${index + 1}`, item.id, index + 1),
            })),
        );
        const queue = buildReadingQueue(candidates, {
            userId: "user",
            now: new Date("2026-07-28T12:00:00.000Z"),
            sessionNumber: 1,
        });
        expect(queue).toHaveLength(5);
        expect(new Set(queue.map((item) => item.passage.id)).size).toBe(1);
    });

    it("avoids a recently exposed passage when fresh alternatives exist", () => {
        const recent = makePassage("recent");
        const fresh = makePassage("fresh");
        const candidates = [recent, fresh].flatMap((item) =>
            Array.from({ length: 5 }, (_, index) => ({
                passage: item,
                question: makeQuestion(`${item.id}-${index + 1}`, item.id, index + 1),
            })),
        );
        const queue = buildReadingQueue(candidates, {
            userId: "user",
            now: new Date("2026-07-28T12:00:00.000Z"),
            recentPassageIds: [recent.id],
        });
        expect(queue.every((item) => item.passage.id === fresh.id)).toBe(true);
    });

    it("keeps block two locked until a long passage has been started", () => {
        const long = makePassage("long", "long");
        const candidates = Array.from({ length: 10 }, (_, index) => ({
            passage: long,
            question: makeQuestion(
                `long-${index + 1}`,
                long.id,
                index + 1,
                index < 5 ? 1 : 2,
            ),
        }));
        const firstQueue = buildReadingQueue(candidates, {
            userId: "user",
            now: new Date("2026-07-28T12:00:00.000Z"),
        });
        expect(firstQueue.every((item) => item.question.block_index === 1)).toBe(true);
    });

    it("keeps daily sessions light and reserves long texts for long mode", () => {
        const short = makePassage("short");
        const long = makePassage("long-mode", "long");
        const candidates = [short, long].flatMap((item) =>
            Array.from({ length: 5 }, (_, index) => ({
                passage: item,
                question: makeQuestion(`${item.id}-${index + 1}`, item.id, index + 1),
            })),
        );
        const daily = buildReadingQueue(candidates, {
            userId: "user",
            passageMode: "daily",
        });
        const longSession = buildReadingQueue(candidates, {
            userId: "user",
            passageMode: "long",
        });
        expect(daily.every((item) => item.passage.length_band !== "long")).toBe(true);
        expect(longSession.every((item) => item.passage.length_band === "long")).toBe(true);
    });

    it("does not repeat a completed exact question for skill maintenance", () => {
        const item = makePassage("completed");
        const completed = {
            ...createEmptyReadingQuestionProgress("user", "completed-1"),
            points: 2 as const,
            attempts: 1,
            correctAttempts: 1,
            dueAt: "2026-01-01T00:00:00.000Z",
        };
        const queue = buildReadingQueue([
            {
                passage: item,
                question: makeQuestion("completed-1", item.id, 1),
                questionProgress: completed,
            },
        ], {
            userId: "user",
            now: new Date("2026-07-28T12:00:00.000Z"),
        });
        expect(queue).toHaveLength(0);
    });

    it("never queues retired passages or questions", () => {
        const retiredPassage = { ...makePassage("retired-passage"), status: "retired" as const };
        const activePassage = makePassage("active-passage");
        const retiredQuestion = {
            ...makeQuestion("retired-question", activePassage.id, 1),
            status: "retired" as const,
        };
        const queue = buildReadingQueue([
            {
                passage: retiredPassage,
                question: makeQuestion("active-question", retiredPassage.id, 1),
            },
            { passage: activePassage, question: retiredQuestion },
        ], {
            userId: "user",
            now: new Date("2026-07-28T12:00:00.000Z"),
        });
        expect(queue).toHaveLength(0);
    });

    it("does not repeat a recovering question before its due time", () => {
        const item = makePassage("not-due");
        const recovering = {
            ...createEmptyReadingQuestionProgress("user", "not-due-1"),
            points: 0 as const,
            attempts: 1,
            dueAt: "2026-07-28T12:10:00.000Z",
        };
        const early = buildReadingQueue([{
            passage: item,
            question: makeQuestion("not-due-1", item.id, 1),
            questionProgress: recovering,
        }], {
            userId: "user",
            now: new Date("2026-07-28T12:05:00.000Z"),
        });
        const due = buildReadingQueue([{
            passage: item,
            question: makeQuestion("not-due-1", item.id, 1),
            questionProgress: recovering,
        }], {
            userId: "user",
            now: new Date("2026-07-28T12:10:00.000Z"),
        });
        expect(early).toHaveLength(0);
        expect(due).toHaveLength(1);
        expect(due[0].reason).toBe("recovery");
    });

    it("resumes only the preferred reading even when fewer than five items remain", () => {
        const preferred = makePassage("resume");
        const other = makePassage("other");
        const candidates = [
            ...Array.from({ length: 3 }, (_, index) => ({
                passage: preferred,
                question: makeQuestion(`resume-${index + 1}`, preferred.id, index + 1),
            })),
            ...Array.from({ length: 5 }, (_, index) => ({
                passage: other,
                question: makeQuestion(`other-${index + 1}`, other.id, index + 1),
            })),
        ];
        const queue = buildReadingQueue(candidates, {
            userId: "user",
            preferredPassageId: preferred.id,
            preferredBlockIndex: 1,
        });
        expect(queue).toHaveLength(3);
        expect(queue.every((item) => item.passage.id === preferred.id)).toBe(true);
    });
});

describe("Reading aggregation", () => {
    it("counts completed and recovering questions by domain", () => {
        const questions = [
            makeQuestion("q1", passage.id, 1),
            makeQuestion("q2", passage.id, 2),
        ];
        const first = {
            ...createEmptyReadingQuestionProgress("user", "q1"),
            points: 2 as const,
            attempts: 1,
            correctAttempts: 1,
        };
        const second = {
            ...createEmptyReadingQuestionProgress("user", "q2"),
            points: 0 as const,
            attempts: 1,
        };
        expect(aggregateReadingProgress(questions, [first, second])).toEqual([
            expect.objectContaining({ completed: 1, recovering: 1, seen: 2 }),
        ]);
    });
});

describe("Long-reading continuation", () => {
    const longPassage = makePassage("long-continuation", "long");
    const longQuestions = Array.from({ length: 10 }, (_, index) =>
        makeQuestion(
            `long-continuation-${index + 1}`,
            longPassage.id,
            index + 1,
            index < 5 ? 1 : 2,
        ),
    );
    const exposures = [{
        userId: "user",
        passageId: longPassage.id,
        lastSeenAt: "2026-07-28T12:00:00.000Z",
        exposureCount: 1,
    }];

    it("resumes an interrupted first block", () => {
        const progress = longQuestions.slice(0, 2).map((item) => ({
            ...createEmptyReadingQuestionProgress("user", item.id),
            attempts: 1,
        }));
        expect(findResumableLongReading(
            [longPassage],
            longQuestions,
            progress,
            exposures,
        )).toEqual({ passageId: longPassage.id, blockIndex: 1 });
    });

    it("unlocks block two after every first-block question was attempted", () => {
        const progress = longQuestions.slice(0, 5).map((item, index) => ({
            ...createEmptyReadingQuestionProgress("user", item.id),
            attempts: 1,
            points: index === 0 ? 0 as const : 2 as const,
        }));
        expect(findResumableLongReading(
            [longPassage],
            longQuestions,
            progress,
            exposures,
        )).toEqual({ passageId: longPassage.id, blockIndex: 2 });
    });

    it("does not call a fully attempted long reading unfinished", () => {
        const progress = longQuestions.map((item) => ({
            ...createEmptyReadingQuestionProgress("user", item.id),
            attempts: 1,
        }));
        expect(findResumableLongReading(
            [longPassage],
            longQuestions,
            progress,
            exposures,
        )).toBeNull();
    });

    it("prefers the most recently exposed unfinished long reading", () => {
        const newer = makePassage("newer-long", "long");
        const newerQuestions = Array.from({ length: 10 }, (_, index) =>
            makeQuestion(
                `newer-long-${index + 1}`,
                newer.id,
                index + 1,
                index < 5 ? 1 : 2,
            ),
        );
        const progress = [
            {
                ...createEmptyReadingQuestionProgress("user", longQuestions[0].id),
                attempts: 1,
            },
            {
                ...createEmptyReadingQuestionProgress("user", newerQuestions[0].id),
                attempts: 1,
            },
        ];
        expect(findResumableLongReading(
            [longPassage, newer],
            [...longQuestions, ...newerQuestions],
            progress,
            [
                ...exposures,
                {
                    userId: "user",
                    passageId: newer.id,
                    lastSeenAt: "2026-07-29T12:00:00.000Z",
                    exposureCount: 1,
                },
            ],
        )).toEqual({ passageId: newer.id, blockIndex: 1 });
    });
});
