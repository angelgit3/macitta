import type { SupabaseClient } from '@supabase/supabase-js';
import {
    evaluateGrammarReview,
    type GrammarDomain,
    type GrammarExercise,
    type GrammarOptionId,
    type GrammarProgress,
    type GrammarSkill,
} from '@macitta/shared';
import {
    db,
    type LocalGrammarAttempt,
    type LocalGrammarSession,
} from '@/lib/db';

interface RemoteGrammarExercise {
    id: string;
    primary_skill_id: string;
    format: GrammarExercise['format'];
    cefr_band: GrammarExercise['cefr_band'];
    difficulty: GrammarExercise['difficulty'];
    prompt: GrammarExercise['prompt'];
    correct_option_id: GrammarOptionId;
    corrected_sentence: string;
    explanation_es: string;
    status: GrammarExercise['status'];
    content_version: number;
    linguistic_reviewed: boolean;
    fairness_reviewed: boolean;
}

interface RemoteGrammarProgress {
    user_id: string;
    exercise_id: string;
    step: number;
    interval_days: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: GrammarProgress['state'];
    last_review_at: string | null;
    due_at: string;
    first_seen_at: string | null;
    correct_attempts: number;
    total_attempts: number;
    revision: number;
}

export interface GrammarDataSnapshot {
    domains: GrammarDomain[];
    skills: GrammarSkill[];
    exercises: GrammarExercise[];
    progress: GrammarProgress[];
    source: 'remote' | 'cache';
}

function mapProgress(row: RemoteGrammarProgress): GrammarProgress {
    return {
        userId: row.user_id,
        exerciseId: row.exercise_id,
        step: row.step,
        interval: row.interval_days,
        difficulty: row.difficulty,
        lapses: row.lapses,
        state: row.state,
        lastReview: row.last_review_at,
        dueDate: row.due_at,
        firstSeenAt: row.first_seen_at,
        correctAttempts: row.correct_attempts,
        totalAttempts: row.total_attempts,
        revision: row.revision,
    };
}

async function readCachedGrammar(userId: string): Promise<GrammarDataSnapshot> {
    const [domains, skills, exercises, progress] = await Promise.all([
        db.grammarDomains.orderBy('order_index').toArray(),
        db.grammarSkills.orderBy('[domain_id+order_index]').toArray(),
        db.grammarExercises.where('status').equals('published').toArray(),
        db.grammarProgress.where('userId').equals(userId).toArray(),
    ]);
    return { domains, skills, exercises, progress, source: 'cache' };
}

export async function loadGrammarData(
    supabase: SupabaseClient,
    userId: string,
    preferRemote: boolean,
): Promise<GrammarDataSnapshot> {
    if (!preferRemote) return readCachedGrammar(userId);

    const [domainsResult, skillsResult, exercisesResult, progressResult] = await Promise.all([
        supabase.from('grammar_domains').select('*').order('order_index'),
        supabase.from('grammar_skills').select('*').eq('is_active', true).order('order_index'),
        supabase.from('grammar_exercises').select('*').eq('status', 'published'),
        supabase.from('grammar_user_progress').select('*').eq('user_id', userId),
    ]);

    const firstError = domainsResult.error ?? skillsResult.error ?? exercisesResult.error ?? progressResult.error;
    if (firstError) {
        console.error(
            `[grammar-load:remote] ${firstError.code || 'unknown'} ${firstError.message || 'no-message'}`,
        );
        const cached = await readCachedGrammar(userId);
        if (cached.exercises.length > 0) return cached;
        throw new Error('No se pudo cargar el banco de Grammar.');
    }

    const domains = (domainsResult.data ?? []) as GrammarDomain[];
    const skills = (skillsResult.data ?? []) as GrammarSkill[];
    const skillById = new Map(skills.map((skill) => [skill.id, skill]));
    const exercises = ((exercisesResult.data ?? []) as RemoteGrammarExercise[])
        .map((row): GrammarExercise | null => {
            const skill = skillById.get(row.primary_skill_id);
            if (!skill) return null;
            return {
                ...row,
                domain_id: skill.domain_id,
                skill_code: skill.code,
            };
        })
        .filter((exercise): exercise is GrammarExercise => exercise !== null);
    const progress = ((progressResult.data ?? []) as RemoteGrammarProgress[]).map(mapProgress);

    await db.transaction(
        'rw',
        [db.grammarDomains, db.grammarSkills, db.grammarExercises, db.grammarProgress],
        async () => {
            await db.grammarDomains.bulkPut(domains);
            await db.grammarSkills.bulkPut(skills);
            await db.grammarExercises.bulkPut(exercises);
            await db.grammarProgress.bulkPut(progress);
        },
    );

    return { domains, skills, exercises, progress, source: 'remote' };
}

