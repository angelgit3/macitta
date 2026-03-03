import {
    evaluateSEM,
    type SEMCardState,
    type SEMGrade,
} from "@maccita/shared";
import { db } from "@/lib/db";

// ─── Types ──────────────────────────────────────────────────────────

export interface ReviewParams {
    userId: string;
    cardId: string;
    sessionId: string | null;
    semState: SEMCardState;
    accuracy: number;
    timeTakenMs: number;
    isRushMode: boolean;
}

export interface ReviewResult {
    grade: SEMGrade;
}

// ─── Service ────────────────────────────────────────────────────────

/**
 * Persists a card review to local Dexie + queues for sync.
 *
 * In rush mode, SRS state is NOT updated (protects long-term scheduling),
 * but the study log is always recorded for stats/streak tracking.
 */
export async function saveReview(params: ReviewParams): Promise<ReviewResult> {
    const {
        userId, cardId, sessionId,
        semState, accuracy, timeTakenMs, isRushMode,
    } = params;

    const semResult = evaluateSEM(semState, accuracy, timeTakenMs);

    // 1. Update SRS state (normal mode only)
    if (!isRushMode) {
        const ns = semResult.nextState;

        await db.userItems.put({
            user_id: userId,
            card_id: cardId,
            stability: ns.interval,
            difficulty: ns.difficulty,
            reps: ns.step,
            lapses: ns.lapses,
            state: ns.state,
            last_review: ns.lastReview,
            due_date: ns.dueDate,
        });

        await db.syncQueue.add({
            type: "upsert_user_item",
            data: {
                user_id: userId,
                card_id: cardId,
                stability: ns.interval,
                difficulty: ns.difficulty,
                reps: ns.step,
                lapses: ns.lapses,
                state: ns.state,
                last_review: ns.lastReview,
                due_date: ns.dueDate,
            },
            created_at: new Date().toISOString(),
        });
    }

    // 2. Always log study activity (counts toward stats/streak)
    await db.syncQueue.add({
        type: "insert_study_log",
        data: {
            user_id: userId,
            card_id: cardId,
            session_id: sessionId,
            grade: semResult.grade,
            time_taken_ms: timeTakenMs,
            accuracy,
            review_date: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
    });

    return { grade: semResult.grade };
}
