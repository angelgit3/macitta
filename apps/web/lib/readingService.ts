import type { SupabaseClient } from '@supabase/supabase-js';
import {
    evaluateReadingAnswer,
    type ReadingDomain,
    type ReadingOptionId,
    type ReadingPassage,
    type ReadingPassageExposure,
    type ReadingQuestion,
    type ReadingQuestionProgress,
    type ReadingSkill,
    type ReadingSkillProgress,
} from '@macitta/shared';
import {
    db,
    type LocalReadingAttempt,
    type LocalReadingSession,
} from '@/lib/db';

interface RemoteReadingQuestion {
    id: string;
    passage_id: string;
    primary_skill_id: string;
    block_index: ReadingQuestion['block_index'];
    order_index: number;
    difficulty: ReadingQuestion['difficulty'];
    prompt: string;
    options: ReadingQuestion['options'];
    correct_option_id: ReadingOptionId;
    explanation_es: string;
    evidence: ReadingQuestion['evidence'];
    distractor_rationales: ReadingQuestion['distractor_rationales'];
    status: ReadingQuestion['status'];
    content_version: number;
    linguistic_reviewed: boolean;
    fairness_reviewed: boolean;
}

interface RemoteReadingQuestionProgress {
    user_id: string;
    question_id: string;
    points: ReadingQuestionProgress['points'];
    attempts: number;
    correct_attempts: number;
    last_answered_at: string | null;
    due_at: string;
    revision: number;
}

interface RemoteReadingSkillProgress {
    user_id: string;
    skill_id: string;
    step: number;
    interval_days: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: ReadingSkillProgress['state'];
    last_review_at: string | null;
    due_at: string;
    correct_attempts: number;
    total_attempts: number;
    revision: number;
}

interface RemoteReadingExposure {
    user_id: string;
    passage_id: string;
    last_seen_at: string;
    exposure_count: number;
}

export interface ReadingDataSnapshot {
    domains: ReadingDomain[];
    skills: ReadingSkill[];
    passages: ReadingPassage[];
    questions: ReadingQuestion[];
    questionProgress: ReadingQuestionProgress[];
    skillProgress: ReadingSkillProgress[];
    exposures: ReadingPassageExposure[];
    source: 'remote' | 'cache';
}

function mapQuestionProgress(row: RemoteReadingQuestionProgress): ReadingQuestionProgress {
    return {
        userId: row.user_id,
        questionId: row.question_id,
        points: row.points,
        attempts: row.attempts,
        correctAttempts: row.correct_attempts,
        lastAnsweredAt: row.last_answered_at,
        dueAt: row.due_at,
        revision: row.revision,
    };
}

function mapSkillProgress(row: RemoteReadingSkillProgress): ReadingSkillProgress {
    return {
        userId: row.user_id,
        skillId: row.skill_id,
        step: row.step,
        interval: row.interval_days,
        difficulty: row.difficulty,
        lapses: row.lapses,
        state: row.state,
        lastReview: row.last_review_at,
        dueDate: row.due_at,
        correctAttempts: row.correct_attempts,
        totalAttempts: row.total_attempts,
        revision: row.revision,
    };
}

function mapExposure(row: RemoteReadingExposure): ReadingPassageExposure {
    return {
        userId: row.user_id,
        passageId: row.passage_id,
        lastSeenAt: row.last_seen_at,
        exposureCount: row.exposure_count,
    };
}

async function readCachedReading(userId: string): Promise<ReadingDataSnapshot> {
    const [
        domains,
        skills,
        passages,
        questions,
        questionProgress,
        skillProgress,
        exposures,
    ] = await Promise.all([
        db.readingDomains.orderBy('order_index').toArray(),
        db.readingSkills.orderBy('[domain_id+order_index]').toArray(),
        db.readingPassages.where('status').equals('published').toArray(),
        db.readingQuestions.where('status').equals('published').toArray(),
        db.readingQuestionProgress.where('userId').equals(userId).toArray(),
        db.readingSkillProgress.where('userId').equals(userId).toArray(),
        db.readingPassageExposures.where('userId').equals(userId).toArray(),
    ]);
    return {
        domains,
        skills,
        passages,
        questions,
        questionProgress,
        skillProgress,
        exposures,
        source: 'cache',
    };
}

