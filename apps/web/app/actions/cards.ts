/**
 * Server Actions for Card & Slot Management
 * Responsible for parsing complex JSON slots into relational DB rows.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { assertUuid, sanitizeCardInput } from "@macitta/shared";
import {
    assertCardCapacity,
    assertOwnedCard,
    assertOwnedDeck,
    requireAuthenticatedUser,
    throwSafeDatabaseError,
} from "@/lib/serverActionGuard";

/**
 * Creates a new flashcard and its associated answer slots.
 * Automatically infers the correct `match_type` based on the payload structure.
 * 
 * @param deck_id - UUID of the parent deck
 * @param front_text - The visible question/prompt
 * @param slots - Array of builder-formatted slot objects
 * @param front_media - Optional URL for image/audio attached to the question
 * @returns The created card object
 */
export async function createCard(deck_id: string, front_text: string, slots: unknown, front_media?: string | null) {
    const deckId = assertUuid(deck_id, "El mazo");
    const input = sanitizeCardInput(front_text, slots, front_media);
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);
    await assertOwnedDeck(supabase, deckId, user.id);
    await assertCardCapacity(supabase, deckId);

    // Start transaction: insert card
    const { data: card, error: cardError } = await supabase.from("cards").insert({
        deck_id: deckId,
        front_text: input.frontText,
        front_media: input.frontMedia,
    }).select().single();

    if (cardError || !card) throwSafeDatabaseError("create-card", cardError);

    // Insert slots
    const slotsData = input.slots.map((slot) => ({
        ...slot,
        card_id: card.id,
    }));
    const { error: slotsError } = await supabase.from("card_slots").insert(slotsData);
    if (slotsError) {
        await supabase.from("cards").delete().eq("id", card.id);
        throwSafeDatabaseError("create-card-slots", slotsError);
    }

    return card;
}

/**
 * Updates an existing card and replaces all its answer slots.
 * Currently uses a drop-and-replace strategy for `card_slots` to ensure cleanly synced arrays.
 * 
 * @param card_id - UUID of the card to update
 * @param front_text - The new question/prompt
 * @param slots - Array of new builder-formatted slot objects
 * @param front_media - Optional new URL for image/audio
 * @returns The updated card object
 */
export async function editCard(card_id: string, front_text: string, slots: unknown, front_media?: string | null) {
    const cardId = assertUuid(card_id, "La tarjeta");
    const input = sanitizeCardInput(front_text, slots, front_media);
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);
    await assertOwnedCard(supabase, cardId, user.id);

    // Update card front
    const { data: card, error: cardError } = await supabase.from("cards").update({
        front_text: input.frontText,
        front_media: input.frontMedia,
    }).eq("id", cardId).select().single();

    if (cardError || !card) throwSafeDatabaseError("update-card", cardError);

    // Replace slots. First delete old slots, then insert new ones.
    const { error: deleteError } = await supabase.from("card_slots").delete().eq("card_id", cardId);
    if (deleteError) throwSafeDatabaseError("delete-card-slots", deleteError);

    const slotsData = input.slots.map((slot) => ({
        ...slot,
        card_id: card.id,
    }));
    const { error: slotsError } = await supabase.from("card_slots").insert(slotsData);
    if (slotsError) {
        throwSafeDatabaseError("replace-card-slots", slotsError);
    }

    return card;
}

/**
 * Permanently deletes a card and all its child slots.
 * 
 * @param card_id - UUID of the card to delete
 * @returns Success boolean object
 */
export async function deleteCard(card_id: string) {
    const cardId = assertUuid(card_id, "La tarjeta");
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);
    await assertOwnedCard(supabase, cardId, user.id);

    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) throwSafeDatabaseError("delete-card", error);
    return { success: true };
}
