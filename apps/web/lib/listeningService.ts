import type { SupabaseClient } from "@supabase/supabase-js";
import {
    evaluateListeningAnswer,
    LISTENING_CATALOG,
    type ListeningQuestion,
    type ListeningQuestionProgress,
    type ListeningOptionId,
    type ListeningSkillCode,
    type ListeningSkillProgress,
} from "@macitta/shared";
import {
    db,
    type LocalListeningAttempt,
    type LocalListeningSession,
} from "@/lib/db";

export interface ListeningDataSnapshot {
    skills: typeof LISTENING_CATALOG.skills;
    units: typeof LISTENING_CATALOG.units;
    questions: typeof LISTENING_CATALOG.questions;
    questionProgress: ListeningQuestionProgress[];
    skillProgress: ListeningSkillProgress[];
    source: "remote" | "cache";
}

function mapQuestionProgress(row: Record<string, unknown>): ListeningQuestionProgress {
    return {
        userId: String(row.user_id),
        questionId: String(row.question_id),
        points: Number(row.points) as 0 | 1 | 2,
        attempts: Number(row.attempts),
        correctAttempts: Number(row.correct_attempts),
        lastAnsweredAt: row.last_answered_at ? String(row.last_answered_at) : null,
        dueAt: String(row.due_at),
        revision: Number(row.revision),
    };
}

function mapSkillProgress(row: Record<string, unknown>): ListeningSkillProgress {
    return {
        userId: String(row.user_id),
        skillCode: String(row.skill_code) as ListeningSkillCode,
        step: Number(row.step),
        interval: Number(row.interval_days),
        difficulty: Number(row.difficulty),
        lapses: Number(row.lapses),
        state: String(row.state) as ListeningSkillProgress["state"],
        lastReview: row.last_review_at ? String(row.last_review_at) : null,
        dueDate: String(row.due_at),
        correctAttempts: Number(row.correct_attempts),
        totalAttempts: Number(row.total_attempts),
        revision: Number(row.revision),
    };
}

async function cachedSnapshot(userId: string): Promise<ListeningDataSnapshot> {
    const [questionProgress, skillProgress] = await Promise.all([
        db.listeningQuestionProgress.where("userId").equals(userId).toArray(),
        db.listeningSkillProgress.where("userId").equals(userId).toArray(),
    ]);
    return {
        ...LISTENING_CATALOG,
        questionProgress,
        skillProgress,
        source: "cache",
    };
}

export async function loadListeningData(
    supabase: SupabaseClient,
    userId: string,
    preferRemote: boolean,
): Promise<ListeningDataSnapshot> {
    if (!preferRemote) return cachedSnapshot(userId);
    const [questionResult, skillResult] = await Promise.all([
        supabase.from("listening_question_progress").select("*").eq("user_id", userId),
        supabase.from("listening_skill_progress").select("*").eq("user_id", userId),
    ]);
    const error = questionResult.error ?? skillResult.error;
    if (error) {
        const cached = await cachedSnapshot(userId);
        if (cached.questionProgress.length || cached.skillProgress.length) return cached;
        // The static bank remains usable before the migration reaches production.
        return cached;
    }
    const questionProgress = (questionResult.data ?? []).map((row) => mapQuestionProgress(row as Record<string, unknown>));
    const skillProgress = (skillResult.data ?? []).map((row) => mapSkillProgress(row as Record<string, unknown>));
    await db.transaction("rw", [db.listeningQuestionProgress, db.listeningSkillProgress], async () => {
        await db.listeningQuestionProgress.bulkPut(questionProgress);
        await db.listeningSkillProgress.bulkPut(skillProgress);
    });
    return { ...LISTENING_CATALOG, questionProgress, skillProgress, source: "remote" };
}

export async function startListeningSession(
    userId: string,
    mode: LocalListeningSession["mode"],
    primaryUnitId: string | null,
): Promise<LocalListeningSession> {
    const startedAt = new Date().toISOString();
    const session: LocalListeningSession = {
        id: crypto.randomUUID(),
        userId,
        mode,
        primaryUnitId,
        status: "active",
        startedAt,
        endedAt: null,
        totalQuestions: 0,
        correctQuestions: 0,
        totalTimeMs: 0,
    };
    await db.transaction("rw", [db.listeningSessions, db.syncQueue], async () => {
        const active = await db.listeningSessions.where("userId").equals(userId)
            .and((candidate) => candidate.status === "active").toArray();
        for (const interrupted of active) {
            const abandoned = { ...interrupted, status: "abandoned" as const, endedAt: startedAt };
            await db.listeningSessions.put(abandoned);
            await db.syncQueue.add({ type: "finish_listening_session", data: abandoned, created_at: startedAt });
        }
        await db.listeningSessions.put(session);
        await db.syncQueue.add({ type: "start_listening_session", data: session, created_at: startedAt });
    });
    return session;
}