export async function loadReadingData(
    supabase: SupabaseClient,
    userId: string,
    preferRemote: boolean,
): Promise<ReadingDataSnapshot> {
    if (!preferRemote) return readCachedReading(userId);

    const [
        domainsResult,
        skillsResult,
        passagesResult,
        questionsResult,
        questionProgressResult,
        skillProgressResult,
        exposuresResult,
    ] = await Promise.all([
        supabase.from('reading_domains').select('*').order('order_index'),
        supabase.from('reading_skills').select('*').eq('is_active', true).order('order_index'),
        supabase.from('reading_passages').select('*').eq('status', 'published'),
        supabase.from('reading_questions').select('*').eq('status', 'published'),
        supabase.from('reading_question_progress').select('*').eq('user_id', userId),
        supabase.from('reading_skill_progress').select('*').eq('user_id', userId),
        supabase.from('reading_passage_exposures').select('*').eq('user_id', userId),
    ]);
    const firstError =
        domainsResult.error ??
        skillsResult.error ??
        passagesResult.error ??
        questionsResult.error ??
        questionProgressResult.error ??
        skillProgressResult.error ??
        exposuresResult.error;
    if (firstError) {
        console.error(
            `[reading-load:remote] ${firstError.code || 'unknown'} ${firstError.message || 'no-message'}`,
        );
        const cached = await readCachedReading(userId);
        if (cached.questions.length > 0) return cached;
        throw new Error('No se pudo cargar el banco de Reading.');
    }

    const domains = (domainsResult.data ?? []) as ReadingDomain[];
    const skills = (skillsResult.data ?? []) as ReadingSkill[];
    const passages = (passagesResult.data ?? []) as ReadingPassage[];
    const skillById = new Map(skills.map((skill) => [skill.id, skill]));
    const questions = ((questionsResult.data ?? []) as RemoteReadingQuestion[])
        .map((row): ReadingQuestion | null => {
            const skill = skillById.get(row.primary_skill_id);
            if (!skill) return null;
            return {
                ...row,
                domain_id: skill.domain_id,
                skill_code: skill.code,
            };
        })
        .filter((question): question is ReadingQuestion => question !== null);
    const questionProgress = (
        (questionProgressResult.data ?? []) as RemoteReadingQuestionProgress[]
    ).map(mapQuestionProgress);
    const skillProgress = (
        (skillProgressResult.data ?? []) as RemoteReadingSkillProgress[]
    ).map(mapSkillProgress);
    const exposures = ((exposuresResult.data ?? []) as RemoteReadingExposure[]).map(
        mapExposure,
    );

    await db.transaction(
        'rw',
        [
            db.readingDomains,
            db.readingSkills,
            db.readingPassages,
            db.readingQuestions,
            db.readingQuestionProgress,
            db.readingSkillProgress,
            db.readingPassageExposures,
        ],
        async () => {
            await db.readingDomains.bulkPut(domains);
            await db.readingSkills.bulkPut(skills);
            await db.readingPassages.bulkPut(passages);
            await db.readingQuestions.bulkPut(questions);
            await db.readingQuestionProgress.bulkPut(questionProgress);
            await db.readingSkillProgress.bulkPut(skillProgress);
            await db.readingPassageExposures.bulkPut(exposures);
        },
    );

    return {
        domains,
        skills,
        passages,
        questions,
        questionProgress,
        skillProgress,
        exposures,
        source: 'remote',
    };
}

export async function startReadingSession(
    userId: string,
    mode: LocalReadingSession['mode'],
    primaryPassageId: string | null,
): Promise<LocalReadingSession> {
    const startedAt = new Date().toISOString();
    const session: LocalReadingSession = {
        id: crypto.randomUUID(),
        userId,
        mode,
        primaryPassageId,
        status: 'active',
        startedAt,
        endedAt: null,
        totalQuestions: 0,
        correctQuestions: 0,
        totalTimeMs: 0,
    };
    await db.transaction('rw', [db.readingSessions, db.syncQueue], async () => {
        const interrupted = await db.readingSessions
            .where('userId')
            .equals(userId)
            .and((candidate) => candidate.status === 'active')
            .toArray();
        for (const previous of interrupted) {
            const abandoned: LocalReadingSession = {
                ...previous,
                status: 'abandoned',
                endedAt: startedAt,
            };
            await db.readingSessions.put(abandoned);
            await db.syncQueue.add({
                type: 'finish_reading_session',
                data: abandoned,
                created_at: startedAt,
            });
        }
        await db.readingSessions.put(session);
        await db.syncQueue.add({
            type: 'start_reading_session',
            data: session,
            created_at: startedAt,
        });
    });
    return session;
}

export async function recordReadingPassageExposure(
    userId: string,
    passageId: string,
    seenAt: Date = new Date(),
): Promise<ReadingPassageExposure> {
    const existing = await db.readingPassageExposures.get([userId, passageId]);
    const exposure: ReadingPassageExposure = {
        userId,
        passageId,
        lastSeenAt: seenAt.toISOString(),
        exposureCount: (existing?.exposureCount ?? 0) + 1,
    };
    await db.transaction(
        'rw',
        [db.readingPassageExposures, db.syncQueue],
        async () => {
            await db.readingPassageExposures.put(exposure);
            await db.syncQueue.add({
                type: 'record_reading_exposure',
                data: exposure,
                created_at: exposure.lastSeenAt,
            });
        },
    );
    return exposure;
}

