import {
    applySEMGrade,
    createEmptySEMState,
    SEMGrade,
    type SEMCardState,
    type SEMResult,
} from "./sem";

export const GRAMMAR_OPTION_IDS = ["A", "B", "C", "D"] as const;
export type GrammarOptionId = (typeof GRAMMAR_OPTION_IDS)[number];
export type GrammarExerciseFormat = "sentence_completion" | "error_identification";
export type GrammarCEFRBand = "A2" | "B1" | "B2" | "C1";
export type GrammarContentStatus = "draft" | "review" | "published" | "retired";
export type GrammarProgressLabel = "new" | "learning" | "completed" | "mastered";

export interface GrammarOption {
    id: GrammarOptionId;
    text: string;
    misconceptionCode?: string;
    feedback?: string;
}

export interface SentenceCompletionPrompt {
    kind: "sentence_completion";
    before: string;
    after: string;
    options: GrammarOption[];
}

export interface ErrorIdentificationSegment {
    text: string;
    optionId?: GrammarOptionId;
}

export interface ErrorIdentificationPrompt {
    kind: "error_identification";
    segments: ErrorIdentificationSegment[];
}

export type GrammarPrompt = SentenceCompletionPrompt | ErrorIdentificationPrompt;

export interface GrammarDomain {
    id: string;
    code: string;
    name_es: string;
    order_index: number;
}

export interface GrammarSkill {
    id: string;
    domain_id: string;
    code: string;
    name_es: string;
    description_es: string;
    cefr_min: GrammarCEFRBand;
    order_index: number;
    is_active: boolean;
}

export interface GrammarExercise {
    id: string;
    primary_skill_id: string;
    domain_id: string;
    skill_code: string;
    format: GrammarExerciseFormat;
    cefr_band: GrammarCEFRBand;
    difficulty: 1 | 2 | 3;
    prompt: GrammarPrompt;
    correct_option_id: GrammarOptionId;
    corrected_sentence: string;
    explanation_es: string;
    status: GrammarContentStatus;
    content_version: number;
    linguistic_reviewed: boolean;
    fairness_reviewed: boolean;
}

export interface GrammarProgress extends SEMCardState {
    userId: string;
    exerciseId: string;
    firstSeenAt: string | null;
    correctAttempts: number;
    totalAttempts: number;
    revision: number;
}

export interface GrammarQueueCandidate {
    exercise: GrammarExercise;
    progress?: GrammarProgress;
}

export type GrammarQueueReason =
    | "overdue"
    | "lapse"
    | "weak_skill"
    | "new"
    | "maintenance"
    | "focused_practice";

export interface GrammarQueueItem {
    exercise: GrammarExercise;
    progress: GrammarProgress;
    reason: GrammarQueueReason;
}

export interface BuildGrammarQueueOptions {
    userId: string;
    now?: Date;
    sessionNumber?: number;
    size?: number;
    focusedSkillCode?: string;
}

export interface GrammarValidationIssue {
    path: string;
    message: string;
}

export interface GrammarValidationResult {
    valid: boolean;
    issues: GrammarValidationIssue[];
}

function isOptionId(value: unknown): value is GrammarOptionId {
    return GRAMMAR_OPTION_IDS.includes(value as GrammarOptionId);
}

function pushIssue(issues: GrammarValidationIssue[], path: string, message: string) {
    issues.push({ path, message });
}

/**
 * Structural publication gate. Semantic correctness still requires the two
 * explicit editorial review flags checked by `validateGrammarExercise`.
 */
export function validateGrammarPrompt(
    format: GrammarExerciseFormat,
    prompt: GrammarPrompt,
): GrammarValidationResult {
    const issues: GrammarValidationIssue[] = [];

    if (prompt.kind !== format) {
        pushIssue(issues, "prompt.kind", "Debe coincidir con el formato del ejercicio.");
        return { valid: false, issues };
    }

    if (prompt.kind === "sentence_completion") {
        if (!prompt.before.trim() && !prompt.after.trim()) {
            pushIssue(issues, "prompt", "La oración incompleta no puede estar vacía.");
        }
        if (prompt.options.length !== 4) {
            pushIssue(issues, "prompt.options", "Debe haber exactamente cuatro opciones.");
        }

        const ids = prompt.options.map((option) => option.id);
        if (new Set(ids).size !== 4 || GRAMMAR_OPTION_IDS.some((id) => !ids.includes(id))) {
            pushIssue(issues, "prompt.options", "Las opciones deben usar A, B, C y D una sola vez.");
        }

        const normalized = prompt.options.map((option) => option.text.trim().toLocaleLowerCase("en"));
        if (new Set(normalized).size !== normalized.length || normalized.some((text) => !text)) {
            pushIssue(issues, "prompt.options", "Las opciones deben ser únicas y no vacías.");
        }
    } else {
        const selectable = prompt.segments.filter((segment) => segment.optionId);
        if (selectable.length !== 4) {
            pushIssue(issues, "prompt.segments", "Debe haber exactamente cuatro segmentos seleccionables.");
        }
        const ids = selectable.map((segment) => segment.optionId);
        if (new Set(ids).size !== 4 || GRAMMAR_OPTION_IDS.some((id) => !ids.includes(id))) {
            pushIssue(issues, "prompt.segments", "Los segmentos deben exponer A, B, C y D una sola vez.");
        }
        if (prompt.segments.some((segment) => !segment.text)) {
            pushIssue(issues, "prompt.segments", "Ningún segmento puede estar vacío.");
        }
    }

    return { valid: issues.length === 0, issues };
}

