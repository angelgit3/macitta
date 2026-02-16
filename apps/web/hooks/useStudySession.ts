import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateAnswer, Grade, createEmptyCard, type Card as FSRSCard, fsrs } from "@maccita/shared";
import { db, type LocalCard, type LocalUserItem } from "@/lib/db";

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
    srs?: FSRSCard;
}

export interface SlotFeedback {
    status: 'correct' | 'incorrect' | 'neutral';
    message?: string;
}

export function useStudySession() {
    const supabase = createClient();
    const [queue, setQueue] = useState<CardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    // Session state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [deckId, setDeckId] = useState<string | null>(null);

    // Current interaction state
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<Record<string, SlotFeedback>>({});
    const [isRevealed, setIsRevealed] = useState(false);

    // Timer state
    const [startTime, setStartTime] = useState<number | null>(null);
    const sessionStartTime = useRef<number>(Date.now());

    // Stats
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        total: 0,
        durationMs: 0
    });

    // Device status listeners
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const startSession = async (dId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (navigator.onLine) {
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
            }
        } catch (err) {
            console.error("Error starting study session:", err);
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
                    total_time_ms: totalDuration
                })
                .eq('id', sessionId);

            setSessionStats(prev => ({ ...prev, durationMs: totalDuration }));
        } catch (err) {
            console.error("Error ending study session:", err);
        }
    };

    // Offline-First Fetching
    useEffect(() => {
        let isMounted = true;
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("[useStudySession] Failsafe timeout reached. Forcing loading false.");
                setLoading(false);
            }
        }, 8000); // 8 second failsafe

        async function loadContent() {
            setLoading(true);
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError || !authData?.user) {
                    console.warn("[useStudySession] Auth check failed, attempting local-only mode");
                }
                const user = authData?.user;

                // 1. Resolve Deck
                const { data: deck, error: deckErr } = await supabase.from('decks').select('id').eq('title', 'Verbos Irregulares').single();
                let dId = deck?.id;

                if (deckErr || !dId) {
                    console.warn("[useStudySession] Deck not found in cloud, checking local...");
                    const localCards = await db.cards.limit(1).toArray();
                    if (localCards.length > 0) dId = localCards[0].deck_id;
                }

                if (!dId) throw new Error("Deck not found and no local cache available");

                setDeckId(dId);
                await startSession(dId);

                let cardsForState: any[] = [];

                // 2. Refresh from Hub if Online
                if (navigator.onLine) {
                    console.log("[useStudySession] Online: Refreshing content from Supabase...");
                    const { data: remoteCards, error: fetchError } = await supabase
                        .from('cards')
                        .select(`
                            id, question,
                            card_slots (id, label, accepted_answers, match_type, order_index),
                            user_items (stability, difficulty, reps, lapses, state, last_review, due_date)
                        `)
                        .eq('deck_id', dId);

                    if (fetchError) {
                        console.error("[useStudySession] Supabase fetch error:", fetchError);
                    }

                    if (remoteCards && remoteCards.length > 0) {
                        console.log(`[useStudySession] Syncing ${remoteCards.length} cards to local cache...`);

                        try {
                            const localCards: LocalCard[] = remoteCards.map(c => ({
                                id: c.id,
                                deck_id: dId,
                                question: c.question,
                                slots: c.card_slots,
                                updated_at: new Date().toISOString()
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
                                        due_date: ui.due_date
                                    };
                                });

                            await db.cards.bulkPut(localCards);
                            if (localUserItems.length > 0) {
                                await db.userItems.bulkPut(localUserItems);
                            }
                            console.log("[useStudySession] Local cache updated successfully.");
                            cardsForState = remoteCards;
                        } catch (dbErr) {
                            console.error("[useStudySession] Dexie bulkPut failed:", dbErr);
                        }
                    }
                }

                // 3. Fallback/Load from Local Dexie
                if (cardsForState.length === 0) {
                    console.log("[useStudySession] Loading from local storage...");
                    const localCards = await db.cards.where('deck_id').equals(dId).toArray();
                    const localItems = user ? await db.userItems.where('user_id').equals(user.id).toArray() : [];

                    if (localCards.length > 0) {
                        cardsForState = localCards.map(lc => ({
                            ...lc,
                            card_slots: lc.slots,
                            user_items: [localItems.find(li => li.card_id === lc.id)]
                        }));
                    }
                }

                if (cardsForState.length === 0) {
                    console.warn("[useStudySession] No cards available!");
                    setQueue([]);
                    return;
                }

                // 4. Sort and Format
                cardsForState.sort((a, b) => {
                    const dueA = a.user_items?.[0]?.due_date ? new Date(a.user_items[0].due_date).getTime() : 0;
                    const dueB = b.user_items?.[0]?.due_date ? new Date(b.user_items[0].due_date).getTime() : 0;
                    return dueA - dueB;
                });

                const formatted = cardsForState.slice(0, 10).map((c: any) => {
                    const progress = c.user_items?.[0];
                    const srs: FSRSCard = progress ? {
                        ...createEmptyCard(),
                        stability: progress.stability,
                        difficulty: progress.difficulty,
                        reps: progress.reps,
                        lapses: progress.lapses,
                        state: progress.state === 'new' ? 0 : progress.state === 'learning' ? 1 : progress.state === 'review' ? 2 : 3,
                        last_review: progress.last_review ? new Date(progress.last_review) : new Date(0),
                        due: progress.due_date ? new Date(progress.due_date) : new Date(),
                    } : createEmptyCard();

                    return {
                        id: c.id,
                        question: c.question,
                        slots: c.card_slots.sort((a: any, b: any) => a.order_index - b.order_index),
                        srs
                    };
                });

                setQueue(formatted);
            } catch (err) {
                console.error("[useStudySession] Initialization error:", err);
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

    const currentCard = queue[currentIndex];

    useEffect(() => {
        if (currentCard) {
            setUserAnswers({});
            setFeedback({});
            setIsRevealed(false);
            setStartTime(Date.now());
        }
    }, [currentCard]);

    const saveReview = async (cardId: string, oldSrs: FSRSCard, grade: Grade, timeTakenMs: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const scheduling = fsrs.repeat(oldSrs, new Date());
            const finalResult = scheduling[grade];
            const newState = finalResult.card.state === 0 ? 'new' : finalResult.card.state === 1 ? 'learning' : finalResult.card.state === 2 ? 'review' : 'relearning';

            // 1. Local Cache Update
            await db.userItems.put({
                user_id: user.id,
                card_id: cardId,
                stability: finalResult.card.stability,
                difficulty: finalResult.card.difficulty,
                reps: finalResult.card.reps,
                lapses: finalResult.card.lapses,
                state: newState,
                last_review: new Date().toISOString(),
                due_date: finalResult.card.due.toISOString()
            });

            // 2. Queue for Sychronization
            await db.syncQueue.add({
                type: 'upsert_user_item',
                data: {
                    user_id: user.id,
                    card_id: cardId,
                    stability: finalResult.card.stability,
                    difficulty: finalResult.card.difficulty,
                    reps: finalResult.card.reps,
                    lapses: finalResult.card.lapses,
                    state: newState,
                    last_review: new Date().toISOString(),
                    due_date: finalResult.card.due.toISOString()
                },
                created_at: new Date().toISOString()
            });

            await db.syncQueue.add({
                type: 'insert_study_log',
                data: {
                    user_id: user.id,
                    card_id: cardId,
                    session_id: sessionId,
                    grade: grade,
                    time_taken_ms: timeTakenMs,
                    accuracy: grade === Grade.Again ? 0 : 1,
                    review_date: new Date().toISOString()
                },
                created_at: new Date().toISOString()
            });

        } catch (err) {
            console.error("[useStudySession] Save review error:", err);
        }
    };

    const submitAnswer = async () => {
        if (!currentCard || !startTime) return;
        const timeTakenMs = Date.now() - startTime;
        const newFeedback: Record<string, SlotFeedback> = {};
        let allCorrect = true;

        currentCard.slots.forEach(slot => {
            const input = userAnswers[slot.id] || "";
            const isCorrect = validateAnswer(input, slot.match_type === 'all' ? { allOf: slot.accepted_answers } : slot.accepted_answers);
            newFeedback[slot.id] = { status: isCorrect ? 'correct' : 'incorrect' };
            if (!isCorrect) allCorrect = false;
        });

        setFeedback(newFeedback);
        setIsRevealed(true);
        setSessionStats(prev => ({ ...prev, total: prev.total + 1, correct: prev.correct + (allCorrect ? 1 : 0) }));

        let grade: Grade;
        if (!allCorrect) grade = Grade.Again;
        else if (timeTakenMs < 4000) grade = Grade.Easy;
        else if (timeTakenMs < 8000) grade = Grade.Good;
        else grade = Grade.Hard;

        await saveReview(currentCard.id, currentCard.srs || createEmptyCard(), grade, timeTakenMs);
    };

    const nextCard = async () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            await endSession();
            setSessionComplete(true);
        }
    };

    return {
        loading,
        sessionComplete,
        currentCard,
        userAnswers,
        feedback,
        isRevealed,
        handleInputChange: (slotId: string, value: string) => !isRevealed && setUserAnswers(prev => ({ ...prev, [slotId]: value })),
        submitAnswer,
        nextCard,
        totalCards: queue.length,
        progress: currentIndex + 1,
        stats: sessionStats,
        isOffline
    };
}