export interface RecordReadingAnswerInput {
    userId: string;
    sessionId: string;
    question: ReadingQuestion;
    questionProgress: ReadingQuestionProgress;
    skillProgress: ReadingSkillProgress;
    selectedOptionId: ReadingOptionId;
    responseMs: number;
    answeredAt?: Date;
}

export interface RecordReadingAnswerResult {
    attempt: LocalReadingAttempt;
    questionProgress: ReadingQuestionProgress;
    skillProgress: ReadingSkillProgress;
}

export async function recordReadingAnswer(
    input: RecordReadingAnswerInput,
): Promise<RecordReadingAnswerResult> {
    const answeredAt = input.answeredAt ?? new Date();
    const isCorrect = input.selectedOptionId === input.question.correct_option_id;
    const previousQuestionRevision = input.questionProgress.revision;
    const previousSkillRevision = input.skillProgress.revision;
    const result = evaluateReadingAnswer(
        input.questionProgress,
        input.skillProgress,
        isCorrect,
        answeredAt,
    );
    const nextQuestionProgress = result.questionProgress;
    const nextSkillProgress: ReadingSkillProgress = {
        ...result.skillTransition.nextState,
        userId: input.userId,
        skillId: input.question.primary_skill_id,
        correctAttempts: input.skillProgress.correctAttempts + (isCorrect ? 1 : 0),
        totalAttempts: input.skillProgress.totalAttempts + 1,
        revision: previousSkillRevision + 1,
    };
    const attempt: LocalReadingAttempt = {
        id: crypto.randomUUID(),
        userId: input.userId,
        questionId: input.question.id,
        sessionId: input.sessionId,
        selectedOptionId: input.selectedOptionId,
        isCorrect,
        grade: result.skillTransition.grade,
        previousQuestionState: {
            points: input.questionProgress.points,
            attempts: input.questionProgress.attempts,
            correctAttempts: input.questionProgress.correctAttempts,
            lastAnsweredAt: input.questionProgress.lastAnsweredAt,
            dueAt: input.questionProgress.dueAt,
        },
        nextQuestionState: {
            points: nextQuestionProgress.points,
            attempts: nextQuestionProgress.attempts,
            correctAttempts: nextQuestionProgress.correctAttempts,
            lastAnsweredAt: nextQuestionProgress.lastAnsweredAt,
            dueAt: nextQuestionProgress.dueAt,
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
        nextSkillState: result.skillTransition.nextState,
        responseMs: Math.max(0, Math.round(input.responseMs)),
        contentVersion: input.question.content_version,
        answeredAt: answeredAt.toISOString(),
    };

    await db.transaction(
        'rw',
        [
            db.readingQuestionProgress,
            db.readingSkillProgress,
            db.readingAttempts,
            db.syncQueue,
        ],
        async () => {
            await db.readingQuestionProgress.put(nextQuestionProgress);
            await db.readingSkillProgress.put(nextSkillProgress);
            await db.readingAttempts.put(attempt);
            await db.syncQueue.add({
                type: 'insert_reading_attempt',
                data: attempt,
                created_at: attempt.answeredAt,
            });
            await db.syncQueue.add({
                type: 'upsert_reading_question_progress',
                data: {
                    ...nextQuestionProgress,
                    expectedRevision: previousQuestionRevision,
                },
                created_at: attempt.answeredAt,
            });
            await db.syncQueue.add({
                type: 'upsert_reading_skill_progress',
                data: {
                    ...nextSkillProgress,
                    expectedRevision: previousSkillRevision,
                },
                created_at: attempt.answeredAt,
            });
        },
    );

    return {
        attempt,
        questionProgress: nextQuestionProgress,
        skillProgress: nextSkillProgress,
    };
}

async function closeReadingSession(
    session: LocalReadingSession,
    totalQuestions: number,
    correctQuestions: number,
    totalTimeMs: number,
    status: 'completed' | 'abandoned',
): Promise<LocalReadingSession> {
    const finished: LocalReadingSession = {
        ...session,
        status,
        endedAt: new Date().toISOString(),
        totalQuestions,
        correctQuestions,
        totalTimeMs: Math.max(0, Math.round(totalTimeMs)),
    };
    await db.transaction('rw', [db.readingSessions, db.syncQueue], async () => {
        await db.readingSessions.put(finished);
        await db.syncQueue.add({
            type: 'finish_reading_session',
            data: finished,
            created_at: finished.endedAt!,
        });
    });
    return finished;
}

export function finishReadingSession(
    session: LocalReadingSession,
    totalQuestions: number,
    correctQuestions: number,
    totalTimeMs: number,
) {
    return closeReadingSession(
        session,
        totalQuestions,
        correctQuestions,
        totalTimeMs,
        'completed',
    );
}

export function abandonReadingSession(
    session: LocalReadingSession,
    totalQuestions: number,
    correctQuestions: number,
    totalTimeMs: number,
) {
    return closeReadingSession(
        session,
        totalQuestions,
        correctQuestions,
        totalTimeMs,
        'abandoned',
    );
}
