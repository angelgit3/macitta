import {
    applySEMGrade,
    createEmptySEMState,
    SEMGrade,
    type SEMCardState,
    type SEMResult,
} from "./sem";

export const READING_OPTION_IDS = ["A", "B", "C", "D"] as const;
export type ReadingOptionId = (typeof READING_OPTION_IDS)[number];
export type ReadingCEFRBand = "A2" | "B1" | "B2" | "C1";
export type ReadingLengthBand = "short" | "standard" | "long";
export type ReadingGenre =
    | "natural_science"
    | "social_science"
    | "history"
    | "arts"
    | "technology";
export type ReadingContentStatus = "draft" | "review" | "published" | "retired";
export type ReadingQuestionState = "new" | "recovering" | "completed";

export interface ReadingOption {
    id: ReadingOptionId;
    text: string;
}

export interface ReadingEvidence {
    paragraph: number;
    quote: string;
}

export interface ReadingDomain {
    id: string;
    code: string;
    name_es: string;
    order_index: number;
}

export interface ReadingSkill {
    id: string;
    domain_id: string;
    code: string;
    name_es: string;
    description_es: string;
    order_index: number;
    is_active: boolean;
}

export interface ReadingPassage {
    id: string;
    slug: string;
    title: string;
    topic_es: string;
    genre: ReadingGenre;
    cefr_band: ReadingCEFRBand;
    difficulty: 1 | 2 | 3;
    length_band: ReadingLengthBand;
    body: string;
    word_count: number;
    estimated_minutes: number;
    status: ReadingContentStatus;
    content_version: number;
    linguistic_reviewed: boolean;
    factual_reviewed: boolean;
    fairness_reviewed: boolean;
}

export interface ReadingQuestion {
    id: string;
    passage_id: string;
    primary_skill_id: string;
    domain_id: string;
    skill_code: string;
    block_index: 1 | 2;
    order_index: number;
    difficulty: 1 | 2 | 3;
    prompt: string;
    options: ReadingOption[];
    correct_option_id: ReadingOptionId;
    explanation_es: string;
    evidence: ReadingEvidence;
    distractor_rationales: Partial<Record<ReadingOptionId, string>>;
    status: ReadingContentStatus;
    content_version: number;
    linguistic_reviewed: boolean;
    fairness_reviewed: boolean;
}

export interface ReadingQuestionProgress {
    userId: string;
    questionId: string;
    points: 0 | 1 | 2;
    attempts: number;
    correctAttempts: number;
    lastAnsweredAt: string | null;
    dueAt: string;
    revision: number;
}

export interface ReadingSkillProgress extends SEMCardState {
    userId: string;
    skillId: string;
    correctAttempts: number;
    totalAttempts: number;
    revision: number;
}

export interface ReadingPassageExposure {
    userId: string;
    passageId: string;
    lastSeenAt: string;
    exposureCount: number;
}

export interface ReadingQueueCandidate {
    passage: ReadingPassage;
    question: ReadingQuestion;
    questionProgress?: ReadingQuestionProgress;
    skillProgress?: ReadingSkillProgress;
}

export type ReadingQueueReason =
    | "recovery"
    | "weak_skill"
    | "new"
    | "maintenance"
    | "continued_reading";

export interface ReadingQueueItem {
    passage: ReadingPassage;
    question: ReadingQuestion;
    questionProgress: ReadingQuestionProgress;
    skillProgress: ReadingSkillProgress;
    reason: ReadingQueueReason;
}

export interface BuildReadingQueueOptions {
    userId: string;
    now?: Date;
    size?: number;
    sessionNumber?: number;
    passageMode?: "daily" | "long" | "any";
    recentPassageIds?: string[];
    preferredPassageId?: string;
    preferredBlockIndex?: 1 | 2;
}

export interface ReadingValidationIssue {
    path: string;
    message: string;
}

export interface ReadingValidationResult {
    valid: boolean;
    issues: ReadingValidationIssue[];
}

