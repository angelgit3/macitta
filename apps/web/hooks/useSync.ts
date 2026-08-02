'use client';

import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@/lib/logger';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { SyncOperation } from '@/lib/db';
import {
    createEmptyReadingQuestionProgress,
    createEmptyReadingSkillProgress,
    evaluateGrammarReview,
    evaluateReadingAnswer,
    type GrammarProgress,
    type ReadingQuestionProgress,
    type ReadingSkillProgress,
    type SEMCardState,
} from '@macitta/shared';

const MAX_RETRIES = 5;

// ─── Hook ───────────────────────────────────────────────────────────

export function useSync(enabled = true) {
    const supabase = useMemo(() => createClient(), []);
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const syncingRef = useRef(false);

    /**
     * Process a single sync operation.
     * Handles every vocabulary and Grammar SyncOperation type.
     */
    const processOperation = useCallback(async (op: SyncOperation): Promise<boolean> => {
        try {
            switch (op.type) {
                case 'upsert_user_item': {
                    const { error } = await supabase.rpc('sync_user_item', {
                        p_user_id: op.data.user_id,
                        p_card_id: op.data.card_id,
                        p_stability: op.data.stability,
                        p_difficulty: op.data.difficulty,
                        p_reps: op.data.reps,
                        p_lapses: op.data.lapses,
                        p_state: op.data.state,
                        p_last_review: op.data.last_review,
                        p_due_date: op.data.due_date,
                    });
                    if (error) {
                        logger.error("[Sync] upsert_user_item error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_study_log': {
                    const { error } = await supabase
                        .from('study_logs')
                        .insert(op.data);
                    if (error) {
                        logger.error("[Sync] insert_study_log error", error);
                        return false;
                    }
                    return true;
                }

                case 'start_session': {
                    const { error } = await supabase
                        .from('study_sessions')
                        .insert({
                            id: op.data.session_id,
                            user_id: op.data.user_id,
                            deck_id: op.data.deck_id,
                            started_at: op.data.started_at,
                        });
                    if (error) {
                        logger.error("[Sync] start_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'end_session': {
                    const { error } = await supabase
                        .from('study_sessions')
                        .update({
                            ended_at: op.data.ended_at,
                            total_cards: op.data.total_cards,
                            correct_cards: op.data.correct_cards,
                            total_time_ms: op.data.total_time_ms,
                        })
                        .eq('id', op.data.session_id);
                    if (error) {
                        logger.error("[Sync] end_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'increment_session_time': {
                    const { error } = await supabase.rpc('increment_session_time', {
                        p_session_id: op.data.session_id,
                        p_time_ms: op.data.time_ms,
                    });
                    if (error) {
                        logger.error("[Sync] increment_session_time error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_toefl_attempt': {
                    const { error } = await supabase
                        .from('user_exam_attempts')
                        .upsert(op.data, { onConflict: 'id' });
                    if (error) {
                        logger.error("[Sync] insert_toefl_attempt error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_toefl_answers': {
                    const { error } = await supabase
                        .from('user_question_answers')
                        .upsert(op.data, { onConflict: 'attempt_id,question_id' });
                    if (error) {
                        logger.error("[Sync] insert_toefl_answers error", error);
                        return false;
                    }
                    return true;
                }

                case 'start_grammar_session': {
                    const { data } = op;
                    const { error } = await supabase
                        .from('grammar_sessions')
                        .upsert({
                            id: data.id,
                            user_id: data.userId,
                            mode: data.mode,
                            focused_skill_id: data.focusedSkillId,
                            status: data.status,
                            started_at: data.startedAt,
                            ended_at: data.endedAt,
                            total_exercises: data.totalExercises,
                            correct_exercises: data.correctExercises,
                            total_time_ms: data.totalTimeMs,
                        }, { onConflict: 'id' });
                    if (error) {
                        logger.error("[Sync] start_grammar_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'finish_grammar_session': {
                    const { data } = op;
                    const { error } = await supabase
                        .from('grammar_sessions')
                        .update({
                            status: data.status,
                            ended_at: data.endedAt,
                            total_exercises: data.totalExercises,
                            correct_exercises: data.correctExercises,
                            total_time_ms: data.totalTimeMs,
                        })
                        .eq('id', data.id);
                    if (error) {
                        logger.error("[Sync] finish_grammar_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_grammar_attempt': {
                    const { data } = op;
                    const { error } = await supabase.rpc('insert_grammar_attempt', {
                        p_id: data.id,
                        p_user_id: data.userId,
                        p_exercise_id: data.exerciseId,
                        p_session_id: data.sessionId,
                        p_selected_option_id: data.selectedOptionId,
                        p_is_correct: data.isCorrect,
                        p_grade: data.grade,
                        p_previous_state: data.previousState,
                        p_next_state: data.nextState,
                        p_response_ms: data.responseMs,
                        p_was_due: data.wasDue,
                        p_content_version: data.contentVersion,
                        p_reviewed_at: data.reviewedAt,
                    });
                    if (error) {
                        logger.error("[Sync] insert_grammar_attempt error", error);
                        return false;
                    }
                    return true;
                }

                case 'upsert_grammar_progress': {
                    const { data } = op;
                    const { error } = await supabase.rpc('sync_grammar_progress', {
                        p_user_id: data.userId,
                        p_exercise_id: data.exerciseId,
                        p_step: data.step,
                        p_interval_days: data.interval,
                        p_difficulty: data.difficulty,
                        p_reps: data.totalAttempts,
                        p_lapses: data.lapses,
                        p_state: data.state,
                        p_last_review_at: data.lastReview,
                        p_due_at: data.dueDate,
                        p_first_seen_at: data.firstSeenAt,
                        p_correct_attempts: data.correctAttempts,
                        p_total_attempts: data.totalAttempts,
                        p_expected_revision: data.expectedRevision,
                    });
                    if (error) {
                        if (error.code === '40001') {
                            const { data: remote, error: remoteError } = await supabase
                                .from('grammar_user_progress')
                                .select('*')
                                .eq('user_id', data.userId)
                                .eq('exercise_id', data.exerciseId)
                                .single();
                            if (remoteError || !remote) {
                                logger.error("[Sync] grammar conflict fetch error", remoteError);
                                return false;
                            }

                            const [localAttempts, remoteAttemptsResult] = await Promise.all([
                                db.grammarAttempts
                                    .where('exerciseId')
                                    .equals(data.exerciseId)
                                    .filter((attempt) => attempt.userId === data.userId)
                                    .toArray(),
                                supabase
                                    .from('grammar_attempts')
                                    .select('id,is_correct,reviewed_at')
                                    .eq('user_id', data.userId)
                                    .eq('exercise_id', data.exerciseId)
                                    .gt('reviewed_at', remote.last_review_at ?? '1970-01-01T00:00:00.000Z'),
                            ]);
                            if (remoteAttemptsResult.error) {
                                logger.error("[Sync] grammar conflict attempts error", remoteAttemptsResult.error);
                                return false;
                            }

                            const replayById = new Map<string, { id: string; isCorrect: boolean; reviewedAt: string }>();
                            for (const attempt of remoteAttemptsResult.data ?? []) {
                                replayById.set(attempt.id, {
                                    id: attempt.id,
                                    isCorrect: attempt.is_correct,
                                    reviewedAt: attempt.reviewed_at,
                                });
                            }
                            for (const attempt of localAttempts) {
                                if (!remote.last_review_at || attempt.reviewedAt > remote.last_review_at) {
                                    replayById.set(attempt.id, {
                                        id: attempt.id,
                                        isCorrect: attempt.isCorrect,
                                        reviewedAt: attempt.reviewedAt,
                                    });
                                }
                            }
                            const replay = [...replayById.values()]
                                .sort((left, right) =>
                                    left.reviewedAt.localeCompare(right.reviewedAt) ||
                                    left.id.localeCompare(right.id)
                                );
                            let state: SEMCardState = {
                                step: remote.step,
                                interval: remote.interval_days,
                                difficulty: remote.difficulty,
                                lapses: remote.lapses,
                                state: remote.state,
                                lastReview: remote.last_review_at,
                                dueDate: remote.due_at,
                            };
                            let correctAttempts = remote.correct_attempts;
                            let totalAttempts = remote.total_attempts;
                            for (const attempt of replay) {
                                state = evaluateGrammarReview(
                                    state,
                                    attempt.isCorrect,
                                    new Date(attempt.reviewedAt),
                                ).nextState;
                                totalAttempts += 1;
                                correctAttempts += attempt.isCorrect ? 1 : 0;
                            }
                            const merged: GrammarProgress = {
                                ...state,
                                userId: data.userId,
                                exerciseId: data.exerciseId,
                                firstSeenAt: remote.first_seen_at ?? data.firstSeenAt,
                                correctAttempts,
                                totalAttempts,
                                revision: remote.revision + 1,
                            };
                            const { error: retryError } = await supabase.rpc('sync_grammar_progress', {
                                p_user_id: merged.userId,
                                p_exercise_id: merged.exerciseId,
                                p_step: merged.step,
                                p_interval_days: merged.interval,
                                p_difficulty: merged.difficulty,
                                p_reps: merged.totalAttempts,
                                p_lapses: merged.lapses,
                                p_state: merged.state,
                                p_last_review_at: merged.lastReview,
                                p_due_at: merged.dueDate,
                                p_first_seen_at: merged.firstSeenAt,
                                p_correct_attempts: merged.correctAttempts,
                                p_total_attempts: merged.totalAttempts,
                                p_expected_revision: remote.revision,
                            });
                            if (!retryError) {
                                await db.grammarProgress.put(merged);
                                return true;
                            }
                            logger.error("[Sync] grammar conflict retry error", retryError);
                            return false;
                        }
                        logger.error("[Sync] upsert_grammar_progress error", error);
                        return false;
                    }
                    return true;
                }

                case 'start_reading_session': {
                    const { data } = op;
                    const { data: authData } = await supabase.auth.getUser();
                    if (!authData.user) return false;
                    if (authData.user.id !== data.userId) {
                        // Discard queue items from previous/other user sessions to avoid RLS mismatch
                        return true;
                    }
                    const payload = {
                        id: data.id,
                        user_id: data.userId,
                        mode: data.mode,
                        primary_passage_id: data.primaryPassageId,
                        status: data.status,
                        started_at: data.startedAt,
                        ended_at: data.endedAt,
                        total_questions: data.totalQuestions,
                        correct_questions: data.correctQuestions,
                        total_time_ms: data.totalTimeMs,
                    };
                    const { error } = await supabase
                        .from('reading_sessions')
                        .upsert(payload, { onConflict: 'id' });
                    if (error) {
                        if (error.code === '23503') {
                            const { error: retryError } = await supabase
                                .from('reading_sessions')
                                .upsert({ ...payload, primary_passage_id: null }, { onConflict: 'id' });
                            if (!retryError) return true;
                            logger.error("[Sync] start_reading_session retry error", retryError);
                            return false;
                        }
                        logger.error("[Sync] start_reading_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'finish_reading_session': {
                    const { data } = op;
                    const { error } = await supabase
                        .from('reading_sessions')
                        .update({
                            status: data.status,
                            ended_at: data.endedAt,
                            total_questions: data.totalQuestions,
                            correct_questions: data.correctQuestions,
                            total_time_ms: data.totalTimeMs,
                        })
                        .eq('id', data.id);
                    if (error) {
                        logger.error("[Sync] finish_reading_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'record_reading_exposure': {
                    const { data } = op;
                    const { error } = await supabase.rpc('record_reading_exposure', {
                        p_user_id: data.userId,
                        p_passage_id: data.passageId,
                        p_seen_at: data.lastSeenAt,
                        p_exposure_count: data.exposureCount,
                    });
                    if (error) {
                        logger.error("[Sync] record_reading_exposure error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_reading_attempt': {
                    const { data } = op;
                    const { error } = await supabase.rpc('insert_reading_attempt', {
                        p_id: data.id,
                        p_user_id: data.userId,
                        p_question_id: data.questionId,
                        p_session_id: data.sessionId,
                        p_selected_option_id: data.selectedOptionId,
                        p_is_correct: data.isCorrect,
                        p_grade: data.grade,
                        p_previous_question_state: data.previousQuestionState,
                        p_next_question_state: data.nextQuestionState,
                        p_previous_skill_state: data.previousSkillState,
                        p_next_skill_state: data.nextSkillState,
                        p_response_ms: data.responseMs,
                        p_content_version: data.contentVersion,
                        p_answered_at: data.answeredAt,
                    });
                    if (error) {
                        logger.error("[Sync] insert_reading_attempt error", error);
                        return false;
                    }
                    return true;
                }

                case 'upsert_reading_question_progress': {
                    const syncQuestionProgress = async (
                        data: typeof op.data,
                        expectedRevision: number,
                    ) => supabase.rpc('sync_reading_question_progress', {
                        p_user_id: data.userId,
                        p_question_id: data.questionId,
                        p_points: data.points,
                        p_attempts: data.attempts,
                        p_correct_attempts: data.correctAttempts,
                        p_last_answered_at: data.lastAnsweredAt,
                        p_due_at: data.dueAt,
                        p_expected_revision: expectedRevision,
                    });
                    const { data } = op;
                    const { error } = await syncQuestionProgress(data, data.expectedRevision);
                    if (!error) return true;
                    if (error.code !== '40001') {
                        logger.error("[Sync] upsert_reading_question_progress error", error);
                        return false;
                    }

                    const [remoteProgress, attemptsResult] = await Promise.all([
                        supabase
                            .from('reading_question_progress')
                            .select('*')
                            .eq('user_id', data.userId)
                            .eq('question_id', data.questionId)
                            .single(),
                        supabase
                            .from('reading_attempts')
                            .select('id,is_correct,answered_at')
                            .eq('user_id', data.userId)
                            .eq('question_id', data.questionId)
                            .order('answered_at'),
                    ]);
                    if (remoteProgress.error || attemptsResult.error || !remoteProgress.data) {
                        logger.error("[Sync] reading question conflict fetch error", remoteProgress.error ?? attemptsResult.error);
                        return false;
                    }
                    let merged = createEmptyReadingQuestionProgress(data.userId, data.questionId);
                    let dummySkill = createEmptyReadingSkillProgress(data.userId, 'conflict-replay');
                    for (const attempt of attemptsResult.data ?? []) {
                        const transition = evaluateReadingAnswer(
                            merged,
                            dummySkill,
                            attempt.is_correct,
                            new Date(attempt.answered_at),
                        );
                        merged = transition.questionProgress;
                        dummySkill = {
                            ...dummySkill,
                            ...transition.skillTransition.nextState,
                        };
                    }
                    const remoteRevision = remoteProgress.data.revision as number;
                    const retry = await syncQuestionProgress(
                        { ...merged, expectedRevision: remoteRevision },
                        remoteRevision,
                    );
                    if (retry.error) {
                        logger.error("[Sync] reading question conflict retry error", retry.error);
                        return false;
                    }
                    const persisted: ReadingQuestionProgress = {
                        ...merged,
                        revision: remoteRevision + 1,
                    };
                    await db.readingQuestionProgress.put(persisted);
                    return true;
                }

                case 'upsert_reading_skill_progress': {
                    const syncSkillProgress = async (
                        data: typeof op.data,
                        expectedRevision: number,
                    ) => supabase.rpc('sync_reading_skill_progress', {
                        p_user_id: data.userId,
                        p_skill_id: data.skillId,
                        p_step: data.step,
                        p_interval_days: data.interval,
                        p_difficulty: data.difficulty,
                        p_reps: data.totalAttempts,
                        p_lapses: data.lapses,
                        p_state: data.state,
                        p_last_review_at: data.lastReview,
                        p_due_at: data.dueDate,
                        p_correct_attempts: data.correctAttempts,
                        p_total_attempts: data.totalAttempts,
                        p_expected_revision: expectedRevision,
                    });
                    const { data } = op;
                    const { error } = await syncSkillProgress(data, data.expectedRevision);
                    if (!error) return true;
                    if (error.code !== '40001') {
                        logger.error("[Sync] upsert_reading_skill_progress error", error);
                        return false;
                    }

                    const [remoteProgress, attemptsResult] = await Promise.all([
                        supabase
                            .from('reading_skill_progress')
                            .select('*')
                            .eq('user_id', data.userId)
                            .eq('skill_id', data.skillId)
                            .single(),
                        supabase
                            .from('reading_attempts')
                            .select('id,is_correct,answered_at,reading_questions!inner(primary_skill_id)')
                            .eq('user_id', data.userId)
                            .eq('reading_questions.primary_skill_id', data.skillId)
                            .order('answered_at'),
                    ]);
                    if (remoteProgress.error || attemptsResult.error || !remoteProgress.data) {
                        logger.error("[Sync] reading skill conflict fetch error", remoteProgress.error ?? attemptsResult.error);
                        return false;
                    }
                    let merged = createEmptyReadingSkillProgress(data.userId, data.skillId);
                    let correctAttempts = 0;
                    let totalAttempts = 0;
                    for (const attempt of attemptsResult.data ?? []) {
                        const transition = evaluateReadingAnswer(
                            createEmptyReadingQuestionProgress(data.userId, 'conflict-replay'),
                            merged,
                            attempt.is_correct,
                            new Date(attempt.answered_at),
                        );
                        totalAttempts += 1;
                        correctAttempts += attempt.is_correct ? 1 : 0;
                        merged = {
                            ...merged,
                            ...transition.skillTransition.nextState,
                            correctAttempts,
                            totalAttempts,
                        };
                    }
                    const remoteRevision = remoteProgress.data.revision as number;
                    const retry = await syncSkillProgress(
                        { ...merged, revision: remoteRevision + 1, expectedRevision: remoteRevision },
                        remoteRevision,
                    );
                    if (retry.error) {
                        logger.error("[Sync] reading skill conflict retry error", retry.error);
                        return false;
                    }
                    const persisted: ReadingSkillProgress = {
                        ...merged,
                        revision: remoteRevision + 1,
                    };
                    await db.readingSkillProgress.put(persisted);
                    return true;
                }

                case 'start_listening_session': {
                    const { data } = op;
                    const { error } = await supabase.from('listening_sessions').upsert({
                        id: data.id,
                        user_id: data.userId,
                        mode: data.mode,
                        primary_unit_id: data.primaryUnitId,
                        status: data.status,
                        started_at: data.startedAt,
                        ended_at: data.endedAt,
                        total_questions: data.totalQuestions,
                        correct_questions: data.correctQuestions,
                        total_time_ms: data.totalTimeMs,
                    }, { onConflict: 'id' });
                    if (error) {
                        logger.error('[Sync] start_listening_session error', error);
                        return false;
                    }
                    return true;
                }

                case 'finish_listening_session': {
                    const { data } = op;
                    const { error } = await supabase.from('listening_sessions').update({
                        status: data.status,
                        ended_at: data.endedAt,
                        total_questions: data.totalQuestions,
                        correct_questions: data.correctQuestions,
                        total_time_ms: data.totalTimeMs,
                    }).eq('id', data.id);
                    if (error) {
                        logger.error('[Sync] finish_listening_session error', error);
                        return false;
                    }
                    return true;
                }

                case 'insert_listening_attempt': {
                    const { data } = op;
                    const { error } = await supabase.rpc('insert_listening_attempt', {
                        p_id: data.id,
                        p_user_id: data.userId,
                        p_question_id: data.questionId,
                        p_session_id: data.sessionId,
                        p_selected_option_id: data.selectedOptionId,
                        p_is_correct: data.isCorrect,
                        p_earned_points: data.earnedPoints,
                        p_play_count: data.playCount,
                        p_previous_question_state: data.previousQuestionState,
                        p_next_question_state: data.nextQuestionState,
                        p_previous_skill_state: data.previousSkillState,
                        p_next_skill_state: data.nextSkillState,
                        p_response_ms: data.responseMs,
                        p_answered_at: data.answeredAt,
                    });
                    if (error) {
                        logger.error('[Sync] insert_listening_attempt error', error);
                        return false;
                    }
                    return true;
                }

                case 'upsert_listening_question_progress': {
                    const { data } = op;
                    const { error } = await supabase.rpc('sync_listening_question_progress', {
                        p_user_id: data.userId,
                        p_question_id: data.questionId,
                        p_points: data.points,
                        p_attempts: data.attempts,
                        p_correct_attempts: data.correctAttempts,
                        p_last_answered_at: data.lastAnsweredAt,
                        p_due_at: data.dueAt,
                        p_expected_revision: data.expectedRevision,
                    });
                    if (error) {
                        logger.error('[Sync] upsert_listening_question_progress error', error);
                        return false;
                    }
                    return true;
                }

                case 'upsert_listening_skill_progress': {
                    const { data } = op;
                    const { error } = await supabase.rpc('sync_listening_skill_progress', {
                        p_user_id: data.userId,
                        p_skill_code: data.skillCode,
                        p_step: data.step,
                        p_interval_days: data.interval,
                        p_difficulty: data.difficulty,
                        p_reps: data.totalAttempts,
                        p_lapses: data.lapses,
                        p_state: data.state,
                        p_last_review_at: data.lastReview,
                        p_due_at: data.dueDate,
                        p_correct_attempts: data.correctAttempts,
                        p_total_attempts: data.totalAttempts,
                        p_expected_revision: data.expectedRevision,
                    });
                    if (error) {
                        logger.error('[Sync] upsert_listening_skill_progress error', error);
                        return false;
                    }
                    return true;
                }

                default: {
                    logger.warn("[Sync] Unknown operation type:", (op as any).type);
                    return false;
                }
            }
        } catch (e) {
            logger.error("[Sync] Critical error processing operation", e);
            return false;
        }
    }, [supabase]);

    const performSync = useCallback(async () => {
        if (!enabled || syncingRef.current || !isOnline) return;

        const queue = await db.syncQueue.orderBy('id').toArray();
        if (queue.length === 0) return;

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;

        syncingRef.current = true;
        setIsSyncing(true);
        logger.log(`[Sync] Processing ${queue.length} operations...`);

        try {
            for (const op of queue) {
                const retries = (op as any).retryCount ?? 0;
                const success = await processOperation(op);
                if (success) {
                    await db.syncQueue.delete(op.id!);
                } else if (retries >= MAX_RETRIES) {
                    // Give up after MAX_RETRIES to avoid infinite retry loop
                    logger.error(`[Sync] Dropping failed operation after ${MAX_RETRIES} retries: ${op.type} (id: ${op.id})`);
                    await db.syncQueue.delete(op.id!);
                } else {
                    // Increment retry count
                    await db.syncQueue.update(op.id!, { retryCount: retries + 1 });
                }
            }
            setLastSync(new Date());
        } finally {
            syncingRef.current = false;
            setIsSyncing(false);
        }
    }, [enabled, isOnline, processOperation, supabase]);

    // Sync immediately when the app becomes usable again, then use a low-cost
    // fallback interval only while the tab is visible.
    useEffect(() => {
        if (!enabled) return;
        const syncIfVisible = () => {
            if (document.visibilityState === 'visible') void performSync();
        };

        syncIfVisible();
        window.addEventListener('online', syncIfVisible);
        document.addEventListener('visibilitychange', syncIfVisible);
        const interval = window.setInterval(syncIfVisible, 60_000);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener('online', syncIfVisible);
            document.removeEventListener('visibilitychange', syncIfVisible);
        };
    }, [enabled, performSync]);

    return { isSyncing, lastSync, performSync };
}