export function validateGrammarExercise(exercise: GrammarExercise): GrammarValidationResult {
    const issues = [...validateGrammarPrompt(exercise.format, exercise.prompt).issues];
    if (!isOptionId(exercise.correct_option_id)) {
        pushIssue(issues, "correct_option_id", "La clave debe ser A, B, C o D.");
    }
    if (!exercise.corrected_sentence.trim()) {
        pushIssue(issues, "corrected_sentence", "Falta la oración corregida.");
    }
    if (exercise.explanation_es.trim().length < 24) {
        pushIssue(issues, "explanation_es", "La explicación es demasiado breve para enseñar la regla.");
    }
    if (exercise.content_version < 1 || !Number.isInteger(exercise.content_version)) {
        pushIssue(issues, "content_version", "La versión debe ser un entero positivo.");
    }
    if (![1, 2, 3].includes(exercise.difficulty)) {
        pushIssue(issues, "difficulty", "La dificultad debe estar entre 1 y 3.");
    }
    if (exercise.status === "published" && (!exercise.linguistic_reviewed || !exercise.fairness_reviewed)) {
        pushIssue(issues, "status", "Publicar exige revisión lingüística y de fairness.");
    }
    if (
        exercise.prompt.kind === "sentence_completion" &&
        !exercise.prompt.options.some((option) => option.id === exercise.correct_option_id)
    ) {
        pushIssue(issues, "correct_option_id", "La clave no existe entre las opciones.");
    }
    if (
        exercise.prompt.kind === "error_identification" &&
        !exercise.prompt.segments.some((segment) => segment.optionId === exercise.correct_option_id)
    ) {
        pushIssue(issues, "correct_option_id", "La clave no existe entre los segmentos.");
    }
    return { valid: issues.length === 0, issues };
}

export function createEmptyGrammarProgress(userId: string, exerciseId: string): GrammarProgress {
    return {
        ...createEmptySEMState(),
        userId,
        exerciseId,
        firstSeenAt: null,
        correctAttempts: 0,
        totalAttempts: 0,
        revision: 0,
    };
}

export function grammarProgressLabel(step: number): GrammarProgressLabel {
    if (step >= 8) return "mastered";
    if (step >= 2) return "completed";
    if (step >= 1) return "learning";
    return "new";
}

/**
 * Binary Grammar adapter. Time is deliberately absent from grading in V1;
 * callers log it on the attempt without changing the transition.
 */
export function evaluateGrammarReview(
    current: SEMCardState,
    isCorrect: boolean,
    reviewedAt?: Date,
): SEMResult {
    return applySEMGrade(current, {
        grade: isCorrect ? SEMGrade.Good : SEMGrade.Again,
        accuracy: isCorrect ? 1 : 0,
        reviewedAt,
    });
}

function stableHash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function candidatePriority(candidate: GrammarQueueCandidate, nowMs: number): number {
    const progress = candidate.progress;
    if (!progress) return 0;
    const overdueDays = Math.max(0, (nowMs - new Date(progress.dueDate).getTime()) / 86_400_000);
    return overdueDays * 100 + progress.lapses * 20 + progress.difficulty * 2 + 1 / Math.max(progress.interval, 0.25);
}

function queueReason(candidate: GrammarQueueCandidate, nowMs: number): GrammarQueueReason {
    if (!candidate.progress) return "new";
    if (candidate.progress.lapses > 0) return "lapse";
    if (candidate.progress.step >= 2 && new Date(candidate.progress.dueDate).getTime() <= nowMs) {
        return "maintenance";
    }
    return "overdue";
}

function candidateProgress(candidate: GrammarQueueCandidate, userId: string): GrammarProgress {
    return candidate.progress ?? createEmptyGrammarProgress(userId, candidate.exercise.id);
}

/**
 * Pure adaptive queue builder:
 * due work first, new work only fills the remaining places, deterministic
 * jitter, and soft diversity constraints. Retired/non-published content is
 * never eligible. This preserves the product promise of five light exercises
 * even for a brand-new learner.
 */
