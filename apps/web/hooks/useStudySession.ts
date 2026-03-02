import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateAnswer } from "@maccita/shared";
import {
    evaluateSEM,
    calculateSlotAccuracy,
    createEmptySEMState,
    migrateFromFSRS,
    SEMGrade,
    type SEMCardState,
} from "@maccita/shared";
import { db, type LocalCard, type LocalUserItem } from "@/lib/db";

// ─── Types ──────────────────────────────────────────────────────────

export interface Slot {
    id: string;
    label: string;
    accepted_answers: string[];
    match_type: 'any' | 'all';
    order_index: number;
}

export interface CardData {
    id: string;
    question: string;
    slots: Slot[];
    sem: SEMCardState;
}

export interface SlotFeedback {
    status: 'correct' | 'incorrect' | 'neutral';
    message?: string;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useStudySession() {
    const supabase = createClient();

    // Queue state
    const [queue, setQueue] = useState<CardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    // Session tracking
    const [sessionId, setSessionId] = useState<string | null>(null);
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
    const sessionStartTime = useRef<number>(Date.now());

    // Stats
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        total: 0,
        durationMs: 0,
    });

    // ─── Network Listeners ──────────────────────────────────────────

    useEffect(() => {
        const h1 = () => setIsOffline(false);
        const h2 = () => setIsOffline(true);
        window.addEventListener('online', h1);
        window.addEventListener('offline', h2);
        return () => {
            window.removeEventListener('online', h1);
            window.removeEventListener('offline', h2);
        };
    }, []);

    // ─── Session Management ─────────────────────────────────────────

    const startSession = async (dId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !navigator.onLine) return;

            const { data } = await supabase
                .from('study_sessions')
                .insert({
                    user_id: user.id,
                    deck_id: dId,
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (data) setSessionId(data.id);
        } catch (err) {
            console.error("[SEM] Error starting session:", err);
        }
    };

    const endSession = async () => {
        if (!sessionId || !navigator.onLine) return;
        const totalDuration = Date.now() - sessionStartTime.current;
        try {
            await supabase
                .from('study_sessions')
                .update({
                    ended_at: new Date().toISOString(),
                    total_cards: sessionStats.total,
                    correct_cards: sessionStats.correct,
                    total_time_ms: totalDuration,
                })
                .eq('id', sessionId);

            setSessionStats(prev => ({ ...prev, durationMs: totalDuration }));
        } catch (err) {
            console.error("[SEM] Error ending session:", err);
        }
    };

    // ─── Rush Mode: Count Remaining Due ─────────────────────────────

    const countRemainingDue = async (): Promise<number> => {
        if (!deckId) return 0;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return 0;
            const now = new Date().toISOString();
            const deckCards = await db.cards.where('deck_id').equals(deckId).toArray();
            const userProgress = await db.userItems.where('user_id').equals(user.id).toArray();
            const progressMap = new Map(userProgress.map(p => [p.card_id, p]));
            let count = 0;
            for (const card of deckCards) {
                const progress = progressMap.get(card.id);
                if (!progress || progress.due_date <= now) count++;
            }
            return count;
        } catch { return 0; }
    };

    // ─── Rush Mode: Load Weakest Cards ──────────────────────────────

    const loadRushCards = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !deckId) return;

            const allCards = await db.cards.where('deck_id').equals(deckId).toArray();
            const userProgress = await db.userItems.where('user_id').equals(user.id).toArray();
            const progressMap = new Map(userProgress.map(p => [p.card_id, p]));

            // Score by weakness: more lapses + higher difficulty = weaker
            const cardsWithScore = allCards.map(card => {
                const progress = progressMap.get(card.id);
                const weaknessScore = progress
                    ? (progress.lapses * 3) + (progress.difficulty * 2) + (1 / Math.max(progress.stability, 0.1))
                    : 5;
                return { card, progress, weaknessScore };
            });

            // Sort by weakness, shuffle top 30, pick 10 for variety
            cardsWithScore.sort((a, b) => b.weaknessScore - a.weaknessScore);
            const pool = cardsWithScore.slice(0, 30);
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }

            const formatted: CardData[] = pool.slice(0, 10).map(({ card, progress }) => ({
                id: card.id,
                question: card.question,
                slots: (card.slots as any[]).sort((a: any, b: any) => a.order_index - b.order_index),
                sem: progress ? migrateFromFSRS(progress) : createEmptySEMState(),
            }));

            setQueue(formatted);
            setCurrentIndex(0);
            setSessionComplete(false);
            setSessionStats({ correct: 0, total: 0, durationMs: 0 });
            setUserAnswers({});
            setFeedback({});
            setIsRevealed(false);
            setLastGrade(null);
            sessionStartTime.current = Date.now();
            await startSession(deckId);
        } catch (err) {
            console.error("[SEM] Rush load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const startRushMode = async () => {
        setIsRushMode(true);
        isRushModeRef.current = true;
        await loadRushCards();
    };

    // ─── Initial Content Load ───────────────────────────────────────

    useEffect(() => {
        let isMounted = true;
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("[SEM] Failsafe timeout. Forcing loading false.");
                setLoading(false);
            }
        }, 8000);

        async function loadContent() {
            setLoading(true);
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError || !authData?.user) {
                    console.warn("[SEM] Auth check failed, local-only mode");
                }
                const user = authData?.user;

                // 1. Resolve Deck
                const { data: deck, error: deckErr } = await supabase
                    .from('decks')
                    .select('id')
                    .eq('title', 'Verbos Irregulares')
                    .single();

                let dId = deck?.id;
                if (deckErr || !dId) {
                    const localCards = await db.cards.limit(1).toArray();
                    if (localCards.length > 0) dId = localCards[0].deck_id;
                }
                if (!dId) throw new Error("Deck not found");

                setDeckId(dId);
                await startSession(dId);

                let cardsForState: any[] = [];

                // 2. Refresh from Supabase if Online
                if (navigator.onLine) {
                    const { data: remoteCards, error: fetchError } = await supabase
                        .from('cards')
                        .select(`
                            id, question,
                            card_slots (id, label, accepted_answers, match_type, order_index),
                            user_items (stability, difficulty, reps, lapses, state, last_review, due_date)
                        `)
                        .eq('deck_id', dId);

                    if (fetchError) console.error("[SEM] Fetch error:", fetchError);

                    if (remoteCards && remoteCards.length > 0) {
                        try {
                            const localCards: LocalCard[] = remoteCards.map(c => ({
                                id: c.id,
                                deck_id: dId,
                                question: c.question,
                                slots: c.card_slots,
                                updated_at: new Date().toISOString(),
                            }));

                            const localUserItems: LocalUserItem[] = remoteCards
                                .filter(c => c.user_items?.[0] && user)
                                .map(c => {
                                    const ui = c.user_items[0];
                                    return {
                                        user_id: user!.id,
                                        card_id: c.id,
                                        stability: ui.stability,
                                        difficulty: ui.difficulty,
                                        reps: ui.reps,
                                        lapses: ui.lapses,
                                        state: ui.state,
                                        last_review: ui.last_review,
                                        due_date: ui.due_date,
                                    };
                                });

                            await db.cards.bulkPut(localCards);
                            if (localUserItems.length > 0) {
                                await db.userItems.bulkPut(localUserItems);
                            }
                            cardsForState = remoteCards;
                        } catch (dbErr) {
                            console.error("[SEM] Dexie bulkPut failed:", dbErr);
                        }
                    }
                }

                // 3. Fallback: Load from Dexie
                if (cardsForState.length === 0) {
                    const localCards = await db.cards.where('deck_id').equals(dId).toArray();
                    const localItems = user
                        ? await db.userItems.where('user_id').equals(user.id).toArray()
                        : [];

                    if (localCards.length > 0) {
                        cardsForState = localCards.map(lc => ({
                            ...lc,
                            card_slots: lc.slots,
                            user_items: [localItems.find(li => li.card_id === lc.id)],
                        }));
                    }
                }

                if (cardsForState.length === 0) {
                    setQueue([]);
                    return;
                }

                // 4. Sort by due_date (most overdue first) and take 10
                cardsForState.sort((a, b) => {
                    const dueA = a.user_items?.[0]?.due_date
                        ? new Date(a.user_items[0].due_date).getTime()
                        : 0;
                    const dueB = b.user_items?.[0]?.due_date
                        ? new Date(b.user_items[0].due_date).getTime()
                        : 0;
                    return dueA - dueB;
                });

                const formatted: CardData[] = cardsForState.slice(0, 10).map((c: any) => {
                    const progress = c.user_items?.[0];
                    const sem: SEMCardState = progress
                        ? migrateFromFSRS(progress)
                        : createEmptySEMState();

                    return {
                        id: c.id,
                        question: c.question,
                        slots: c.card_slots.sort((a: any, b: any) => a.order_index - b.order_index),
                        sem,
                    };
                });

                setQueue(formatted);
            } catch (err) {
                console.error("[SEM] Init error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(timeout);
                }
            }
        }

        loadContent();
        return () => { isMounted = false; clearTimeout(timeout); };
    }, []);

    // ─── Card Navigation ────────────────────────────────────────────

    const currentCard = queue[currentIndex];

    useEffect(() => {
        if (currentCard) {
            setUserAnswers({});
            setFeedback({});
            setIsRevealed(false);
            setLastGrade(null);
            setStartTime(Date.now());
        }
    }, [currentCard]);

    // ─── SEM Review: Save with Proportional Scheduling ──────────────

    const saveReview = async (
        cardId: string,
        semState: SEMCardState,
        accuracy: number,
        timeTakenMs: number,
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Calculate SEM result
            const semResult = evaluateSEM(semState, accuracy, timeTakenMs);
            setLastGrade(semResult.grade);

            // Only update SRS in normal mode (protect from cramming in rush)
            if (!isRushModeRef.current) {
                const ns = semResult.nextState;

                // 1. Update local Dexie cache
                await db.userItems.put({
                    user_id: user.id,
                    card_id: cardId,
                    stability: ns.interval,       // SEM: interval in days
                    difficulty: ns.difficulty,
                    reps: ns.step,                 // SEM: growth curve step (0-7)
                    lapses: ns.lapses,
                    state: ns.state,
                    last_review: ns.lastReview,
                    due_date: ns.dueDate,
                });

                // 2. Queue for sync to Supabase
                await db.syncQueue.add({
                    type: 'upsert_user_item',
                    data: {
                        user_id: user.id,
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

            // 3. Always log study activity (counts toward stats/streak)
            await db.syncQueue.add({
                type: 'insert_study_log',
                data: {
                    user_id: user.id,
                    card_id: cardId,
                    session_id: sessionId,
                    grade: semResult.grade,
                    time_taken_ms: timeTakenMs,
                    accuracy,
                    review_date: new Date().toISOString(),
                },
                created_at: new Date().toISOString(),
            });
        } catch (err) {
            console.error("[SEM] Save review error:", err);
        }
    };

    // ─── Submit Answer (SEM Granular Grading) ───────────────────────

    const submitAnswer = async () => {
        if (!currentCard || !startTime) return;
        const timeTakenMs = Date.now() - startTime;

        // Evaluate each slot individually
        const newFeedback: Record<string, SlotFeedback> = {};
        currentCard.slots.forEach(slot => {
            const input = userAnswers[slot.id] || "";
            const target = slot.match_type === 'all'
                ? { allOf: slot.accepted_answers }
                : slot.accepted_answers;
            const isCorrect = validateAnswer(input, target);
            newFeedback[slot.id] = { status: isCorrect ? 'correct' : 'incorrect' };
        });

        setFeedback(newFeedback);
        setIsRevealed(true);

        // SEM: Calculate granular slot accuracy (e.g., 2/3 = 0.666)
        const accuracy = calculateSlotAccuracy(newFeedback);
        const allCorrect = accuracy === 1.0;

        setSessionStats(prev => ({
            ...prev,
            total: prev.total + 1,
            correct: prev.correct + (allCorrect ? 1 : 0),
        }));

        await saveReview(currentCard.id, currentCard.sem, accuracy, timeTakenMs);
    };

    // ─── Next Card ──────────────────────────────────────────────────

    const nextCard = async () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            await endSession();
            if (!isRushModeRef.current) {
                const remaining = await countRemainingDue();
                setRemainingDueCount(remaining);
            }
            setSessionComplete(true);
        }
    };

    // ─── Public API ─────────────────────────────────────────────────

    return {
        loading,
        sessionComplete,
        currentCard,
        userAnswers,
        feedback,
        isRevealed,
        lastGrade,
        handleInputChange: (slotId: string, value: string) =>
            !isRevealed && setUserAnswers(prev => ({ ...prev, [slotId]: value })),
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
