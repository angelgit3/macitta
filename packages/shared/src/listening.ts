import {
    applySEMGrade,
    createEmptySEMState,
    SEMGrade,
    type SEMCardState,
} from "./sem";

export const LISTENING_OPTION_IDS = ["A", "B", "C", "D"] as const;
export type ListeningOptionId = (typeof LISTENING_OPTION_IDS)[number];
export type ListeningUnitKind = "quick" | "long";
export type ListeningSourceKind = "short_conversation" | "campus_conversation" | "academic_talk";
export type ListeningDifficulty = 1 | 2 | 3;
export type ListeningSkillCode =
    | "gist"
    | "detail"
    | "inference"
    | "function"
    | "idiom"
    | "attitude"
    | "organization"
    | "who_what_where"
    | "passive"
    | "multiple_nouns"
    | "negative"
    | "double_negative"
    | "almost_negative"
    | "comparative"
    | "agreement"
    | "uncertainty"
    | "suggestion"
    | "surprise"
    | "wish";

export interface ListeningSkill {
    code: ListeningSkillCode;
    name_es: string;
    description_es: string;
}

export interface ListeningOption {
    id: ListeningOptionId;
    text: string;
}

export interface ListeningUnit {
    id: string;
    title: string;
    kind: ListeningUnitKind;
    source_kind: ListeningSourceKind;
    difficulty: ListeningDifficulty;
    audio_path: string;
    duration_seconds: number;
    transcript: string;
    note_prompt_es: string;
    accent: "north_american";
    content_version: number;
    is_published: boolean;
}

export interface ListeningQuestion {
    id: string;
    unit_id: string;
    order_index: number;
    primary_skill_code: ListeningSkillCode;
    difficulty: ListeningDifficulty;
    prompt: string;
    options: ListeningOption[];
    correct_option_id: ListeningOptionId;
    explanation_es: string;
    evidence: string;
}

export interface ListeningQuestionProgress {
    userId: string;
    questionId: string;
    points: 0 | 1 | 2;
    attempts: number;
    correctAttempts: number;
    lastAnsweredAt: string | null;
    dueAt: string;
    revision: number;
}

export interface ListeningSkillProgress extends SEMCardState {
    userId: string;
    skillCode: ListeningSkillCode;
    correctAttempts: number;
    totalAttempts: number;
    revision: number;
}

export interface ListeningQueueCandidate {
    unit: ListeningUnit;
    question: ListeningQuestion;
    progress?: ListeningQuestionProgress;
    skillProgress?: ListeningSkillProgress;
}

export type ListeningQueueReason = "due" | "weak_ear" | "new" | "recovery" | "long_set";

export interface ListeningQueueItem {
    unit: ListeningUnit;
    question: ListeningQuestion;
    progress: ListeningQuestionProgress;
    reason: ListeningQueueReason;
}

export interface BuildListeningQueueOptions {
    userId: string;
    mode: ListeningUnitKind;
    size?: number;
    now?: Date;
    sessionNumber?: number;
    recentUnitIds?: string[];
}

export interface ListeningReviewResult {
    questionProgress: ListeningQuestionProgress;
    skillProgress: ListeningSkillProgress;
    earnedPoints: 0 | 1 | 2;
}

const DAY = 86_400_000;

function stableHash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function createEmptyListeningQuestionProgress(userId: string, questionId: string): ListeningQuestionProgress {
    return {
        userId,
        questionId,
        points: 0,
        attempts: 0,
        correctAttempts: 0,
        lastAnsweredAt: null,
        dueAt: new Date(0).toISOString(),
        revision: 0,
    };
}

export function createEmptyListeningSkillProgress(
    userId: string,
    skillCode: ListeningSkillCode,
): ListeningSkillProgress {
    return {
        ...createEmptySEMState(),
        userId,
        skillCode,
        correctAttempts: 0,
        totalAttempts: 0,
        revision: 0,
    };
}

/**
 * Listening has a deliberately transparent rule: correct on the first play
 * earns two points (clean); correct after replay earns one; an error resets
 * the item to recovery. Skill-level SREM still chooses the next weak ear.
 */
export function evaluateListeningAnswer(
    questionProgress: ListeningQuestionProgress,
    skillProgress: ListeningSkillProgress,
    isCorrect: boolean,
    playCount: number,
    answeredAt: Date = new Date(),
): ListeningReviewResult {
    const firstListen = playCount <= 1;
    const earnedPoints: 0 | 1 | 2 = isCorrect ? (firstListen ? 2 : 1) : 0;
    const nextPoints: 0 | 1 | 2 = isCorrect
        ? Math.min(2, questionProgress.points + earnedPoints) as 0 | 1 | 2
        : 0;
    const interval = nextPoints === 2 ? 30 : nextPoints === 1 ? 2 : 0;
    const skillTransition = applySEMGrade(skillProgress, {
        grade: isCorrect ? (firstListen ? SEMGrade.Good : SEMGrade.Hard) : SEMGrade.Again,
        accuracy: isCorrect ? (firstListen ? 1 : 0.65) : 0,
        reviewedAt: answeredAt,
    });
    return {
        earnedPoints,
        questionProgress: {
            ...questionProgress,
            points: nextPoints,
            attempts: questionProgress.attempts + 1,
            correctAttempts: questionProgress.correctAttempts + (isCorrect ? 1 : 0),
            lastAnsweredAt: answeredAt.toISOString(),
            dueAt: new Date(answeredAt.getTime() + interval * DAY).toISOString(),
            revision: questionProgress.revision + 1,
        },
        skillProgress: {
            ...skillTransition.nextState,
            userId: skillProgress.userId,
            skillCode: skillProgress.skillCode,
            correctAttempts: skillProgress.correctAttempts + (isCorrect ? 1 : 0),
            totalAttempts: skillProgress.totalAttempts + 1,
            revision: skillProgress.revision + 1,
        },
    };
}