export function buildGrammarQueue(
    candidates: GrammarQueueCandidate[],
    options: BuildGrammarQueueOptions,
): GrammarQueueItem[] {
    const now = options.now ?? new Date();
    const nowMs = now.getTime();
    const size = Math.max(1, options.size ?? 5);
    const dayKey = now.toISOString().slice(0, 10);
    const seed = `${options.userId}:${dayKey}:${options.sessionNumber ?? 0}`;

    const eligible = candidates.filter(({ exercise }) =>
        exercise.status === "published" &&
        (!options.focusedSkillCode || exercise.skill_code === options.focusedSkillCode)
    );
    const due = eligible
        .filter(({ progress }) => progress && new Date(progress.dueDate).getTime() <= nowMs)
        .sort((left, right) => {
            const scoreDifference = candidatePriority(right, nowMs) - candidatePriority(left, nowMs);
            return scoreDifference || stableHash(`${seed}:${left.exercise.id}`) - stableHash(`${seed}:${right.exercise.id}`);
        });
    const seenBySkill = new Map<string, number>();
    for (const candidate of eligible) {
        if (candidate.progress) {
            seenBySkill.set(
                candidate.exercise.skill_code,
                (seenBySkill.get(candidate.exercise.skill_code) ?? 0) + 1,
            );
        }
    }
    const fresh = eligible
        .filter(({ progress }) => !progress)
        .sort((left, right) => {
            const coverageDifference =
                (seenBySkill.get(left.exercise.skill_code) ?? 0) -
                (seenBySkill.get(right.exercise.skill_code) ?? 0);
            return coverageDifference ||
                stableHash(`${seed}:${left.exercise.skill_code}:${left.exercise.id}`) -
                stableHash(`${seed}:${right.exercise.skill_code}:${right.exercise.id}`);
        });

    // Keep the full fresh pool available while applying diversity and format
    // constraints. Truncating here can accidentally preselect five items of
    // one format before the selector has a chance to form the intended mix.
    const pool = [...due, ...fresh];
    const selected: GrammarQueueCandidate[] = [];
    const remaining = [...pool];

    while (selected.length < size && remaining.length > 0) {
        const previous = selected.at(-1);
        const hasDueRemaining = remaining.some((candidate) => Boolean(candidate.progress));
        const isCurrentPriority = (candidate: GrammarQueueCandidate) =>
            !hasDueRemaining || Boolean(candidate.progress);
        const domainCounts = new Map<string, number>();
        for (const item of selected) {
            domainCounts.set(item.exercise.domain_id, (domainCounts.get(item.exercise.domain_id) ?? 0) + 1);
        }
        const preferredFormat = selected.filter((item) => item.exercise.format === "error_identification").length < 3
            ? "error_identification"
            : "sentence_completion";
        let index = remaining.findIndex((candidate) =>
            isCurrentPriority(candidate) &&
            candidate.exercise.skill_code !== previous?.exercise.skill_code &&
            (domainCounts.get(candidate.exercise.domain_id) ?? 0) < 2 &&
            candidate.exercise.format === preferredFormat
        );
        if (index < 0) {
            index = remaining.findIndex((candidate) =>
                isCurrentPriority(candidate) &&
                candidate.exercise.skill_code !== previous?.exercise.skill_code &&
                (domainCounts.get(candidate.exercise.domain_id) ?? 0) < 2
            );
        }
        if (index < 0) index = remaining.findIndex(isCurrentPriority);
        if (index < 0) index = 0;
        selected.push(remaining.splice(index, 1)[0]);
    }

    return selected.map((candidate) => ({
        exercise: candidate.exercise,
        progress: candidateProgress(candidate, options.userId),
        reason: options.focusedSkillCode ? "focused_practice" : queueReason(candidate, nowMs),
    }));
}

export interface GrammarDomainProgress {
    domainId: string;
    seen: number;
    completed: number;
    mastered: number;
    due: number;
    correctAttempts: number;
    totalAttempts: number;
}

export function aggregateGrammarProgress(
    exercises: GrammarExercise[],
    progress: GrammarProgress[],
    now: Date = new Date(),
): GrammarDomainProgress[] {
    const byExercise = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    const byDomain = new Map<string, GrammarDomainProgress>();
    for (const item of progress) {
        const exercise = byExercise.get(item.exerciseId);
        if (!exercise) continue;
        const aggregate = byDomain.get(exercise.domain_id) ?? {
            domainId: exercise.domain_id,
            seen: 0,
            completed: 0,
            mastered: 0,
            due: 0,
            correctAttempts: 0,
            totalAttempts: 0,
        };
        aggregate.seen += 1;
        aggregate.completed += item.step >= 2 ? 1 : 0;
        aggregate.mastered += item.step >= 8 ? 1 : 0;
        aggregate.due += new Date(item.dueDate).getTime() <= now.getTime() ? 1 : 0;
        aggregate.correctAttempts += item.correctAttempts;
        aggregate.totalAttempts += item.totalAttempts;
        byDomain.set(exercise.domain_id, aggregate);
    }
    return [...byDomain.values()].sort((left, right) => left.domainId.localeCompare(right.domainId));
}
