import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateAnswer } from "@maccita/shared/src/validator"; // Direct import or via package name? Usually @maccita/shared if exports are set.
// If direct path fails, we'll fix it. Assuming @maccita/shared points to packages/shared/dist/index.js usually.
// Let's try deep import if the main index doesn't export it, but index.ts in shared usually exports everything.
// Checking previously: packages/shared/src/validator.ts.
// Let's assume @maccita/shared works if main index.ts exports validator.

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

    // Current interaction state
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // slotId -> input
    const [feedback, setFeedback] = useState<Record<string, SlotFeedback>>({});
    const [isRevealed, setIsRevealed] = useState(false);

    // Fetch cards on mount
    useEffect(() => {
        async function fetchCards() {
            setLoading(true);
            try {
                // 1. Get the deck ID (Hardcoded for now: Verbos Irregulares)
                const { data: deck } = await supabase
                    .from('decks')
                    .select('id')
                    .eq('title', 'Verbos Irregulares')
                    .single();

                if (!deck) throw new Error("Deck not found");

                // 2. Get specific 5 cards for polishing
                const targetQuestions = ['Ser/Estar', 'Vencer', 'Empezar', 'Apostar', 'Morder'];

                const { data: cards, error: cardsError } = await supabase
                    .from('cards')
                    .select(`
                        id, 
                        question,
                        card_slots (
                            id,
                            label,
                            accepted_answers,
                            match_type,
                            order_index
                        )
                    `)
                    .eq('deck_id', deck.id)
                    .in('question', targetQuestions);

                if (cardsError) throw cardsError;

                if (cards) {
                    // Sort cards manually to ensure 'Ser/Estar' and 'Vencer' come first as requested.
                    const orderMap = new Map(targetQuestions.map((q, i) => [q, i]));

                    const formattedCards = cards.map(c => ({
                        ...c,
                        slots: c.card_slots.sort((a: any, b: any) => a.order_index - b.order_index)
                    })).sort((a, b) => {
                        return (orderMap.get(a.question) ?? 99) - (orderMap.get(b.question) ?? 99);
                    }) as CardData[];

                    setQueue(formattedCards);
                }
            } catch (err) {
                console.error("Error fetching study session:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCards();
    }, []);

    const currentCard = queue[currentIndex];

    // Reset state when card changes
    useEffect(() => {
        if (currentCard) {
            setUserAnswers({});
            setFeedback({});
            setIsRevealed(false);
        }
    }, [currentCard]);

    const handleInputChange = (slotId: string, value: string) => {
        if (isRevealed) return; // Prevent editing after reveal
        setUserAnswers(prev => ({ ...prev, [slotId]: value }));
    };

    const validateSlot = (input: string, slot: Slot): boolean => {
        const targetForValidation = slot.match_type === 'all'
            ? { allOf: slot.accepted_answers } // Maps to Case 3b
            : slot.accepted_answers;       // Maps to Case 2 (Implicit Any)

        return validateAnswer(input || "", targetForValidation);
    };

    const submitAnswer = () => {
        if (!currentCard) return;

        const newFeedback: Record<string, SlotFeedback> = {};
        let allCorrect = true;

        currentCard.slots.forEach(slot => {
            const input = userAnswers[slot.id] || "";
            const isCorrect = validateSlot(input, slot);

            newFeedback[slot.id] = {
                status: isCorrect ? 'correct' : 'incorrect'
            };

            if (!isCorrect) allCorrect = false;
        });

        setFeedback(newFeedback);
        setIsRevealed(true);

        // Here we would effectively log the reviewResult to existing algorithm
        // But for V0 we just show UI feedback
    };

    const nextCard = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
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
        handleInputChange,
        submitAnswer,
        nextCard,
        totalCards: queue.length,
        progress: currentIndex + 1
    };
}
