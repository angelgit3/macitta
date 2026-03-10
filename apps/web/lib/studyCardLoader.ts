import { createClient } from "@/utils/supabase/client";
import { migrateFromFSRS, createEmptySEMState } from "@maccita/shared";
import { db, type LocalCard, type LocalUserItem } from "@/lib/db";
import type { CardData, Slot } from "@/types/study";

// ─── Helpers ─────────────────────────────────────────────────────────

/** Sort raw slot data by order_index. */
function sortSlots(slots: Slot[]): Slot[] {
    return [...slots].sort((a, b) => a.order_index - b.order_index);
}

/**
 * Build a CardData from raw card + optional user progress.
 * Migrates FSRS data to SEM state when progress exists.
 */
function toCardData(
    card: { id: string; question: string },
    slots: Slot[],
    progress?: LocalUserItem | null,
): CardData {
    return {
        id: card.id,
        question: card.question,
        slots: sortSlots(slots),
        sem: progress ? migrateFromFSRS(progress) : createEmptySEMState(),
    };
}

// ─── Deck Resolution ─────────────────────────────────────────────────

/**
 * Resolves a deck ID by title from Supabase, with local fallback.
 * Returns `null` if no deck can be found at all.
 */
export async function resolveDeckId(
    deckTitle: string,
): Promise<string | null> {
    const supabase = createClient();

    const { data: deck } = await supabase
        .from("decks")
        .select("id")
        .eq("title", deckTitle)
        .single();

    if (deck?.id) return deck.id;

    // Fallback: infer deck_id from any locally cached card
    const localCards = await db.cards.limit(1).toArray();
    return localCards.length > 0 ? localCards[0].deck_id : null;
}

// ─── Due Cards (Normal Mode) ─────────────────────────────────────────

/**
 * Loads cards due for review. Strategy:
 * 1. If online → fetch from Supabase and cache to Dexie
 * 2. Fallback → load from Dexie
 * 3. Sort by due_date (most overdue first)
 * 4. Take up to `batchSize` cards
 */
export async function loadDueCards(
    deckId: string,
    userId: string | null,
    batchSize = 10,
): Promise<CardData[]> {
    const supabase = createClient();
    let rawCards: any[] = [];

    // 1. Try remote fetch + local cache
    if (navigator.onLine) {
        const { data: remoteCards, error } = await supabase
            .from("cards")
            .select(`
                id, question,
                card_slots (id, label, accepted_answers, match_type, order_index),
                user_items (stability, difficulty, reps, lapses, state, last_review, due_date)
            `)
            .eq("deck_id", deckId);

        if (error) console.error("[SREM] Fetch error:", error);

        if (remoteCards && remoteCards.length > 0) {
            try {
                const localCards: LocalCard[] = remoteCards.map(c => ({
                    id: c.id,
                    deck_id: deckId,
                    question: c.question,
                    slots: c.card_slots,
                    updated_at: new Date().toISOString(),
                }));

                const localUserItems: LocalUserItem[] = remoteCards
                    .filter(c => c.user_items?.[0] && userId)
                    .map(c => {
                        const ui = c.user_items[0];
                        return {
                            user_id: userId!,
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
                rawCards = remoteCards;
            } catch (dbErr) {
                console.error("[SREM] Dexie bulkPut failed:", dbErr);
            }
        }
    }

    // 2. Fallback: Dexie
    if (rawCards.length === 0) {
        const localCards = await db.cards.where("deck_id").equals(deckId).toArray();
        const localItems = userId
            ? await db.userItems.where("user_id").equals(userId).toArray()
            : [];

        rawCards = localCards.map(lc => ({
            ...lc,
            card_slots: lc.slots,
            user_items: [localItems.find(li => li.card_id === lc.id)],
        }));
    }

    if (rawCards.length === 0) return [];

    // 3. Sort by due_date (most overdue first)
    rawCards.sort((a, b) => {
        const dueA = a.user_items?.[0]?.due_date
            ? new Date(a.user_items[0].due_date).getTime()
            : 0;
        const dueB = b.user_items?.[0]?.due_date
            ? new Date(b.user_items[0].due_date).getTime()
            : 0;
        return dueA - dueB;
    });

    // 4. Format and return
    return rawCards.slice(0, batchSize).map((c: any) =>
        toCardData(c, c.card_slots, c.user_items?.[0]),
    );
}

// ─── Rush Cards (Weakness-Based) ─────────────────────────────────────

/**
 * Selects cards by weakness score for Rush Mode.
 * More lapses + higher difficulty = weaker card.
 * Shuffles from a wider pool for variety.
 */
export async function loadRushCards(
    deckId: string,
    userId: string,
    batchSize = 10,
    poolSize = 30,
): Promise<CardData[]> {
    const allCards = await db.cards.where("deck_id").equals(deckId).toArray();
    const userProgress = await db.userItems.where("user_id").equals(userId).toArray();
    const progressMap = new Map(userProgress.map(p => [p.card_id, p]));

    // Score by weakness
    const scored = allCards.map(card => {
        const progress = progressMap.get(card.id);
        const weaknessScore = progress
            ? (progress.lapses * 3) + (progress.difficulty * 2) + (1 / Math.max(progress.stability, 0.1))
            : 5; // New cards get a moderate score
        return { card, progress, weaknessScore };
    });

    // Sort weakest first, then shuffle the top pool for variety
    scored.sort((a, b) => b.weaknessScore - a.weaknessScore);
    const pool = scored.slice(0, poolSize);

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, batchSize).map(({ card, progress }) =>
        toCardData(card, card.slots as Slot[], progress),
    );
}

// ─── Remaining Due Count ────────────────────────────────────────────

/**
 * Counts how many cards in a deck are currently due for review.
 */
export async function countRemainingDue(
    deckId: string,
    userId: string,
): Promise<number> {
    const now = new Date().toISOString();
    const deckCards = await db.cards.where("deck_id").equals(deckId).toArray();
    const userProgress = await db.userItems.where("user_id").equals(userId).toArray();
    const progressMap = new Map(userProgress.map(p => [p.card_id, p]));

    let count = 0;
    for (const card of deckCards) {
        const progress = progressMap.get(card.id);
        if (!progress || progress.due_date <= now) count++;
    }
    return count;
}