function priority(candidate: ListeningQueueCandidate, nowMs: number): number {
    const progress = candidate.progress;
    const due = progress ? Math.max(0, nowMs - new Date(progress.dueAt).getTime()) / DAY : 0;
    const skill = candidate.skillProgress;
    return due * 100
        + (progress?.points === 0 && progress.attempts > 0 ? 42 : 0)
        + (skill?.lapses ?? 0) * 16
        + (skill?.difficulty ?? 5)
        + candidate.question.difficulty * 2;
}

export function buildListeningQueue(
    candidates: ListeningQueueCandidate[],
    options: BuildListeningQueueOptions,
): ListeningQueueItem[] {
    const now = options.now ?? new Date();
    const nowMs = now.getTime();
    const size = options.mode === "long" ? 5 : Math.max(1, options.size ?? 5);
    const seed = `${options.userId}:${now.toISOString().slice(0, 10)}:${options.sessionNumber ?? 0}`;
    const recent = new Set(options.recentUnitIds ?? []);
    const eligible = candidates.filter(({ unit, question, progress }) =>
        unit.is_published
        && unit.kind === options.mode
        && question.unit_id === unit.id
        && progress?.points !== 2
        && !(progress && progress.attempts > 0 && new Date(progress.dueAt).getTime() > nowMs)
    );

    if (options.mode === "long") {
        const grouped = new Map<string, ListeningQueueCandidate[]>();
        for (const candidate of eligible) {
            const list = grouped.get(candidate.unit.id) ?? [];
            list.push(candidate);
            grouped.set(candidate.unit.id, list);
        }
        const selected = [...grouped.values()]
            .filter((group) => group.length >= 5)
            .sort((left, right) => {
                const leftRecent = recent.has(left[0].unit.id) ? 1 : 0;
                const rightRecent = recent.has(right[0].unit.id) ? 1 : 0;
                const score = Math.max(...right.map((item) => priority(item, nowMs)))
                    - Math.max(...left.map((item) => priority(item, nowMs)));
                return leftRecent - rightRecent || score
                    || stableHash(`${seed}:${left[0].unit.id}`) - stableHash(`${seed}:${right[0].unit.id}`);
            })[0];
        return (selected ?? [])
            .sort((left, right) => left.question.order_index - right.question.order_index)
            .slice(0, size)
            .map((candidate) => ({
                ...candidate,
                progress: candidate.progress ?? createEmptyListeningQuestionProgress(options.userId, candidate.question.id),
                reason: "long_set" as const,
            }));
    }

    const sorted = [...eligible].sort((left, right) => {
        const leftDue = left.progress && new Date(left.progress.dueAt).getTime() <= nowMs ? 1 : 0;
        const rightDue = right.progress && new Date(right.progress.dueAt).getTime() <= nowMs ? 1 : 0;
        const leftRecent = recent.has(left.unit.id) ? 1 : 0;
        const rightRecent = recent.has(right.unit.id) ? 1 : 0;
        return rightDue - leftDue || leftRecent - rightRecent
            || priority(right, nowMs) - priority(left, nowMs)
            || stableHash(`${seed}:${left.question.id}`) - stableHash(`${seed}:${right.question.id}`);
    });
    const selected: ListeningQueueCandidate[] = [];
    const usedSkills = new Set<ListeningSkillCode>();
    for (const candidate of sorted) {
        if (selected.length >= size) break;
        if (usedSkills.has(candidate.question.primary_skill_code) && sorted.length - selected.length > 3) continue;
        selected.push(candidate);
        usedSkills.add(candidate.question.primary_skill_code);
    }
    for (const candidate of sorted) {
        if (selected.length >= size) break;
        if (!selected.includes(candidate)) selected.push(candidate);
    }
    return selected.map((candidate) => ({
        ...candidate,
        progress: candidate.progress ?? createEmptyListeningQuestionProgress(options.userId, candidate.question.id),
        reason: candidate.progress?.points === 0 && candidate.progress.attempts > 0
            ? "recovery"
            : candidate.skillProgress && candidate.skillProgress.lapses > 0
                ? "weak_ear"
                : candidate.progress ? "due" : "new",
    }));
}

export function aggregateListeningProgress(
    questions: ListeningQuestion[],
    progress: ListeningQuestionProgress[],
) {
    const byQuestion = new Map(progress.map((item) => [item.questionId, item]));
    const clean = questions.filter((question) => byQuestion.get(question.id)?.points === 2).length;
    const started = questions.filter((question) => (byQuestion.get(question.id)?.attempts ?? 0) > 0).length;
    const recovery = questions.filter((question) => {
        const item = byQuestion.get(question.id);
        return item && item.attempts > 0 && item.points < 2;
    }).length;
    return { total: questions.length, clean, started, recovery, percent: questions.length ? Math.round(clean / questions.length * 100) : 0 };
}
