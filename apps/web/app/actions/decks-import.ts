"use server";

import { sanitizeDeckImport } from "@macitta/shared";
import { createClient } from "@/utils/supabase/server";
import {
    assertDeckQuota,
    requireAuthenticatedUser,
    throwSafeDatabaseError,
} from "@/lib/serverActionGuard";

export async function importDeckFromJson(jsonString: string) {
    // Fully validate before the first write so malformed imports cannot leave
    // partial data or amplify a small request into unbounded database work.
    const input = sanitizeDeckImport(jsonString);
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);
    await assertDeckQuota(supabase, user.id);

    let deckId: string | null = null;
    try {
        const { data: deckData, error: deckError } = await supabase
            .from("decks")
            .insert({
                author_id: user.id,
                title: input.deck.title,
                description: input.deck.description,
                color: input.deck.color,
                question_labels: input.deck.questionLabels,
                answer_labels: input.deck.answerLabels,
            })
            .select("id")
            .single();
        if (deckError || !deckData) throwSafeDatabaseError("import-deck", deckError);
        deckId = deckData.id;

        const { data: insertedCards, error: cardsError } = await supabase
            .from("cards")
            .insert(input.cards.map((card) => ({
                deck_id: deckId,
                front_text: card.frontText,
                front_media: card.frontMedia,
            })))
            .select("id");
        if (cardsError || !insertedCards || insertedCards.length !== input.cards.length) {
            throwSafeDatabaseError("import-cards", cardsError);
        }

        const slotsToInsert = input.cards.flatMap((card, cardIndex) =>
            card.slots.map((slot) => ({
                ...slot,
                card_id: insertedCards[cardIndex].id,
            }))
        );
        const { error: slotsError } = await supabase
            .from("card_slots")
            .insert(slotsToInsert);
        if (slotsError) throwSafeDatabaseError("import-card-slots", slotsError);

        return { success: true, deckId };
    } catch (error) {
        if (deckId) {
            await supabase
                .from("decks")
                .delete()
                .eq("id", deckId)
                .eq("author_id", user.id);
        }
        if (error instanceof Error) throw error;
        throw new Error("No se pudo importar el mazo.");
    }
}