export interface RecordListeningAnswerInput {
    userId: string;
    sessionId: string;
    question: ListeningQuestion;
    questionProgress: ListeningQuestionProgress;
    skillProgress: ListeningSkillProgress;
    selectedOptionId: ListeningOptionId;
    playCount: number;
    responseMs: number;
}

export interface RecordListeningAnswerResult {
    attempt: LocalListeningAttempt;
    questionProgress: ListeningQuestionProgress;
    skillProgress: ListeningSkillProgress;
}

export async function recordListeningAnswer(
    input: RecordListeningAnswerInput,
): Promise<RecordListeningAnswerResult> {
    const answeredAt = new Date();
    const isCorrect = input.selectedOptionId === input.question.correct_option_id;
    const result = evaluateListeningAnswer(
        input.questionProgress,
        input.skillProgress,
        isCorrect,
        input.playCount,
        answeredAt,
    );
    const attempt: LocalListeningAttempt = {
        id: crypto.randomUUID(),
        userId: input.userId,
        questionId: input.question.id,
        sessionId: input.sessionId,
        selectedOptionId: input.selectedOptionId,
        isCorrect,
        earnedPoints: result.earnedPoints,
        playCount: Math.max(1, Math.round(input.playCount)),
        previousQuestionState: {
            points: input.questionProgress.points,
            attempts: input.questionProgress.attempts,
            correctAttempts: input.questionProgress.correctAttempts,
            lastAnsweredAt: input.questionProgress.lastAnsweredAt,
            dueAt: input.questionProgress.dueAt,
        },
        nextQuestionState: {
            points: result.questionProgress.points,
            attempts: result.questionProgress.attempts,
            correctAttempts: result.questionProgress.correctAttempts,
            lastAnsweredAt: result.questionProgress.lastAnsweredAt,
            dueAt: result.questionProgress.dueAt,
        },
        previousSkillState: {
            step: input.skillProgress.step,
            interval: input.skillProgress.interval,
            difficulty: input.skillProgress.difficulty,
            lapses: input.skillProgress.lapses,
            state: input.skillProgress.state,
            lastReview: input.skillProgress.lastReview,
            dueDate: input.skillProgress.dueDate,
        },
        nextSkillState: {
            step: result.skillProgress.step,
            interval: result.skillProgress.interval,
            difficulty: result.skillProgress.difficulty,
            lapses: result.skillProgress.lapses,
            state: result.skillProgress.state,
            lastReview: result.skillProgress.lastReview,
            dueDate: result.skillProgress.dueDate,
        },
        responseMs: Math.max(0, Math.round(input.responseMs)),
        answeredAt: answeredAt.toISOString(),
    };
    await db.transaction(
        "rw",
        [db.listeningQuestionProgress, db.listeningSkillProgress, db.listeningAttempts, db.syncQueue],
        async () => {
            await db.listeningQuestionProgress.put(result.questionProgress);
            await db.listeningSkillProgress.put(result.skillProgress);
            await db.listeningAttempts.put(attempt);
            await db.syncQueue.add({ type: "insert_listening_attempt", data: attempt, created_at: attempt.answeredAt });
            await db.syncQueue.add({
                type: "upsert_listening_question_progress",
                data: { ...result.questionProgress, expectedRevision: input.questionProgress.revision },
                created_at: attempt.answeredAt,
            });
            await db.syncQueue.add({
                type: "upsert_listening_skill_progress",
                data: { ...result.skillProgress, expectedRevision: input.skillProgress.revision },
                created_at: attempt.answeredAt,
            });
        },
    );
    return { attempt, questionProgress: result.questionProgress, skillProgress: result.skillProgress };
}

async function closeListeningSession(
    session: LocalListeningSession,
    totalQuestions: number,
    correctQuestions: number,
    totalTimeMs: number,
    status: "completed" | "abandoned",
): Promise<LocalListeningSession> {
    const finished: LocalListeningSession = {
        ...session,
        status,
        endedAt: new Date().toISOString(),
        totalQuestions,
        correctQuestions,
        totalTimeMs: Math.max(0, Math.round(totalTimeMs)),
    };
    await db.transaction("rw", [db.listeningSessions, db.syncQueue], async () => {
        await db.listeningSessions.put(finished);
        await db.syncQueue.add({ type: "finish_listening_session", data: finished, created_at: finished.endedAt! });
    });
    return finished;
}

export function finishListeningSession(session: LocalListeningSession, total: number, correct: number, timeMs: number) {
    return closeListeningSession(session, total, correct, timeMs, "completed");
}

export function abandonListeningSession(session: LocalListeningSession, total: number, correct: number, timeMs: number) {
    return closeListeningSession(session, total, correct, timeMs, "abandoned");
}
