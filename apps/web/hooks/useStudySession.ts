import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateAnswer, calculateSlotAccuracy, SEMGrade } from "@maccita/shared";

import type { CardData, SlotFeedback, SessionStats } from "@/types/study";
import { useNetworkStatus } from "./useNetworkStatus";
import { useSessionManager } from "./useSessionManager";
import {
    resolveDeckId,
    loadDueCards,
    loadRushCards,
    countRemainingDue,
} from "@/lib/studyCardLoader";
import { saveReview } from "@/lib/studyReviewService";

// Re-export types for backward compatibility with consumers
export type { CardData, SlotFeedback, Slot } from "@/types/study";

// ─── Constants ──────────────────────────────────────────────────────

const DECK_TITLE = "Verbos Irregulares";
const BATCH_SIZE = 10;
const LOAD_TIMEOUT_MS = 8000;

// ─── Hook ───────────────────────────────────────────────────────────

export function useStudySession() {
    const supabase = createClient();
    const { isOffline } = useNetworkStatus();
    const { sessionId, startSession, endSession } = useSessionManager();

    // Queue state
    const [queue, setQueue] = useState<CardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);

    // Deck
    const [deckId, setDeckId] = useState<string | null>(null);

    // Rush mode
    const [isRushMode, setIsRushMode] = useState(false);
    const [remainingDueCount, setRemainingDueCount] = useState<number | null>(null);
    const isRushModeRef = useRef(false);

    // Interaction state
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<Record<string, SlotFeedback>>({});
    const [isRevealed, setIsRevealed] = useState(false);
    const [lastGrade, setLastGrade] = useState<SEMGrade | null>(null);

    // Timers
    const [startTime, setStartTime] = useState<number | null>(null);

    // Stats
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        correct: 0,
        total: 0,
        durationMs: 0,
    });

    // ─── Shared: Reset Interaction State ─────────────────────────────

    const resetInteraction = useCallback(() => {
        setUserAnswers({});
        setFeedback({});
        setIsRevealed(false);
        setLastGrade(null);
    }, []);

    const resetSession = useCallback(() => {
        setCurrentIndex(0);
        setSessionComplete(false);
        setSessionStats({ correct: 0, total: 0, durationMs: 0 });
        resetInteraction();
    }, [resetInteraction]);

    // ─── Initial Content Load ───────────────────────────────────────

    useEffect(() => {
        let isMounted = true;

        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("[SEM] Failsafe timeout. Forcing loading false.");
                setLoading(false);
            }
        }, LOAD_TIMEOUT_MS);

        async function init() {
            setLoading(true);
            try {
                const { data: authData } = await supabase.auth.getUser();
                const userId = authData?.user?.id ?? null;

                const dId = await resolveDeckId(DECK_TITLE);
                if (!dId) throw new Error("Deck not found");

                setDeckId(dId);
                await startSession(dId);

                const cards = await loadDueCards(dId, userId, BATCH_SIZE);
                setQueue(cards);
            } catch (err) {
                console.error("[SEM] Init error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(timeout);
                }
            }
        }

        init();
        return () => { isMounted = false; clearTimeout(timeout); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Card Navigation ────────────────────────────────────────────

    const currentCard = queue[currentIndex];

    useEffect(() => {
        if (currentCard) {
            resetInteraction();
            setStartTime(Date.now());
        }
    }, [currentCard, resetInteraction]);

    // ─── Submit Answer ──────────────────────────────────────────────

    const submitAnswer = useCallback(async () => {
        if (!currentCard || !startTime) return;
        const timeTakenMs = Date.now() - startTime;

        // Evaluate each slot
        const newFeedback: Record<string, SlotFeedback> = {};
        currentCard.slots.forEach(slot => {
            const input = userAnswers[slot.id] || "";
            const target = slot.match_type === "all"
                ? { allOf: slot.accepted_answers }
                : slot.accepted_answers;
            const isCorrect = validateAnswer(input, target);
            newFeedback[slot.id] = { status: isCorrect ? "correct" : "incorrect" };
        });

        setFeedback(newFeedback);
        setIsRevealed(true);

        // SEM: granular slot accuracy
        const accuracy = calculateSlotAccuracy(newFeedback);
        const allCorrect = accuracy === 1.0;

        setSessionStats(prev => ({
            ...prev,
            total: prev.total + 1,
            correct: prev.correct + (allCorrect ? 1 : 0),
        }));

        // Persist review
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const result = await saveReview({
                userId: user.id,
                cardId: currentCard.id,
                sessionId,
                semState: currentCard.sem,
                accuracy,
                timeTakenMs,
                isRushMode: isRushModeRef.current,
            });

            setLastGrade(result.grade);
        } catch (err) {
            console.error("[SEM] Save review error:", err);
        }
    }, [currentCard, startTime, userAnswers, sessionId, supabase]);

    // ─── Next Card ──────────────────────────────────────────────────

    const nextCard = useCallback(async () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            const duration = await endSession(sessionStats);
            if (duration > 0) {
                setSessionStats(prev => ({ ...prev, durationMs: duration }));
            }

            if (!isRushModeRef.current && deckId) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const remaining = await countRemainingDue(deckId, user.id);
                        setRemainingDueCount(remaining);
                    }
                } catch { /* non-critical */ }
            }

            setSessionComplete(true);
        }
    }, [currentIndex, queue.length, endSession, sessionStats, deckId, supabase]);

    // ─── Rush Mode ──────────────────────────────────────────────────

    const startRushMode = useCallback(async () => {
        setIsRushMode(true);
        isRushModeRef.current = true;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !deckId) return;

            const cards = await loadRushCards(deckId, user.id, BATCH_SIZE);
            setQueue(cards);
            resetSession();
            await startSession(deckId);
        } catch (err) {
            console.error("[SEM] Rush load error:", err);
        } finally {
            setLoading(false);
        }
    }, [deckId, supabase, resetSession, startSession]);

    // ─── Input Handler ──────────────────────────────────────────────

    const handleInputChange = useCallback((slotId: string, value: string) => {
        if (!isRevealed) {
            setUserAnswers(prev => ({ ...prev, [slotId]: value }));
        }
    }, [isRevealed]);

    // ─── Public API ─────────────────────────────────────────────────

    return {
        loading,
        sessionComplete,
        currentCard,
        userAnswers,
        feedback,
        isRevealed,
        lastGrade,
        handleInputChange,
        submitAnswer,
        nextCard,
        totalCards: queue.length,
        progress: currentIndex + 1,
        stats: sessionStats,
        isOffline,
        isRushMode,
        remainingDueCount,
        startRushMode,
    };
}