export async function startGrammarSession(
    userId: string,
    mode: LocalGrammarSession['mode'] = 'general',
    focusedSkillId: string | null = null,
): Promise<LocalGrammarSession> {
    const startedAt = new Date().toISOString();
    const session: LocalGrammarSession = {
        id: crypto.randomUUID(),
        userId,
        mode,
        focusedSkillId,
        status: 'active',
        startedAt,
        endedAt: null,
        totalExercises: 0,
        correctExercises: 0,
        totalTimeMs: 0,
    };
    await db.transaction('rw', [db.grammarSessions, db.syncQueue], async () => {
        const interrupted = await db.grammarSessions
            .where('userId')
            .equals(userId)
            .and((candidate) => candidate.status === 'active')
            .toArray();
        for (const previous of interrupted) {
            const abandoned: LocalGrammarSession = {
                ...previous,
                status: 'abandoned',
                endedAt: startedAt,
            };
            await db.grammarSessions.put(abandoned);
            await db.syncQueue.add({
                type: 'finish_grammar_session',
                data: abandoned,
                created_at: startedAt,
            });
        }
        await db.grammarSessions.put(session);
        await db.syncQueue.add({
            type: 'start_grammar_session',
            data: session,
            created_at: session.startedAt,
        });
    });
    return session;
}

export interface RecordGrammarAnswerInput {
    userId: string;
    sessionId: string;
    exercise: GrammarExercise;
    progress: GrammarProgress;
    selectedOptionId: GrammarOptionId;
    responseMs: number;
    answeredAt?: Date;
}

export interface RecordGrammarAnswerResult {
    attempt: LocalGrammarAttempt;
    progress: GrammarProgress;
}

export async function recordGrammarAnswer(
    input: RecordGrammarAnswerInput,
): Promise<RecordGrammarAnswerResult> {
    const answeredAt = input.answeredAt ?? new Date();
    const isCorrect = input.selectedOptionId === input.exercise.correct_option_id;
    const previousRevision = input.progress.revision;
    const transition = evaluateGrammarReview(input.progress, isCorrect, answeredAt);
    const nextProgress: GrammarProgress = {
        ...transition.nextState,
        userId: input.userId,
        exerciseId: input.exercise.id,
        firstSeenAt: input.progress.firstSeenAt ?? answeredAt.toISOString(),
        correctAttempts: input.progress.correctAttempts + (isCorrect ? 1 : 0),
        totalAttempts: input.progress.totalAttempts + 1,
        revision: previousRevision + 1,
    };
    const attempt: LocalGrammarAttempt = {
        id: crypto.randomUUID(),
        userId: input.userId,
        exerciseId: input.exercise.id,
        sessionId: input.sessionId,
        selectedOptionId: input.selectedOptionId,
        isCorrect,
        grade: transition.grade,
        previousState: {
            step: input.progress.step,
            interval: input.progress.interval,
            difficulty: input.progress.difficulty,
            lapses: input.progress.lapses,
            state: input.progress.state,
            lastReview: input.progress.lastReview,
            dueDate: input.progress.dueDate,
        },
        nextState: transition.nextState,
        responseMs: Math.max(0, Math.round(input.responseMs)),
        wasDue: new Date(input.progress.dueDate).getTime() <= answeredAt.getTime(),
        contentVersion: input.exercise.content_version,
        reviewedAt: answeredAt.toISOString(),
    };

    await db.transaction(
        'rw',
        [db.grammarProgress, db.grammarAttempts, db.syncQueue],
        async () => {
            await db.grammarProgress.put(nextProgress);
            await db.grammarAttempts.put(attempt);
            await db.syncQueue.add({
                type: 'insert_grammar_attempt',
                data: attempt,
                created_at: attempt.reviewedAt,
            });
            await db.syncQueue.add({
                type: 'upsert_grammar_progress',
                data: { ...nextProgress, expectedRevision: previousRevision },
                created_at: attempt.reviewedAt,
            });
        },
    );

    return { attempt, progress: nextProgress };
}

async function closeGrammarSession(
    session: LocalGrammarSession,
    totalExercises: number,
    correctExercises: number,
    totalTimeMs: number,
    status: 'completed' | 'abandoned',
): Promise<LocalGrammarSession> {
    const finished: LocalGrammarSession = {
        ...session,
        status,
        endedAt: new Date().toISOString(),
        totalExercises,
        correctExercises,
        totalTimeMs: Math.max(0, Math.round(totalTimeMs)),
    };
    await db.transaction('rw', [db.grammarSessions, db.syncQueue], async () => {
        await db.grammarSessions.put(finished);
        await db.syncQueue.add({
            type: 'finish_grammar_session',
            data: finished,
            created_at: finished.endedAt!,
        });
    });
    return finished;
}

export function finishGrammarSession(
    session: LocalGrammarSession,
    totalExercises: number,
    correctExercises: number,
    totalTimeMs: number,
) {
    return closeGrammarSession(
        session,
        totalExercises,
        correctExercises,
        totalTimeMs,
        'completed',
    );
}

export function abandonGrammarSession(
    session: LocalGrammarSession,
    totalExercises: number,
    correctExercises: number,
    totalTimeMs: number,
) {
    return closeGrammarSession(
        session,
        totalExercises,
        correctExercises,
        totalTimeMs,
        'abandoned',
    );
}