export interface ReadingAnswerResult {
    questionProgress: ReadingQuestionProgress;
    skillTransition: SEMResult;
}

function stableHash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function readingParagraphs(passage: Pick<ReadingPassage, "body">): string[] {
    return passage.body
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

export function countReadingWords(body: string): number {
    return body.trim().split(/\s+/).filter(Boolean).length;
}

function issue(
    issues: ReadingValidationIssue[],
    path: string,
    message: string,
) {
    issues.push({ path, message });
}

export function validateReadingPassage(passage: ReadingPassage): ReadingValidationResult {
    const issues: ReadingValidationIssue[] = [];
    const paragraphs = readingParagraphs(passage);
    const measuredWords = countReadingWords(passage.body);
    if (paragraphs.length < 2) {
        issue(issues, "body", "La lectura debe contener al menos dos párrafos.");
    }
    if (measuredWords !== passage.word_count) {
        issue(issues, "word_count", `El conteo declarado (${passage.word_count}) no coincide con el texto (${measuredWords}).`);
    }
    const lengthRange: Record<ReadingLengthBand, [number, number]> = {
        short: [120, 239],
        standard: [240, 449],
        long: [450, 900],
    };
    const [minimum, maximum] = lengthRange[passage.length_band];
    if (measuredWords < minimum || measuredWords > maximum) {
        issue(
            issues,
            "length_band",
            `La longitud ${passage.length_band} requiere entre ${minimum} y ${maximum} palabras; el texto tiene ${measuredWords}.`,
        );
    }
    if (passage.estimated_minutes < 2 || passage.estimated_minutes > 25) {
        issue(issues, "estimated_minutes", "La estimación debe estar entre 2 y 25 minutos.");
    }
    if (passage.content_version < 1 || !Number.isInteger(passage.content_version)) {
        issue(issues, "content_version", "La versión debe ser un entero positivo.");
    }
    if (
        passage.status === "published" &&
        (!passage.linguistic_reviewed || !passage.factual_reviewed || !passage.fairness_reviewed)
    ) {
        issue(issues, "status", "Publicar exige revisión lingüística, factual y de fairness.");
    }
    return { valid: issues.length === 0, issues };
}

export function validateReadingQuestion(
    question: ReadingQuestion,
    passage: ReadingPassage,
): ReadingValidationResult {
    const issues: ReadingValidationIssue[] = [];
    if (question.passage_id !== passage.id) {
        issue(issues, "passage_id", "La pregunta no pertenece a la lectura indicada.");
    }
    if (question.options.length !== 4) {
        issue(issues, "options", "Debe haber exactamente cuatro opciones.");
    }
    const ids = question.options.map((option) => option.id);
    if (
        new Set(ids).size !== 4 ||
        READING_OPTION_IDS.some((optionId) => !ids.includes(optionId))
    ) {
        issue(issues, "options", "Las opciones deben usar A, B, C y D una sola vez.");
    }
    const normalized = question.options.map((option) => option.text.trim().toLocaleLowerCase("en"));
    if (normalized.some((text) => !text) || new Set(normalized).size !== normalized.length) {
        issue(issues, "options", "Las opciones deben ser únicas y no vacías.");
    }
    if (!ids.includes(question.correct_option_id)) {
        issue(issues, "correct_option_id", "La clave debe existir entre las opciones.");
    }
    if (question.explanation_es.trim().length < 32) {
        issue(issues, "explanation_es", "La explicación debe enseñar cómo localizar o inferir la respuesta.");
    }
    const paragraphs = readingParagraphs(passage);
    const evidenceParagraph = paragraphs[question.evidence.paragraph - 1];
    if (!evidenceParagraph) {
        issue(issues, "evidence.paragraph", "El párrafo de evidencia no existe.");
    } else if (
        !evidenceParagraph.toLocaleLowerCase("en").includes(
            question.evidence.quote.trim().toLocaleLowerCase("en"),
        )
    ) {
        issue(issues, "evidence.quote", "La cita de evidencia no aparece literalmente en el párrafo indicado.");
    }
    for (const optionId of READING_OPTION_IDS) {
        if (optionId === question.correct_option_id) continue;
        if ((question.distractor_rationales[optionId] ?? "").trim().length < 16) {
            issue(issues, `distractor_rationales.${optionId}`, "Cada distractor necesita una explicación específica.");
        }
    }
    if (
        question.status === "published" &&
        (!question.linguistic_reviewed || !question.fairness_reviewed)
    ) {
        issue(issues, "status", "Publicar exige revisión lingüística y de fairness.");
    }
    return { valid: issues.length === 0, issues };
}

export function createEmptyReadingQuestionProgress(
    userId: string,
    questionId: string,
    now: Date = new Date(),
): ReadingQuestionProgress {
    return {
        userId,
        questionId,
        points: 0,
        attempts: 0,
        correctAttempts: 0,
        lastAnsweredAt: null,
        dueAt: now.toISOString(),
        revision: 0,
    };
}

export function createEmptyReadingSkillProgress(
    userId: string,
    skillId: string,
): ReadingSkillProgress {
    return {
        ...createEmptySEMState(),
        userId,
        skillId,
        correctAttempts: 0,
        totalAttempts: 0,
        revision: 0,
    };
}

export function readingQuestionState(progress: ReadingQuestionProgress): ReadingQuestionState {
    if (progress.points >= 2) return "completed";
    if (progress.attempts > 0) return "recovering";
    return "new";
}

/**
 * Reading avoids false mastery caused by memorizing a passage:
 * - a first-try correct answer becomes clean immediately;
 * - an item missed once needs two later successful recoveries;
 * - long-term maintenance is scheduled on the skill, preferably with fresh items.
 */
export function evaluateReadingAnswer(
    questionProgress: ReadingQuestionProgress,
    skillProgress: ReadingSkillProgress,
    isCorrect: boolean,
    answeredAt: Date = new Date(),
): ReadingAnswerResult {
    const firstTryClean = isCorrect && questionProgress.attempts === 0;
    const nextPoints = isCorrect
        ? firstTryClean
            ? 2
            : Math.min(2, questionProgress.points + 1)
        : 0;
    const recoveryDelayMs = nextPoints >= 2
        ? 30 * 24 * 60 * 60 * 1000
        : isCorrect
            ? 2 * 24 * 60 * 60 * 1000
            : 10 * 60 * 1000;
    const questionNext: ReadingQuestionProgress = {
        ...questionProgress,
        points: nextPoints as 0 | 1 | 2,
        attempts: questionProgress.attempts + 1,
        correctAttempts: questionProgress.correctAttempts + (isCorrect ? 1 : 0),
        lastAnsweredAt: answeredAt.toISOString(),
        dueAt: new Date(answeredAt.getTime() + recoveryDelayMs).toISOString(),
        revision: questionProgress.revision + 1,
    };
    return {
        questionProgress: questionNext,
        skillTransition: applySEMGrade(skillProgress, {
            grade: isCorrect ? SEMGrade.Good : SEMGrade.Again,
            accuracy: isCorrect ? 1 : 0,
            reviewedAt: answeredAt,
        }),
    };
}

interface ReadingBlock {
    key: string;
    passage: ReadingPassage;
    blockIndex: 1 | 2;
    candidates: ReadingQueueCandidate[];
    score: number;
}

function blockReason(
    candidate: ReadingQueueCandidate,
    nowMs: number,
    preferred: boolean,
): ReadingQueueReason {
    if (preferred) return "continued_reading";
    const progress = candidate.questionProgress;
    if (progress && progress.points < 2 && new Date(progress.dueAt).getTime() <= nowMs) {
        return "recovery";
    }
    if (!progress) {
        const skill = candidate.skillProgress;
        if (skill && (skill.lapses > 0 || new Date(skill.dueDate).getTime() <= nowMs)) {
            return "weak_skill";
        }
        return "new";
    }
    return "maintenance";
}

function scoreBlock(
    candidates: ReadingQueueCandidate[],
    options: BuildReadingQueueOptions,
    nowMs: number,
): number {
    const passageId = candidates[0].passage.id;
    const blockIndex = candidates[0].question.block_index;
    const preferred =
        passageId === options.preferredPassageId &&
        (!options.preferredBlockIndex || blockIndex === options.preferredBlockIndex);
    let score = preferred ? 100_000 : 0;
    for (const candidate of candidates) {
        const progress = candidate.questionProgress;
        if (!progress) {
            score += 1_000;
            if (
                candidate.skillProgress &&
                new Date(candidate.skillProgress.dueDate).getTime() <= nowMs
            ) {
                score += 350 + candidate.skillProgress.lapses * 50;
            }
        } else if (progress.points < 2) {
            const overdueDays = Math.max(
                0,
                (nowMs - new Date(progress.dueAt).getTime()) / 86_400_000,
            );
            score += new Date(progress.dueAt).getTime() <= nowMs
                ? 3_000 + overdueDays * 50
                : 120;
        }
    }
    if (options.recentPassageIds?.includes(passageId) && !preferred) score -= 20_000;
    return score;
}

/**
 * Selects coherent passage blocks instead of five unrelated prompts. A normal
 * session uses one passage; recovery work may spill into a second passage only
 * when the first block has fewer than five eligible questions.
 */
export function buildReadingQueue(
    candidates: ReadingQueueCandidate[],
    options: BuildReadingQueueOptions,
): ReadingQueueItem[] {
    const now = options.now ?? new Date();
    const nowMs = now.getTime();
    const size = Math.max(1, options.size ?? 5);
    const seed = `${options.userId}:${now.toISOString().slice(0, 10)}:${options.sessionNumber ?? 0}`;
    const passageMode = options.passageMode ?? "any";
    const eligible = candidates.filter(({ passage, question, questionProgress }) =>
        passage.status === "published" &&
        question.status === "published" &&
        (passageMode === "any" ||
            (passageMode === "long" && passage.length_band === "long") ||
            (passageMode === "daily" && passage.length_band !== "long")) &&
        (
            !questionProgress ||
            (
                questionProgress.points < 2 &&
                new Date(questionProgress.dueAt).getTime() <= nowMs
            )
        )
    );
    const startedPassages = new Set(
        candidates
            .filter((candidate) => Boolean(candidate.questionProgress))
            .map((candidate) => candidate.passage.id),
    );
    const grouped = new Map<string, ReadingQueueCandidate[]>();
    for (const candidate of eligible) {
        if (
            candidate.question.block_index === 2 &&
            !startedPassages.has(candidate.passage.id) &&
            candidate.passage.id !== options.preferredPassageId
        ) {
            continue;
        }
        const key = `${candidate.passage.id}:${candidate.question.block_index}`;
        const group = grouped.get(key) ?? [];
        group.push(candidate);
        grouped.set(key, group);
    }
    const blocks: ReadingBlock[] = [...grouped.entries()]
        .map(([key, blockCandidates]) => ({
            key,
            passage: blockCandidates[0].passage,
            blockIndex: blockCandidates[0].question.block_index,
            candidates: blockCandidates.sort(
                (left, right) => left.question.order_index - right.question.order_index,
            ),
            score: scoreBlock(blockCandidates, options, nowMs),
        }))
        .sort((left, right) =>
            right.score - left.score ||
            stableHash(`${seed}:${left.key}`) - stableHash(`${seed}:${right.key}`)
        );

    const selected: ReadingQueueCandidate[] = [];
    for (const block of blocks) {
        if (selected.length >= size) break;
        const freshOrRecovering = block.candidates.filter((candidate) =>
            !candidate.questionProgress ||
            (
                candidate.questionProgress.points < 2 &&
                new Date(candidate.questionProgress.dueAt).getTime() <= nowMs
            )
        );
        for (const candidate of freshOrRecovering) {
            if (selected.length >= size) break;
            selected.push(candidate);
        }
        if (options.preferredPassageId && block.passage.id === options.preferredPassageId) {
            break;
        }
    }

    return selected.map((candidate) => {
        const preferred =
            candidate.passage.id === options.preferredPassageId &&
            (!options.preferredBlockIndex ||
                candidate.question.block_index === options.preferredBlockIndex);
        return {
            passage: candidate.passage,
            question: candidate.question,
            questionProgress:
                candidate.questionProgress ??
                createEmptyReadingQuestionProgress(options.userId, candidate.question.id, now),
            skillProgress:
                candidate.skillProgress ??
                createEmptyReadingSkillProgress(options.userId, candidate.question.primary_skill_id),
            reason: blockReason(candidate, nowMs, preferred),
        };
    });
}

export interface ResumableLongReading {
    passageId: string;
    blockIndex: 1 | 2;
}

/**
 * Returns the most recently exposed unfinished long reading. Recovery points
 * do not block forward progress: once all five questions in block one have
 * been attempted, continuation moves to block two and exact-item recovery
 * remains in the spaced queue.
 */
export function findResumableLongReading(
    passages: ReadingPassage[],
    questions: ReadingQuestion[],
    progress: ReadingQuestionProgress[],
    exposures: ReadingPassageExposure[],
): ResumableLongReading | null {
    const progressByQuestion = new Map(
        progress.map((item) => [item.questionId, item]),
    );
    const exposureByPassage = new Map(
        exposures.map((exposure) => [exposure.passageId, exposure.lastSeenAt]),
    );
    const passagesByRecentExposure = passages
        .filter((passage) => passage.length_band === "long")
        .sort((left, right) =>
            (exposureByPassage.get(right.id) ?? "").localeCompare(
                exposureByPassage.get(left.id) ?? "",
            ),
        );

    for (const passage of passagesByRecentExposure) {
        const passageQuestions = questions.filter(
            (question) => question.passage_id === passage.id,
        );
        const firstBlockStarted = passageQuestions.some(
            (question) =>
                question.block_index === 1 &&
                (progressByQuestion.get(question.id)?.attempts ?? 0) > 0,
        );
        if (!firstBlockStarted) continue;
        const firstBlockUnanswered = passageQuestions.some(
            (question) =>
                question.block_index === 1 &&
                (progressByQuestion.get(question.id)?.attempts ?? 0) === 0,
        );
        if (firstBlockUnanswered) {
            return { passageId: passage.id, blockIndex: 1 };
        }
        const secondBlockUnanswered = passageQuestions.some(
            (question) =>
                question.block_index === 2 &&
                (progressByQuestion.get(question.id)?.attempts ?? 0) === 0,
        );
        if (secondBlockUnanswered) {
            return { passageId: passage.id, blockIndex: 2 };
        }
    }
    return null;
}

export interface ReadingDomainProgress {
    domainId: string;
    seen: number;
    completed: number;
    recovering: number;
    correctAttempts: number;
    totalAttempts: number;
}

export function aggregateReadingProgress(
    questions: ReadingQuestion[],
    progress: ReadingQuestionProgress[],
): ReadingDomainProgress[] {
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const domains = new Map<string, ReadingDomainProgress>();
    for (const item of progress) {
        const question = questionById.get(item.questionId);
        if (!question) continue;
        const aggregate = domains.get(question.domain_id) ?? {
            domainId: question.domain_id,
            seen: 0,
            completed: 0,
            recovering: 0,
            correctAttempts: 0,
            totalAttempts: 0,
        };
        aggregate.seen += 1;
        aggregate.completed += item.points >= 2 ? 1 : 0;
        aggregate.recovering += item.points < 2 ? 1 : 0;
        aggregate.correctAttempts += item.correctAttempts;
        aggregate.totalAttempts += item.attempts;
        domains.set(question.domain_id, aggregate);
    }
    return [...domains.values()].sort((left, right) =>
        left.domainId.localeCompare(right.domainId),
    );
}
