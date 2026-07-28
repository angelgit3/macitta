/**
 * Server Actions for Deck Management
 * These functions execute securely on the server side and interact directly with Supabase.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { assertUuid, sanitizeDeckMetadata } from "@macitta/shared";
import {
    assertDeckQuota,
    requireAuthenticatedUser,
    throwSafeDatabaseError,
} from "@/lib/serverActionGuard";

/**
 * Creates a new personal deck for the authenticated user.
 * 
 * @param title - The visible title of the deck
 * @param description - Optional details about the deck's contents
 * @returns The created deck object from the database
 */
export async function createDeck(title: string, description?: string) {
    const input = sanitizeDeckMetadata(title, description);
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);
    await assertDeckQuota(supabase, user.id);

    const { data, error } = await supabase.from("decks").insert({
        title: input.title,
        description: input.description,
        author_id: user.id
    }).select().single();

    if (error) throwSafeDatabaseError("create-deck", error);
    return data;
}

/**
 * Updates an existing personal deck.
 * RLS Policies ensure that only the original author can update it.
 * 
 * @param id - UUID of the deck to update
 * @param title - New title
 * @param description - New description
 * @returns The updated deck object
 */
export async function updateDeck(id: string, title: string, description?: string) {
    const deckId = assertUuid(id, "El mazo");
    const input = sanitizeDeckMetadata(title, description);
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);

    const { data, error } = await supabase.from("decks").update({
        title: input.title,
        description: input.description,
    }).eq("id", deckId).eq("author_id", user.id).select().single();

    if (error) throwSafeDatabaseError("update-deck", error);
    return data;
}

/**
 * Permanently deletes a personal deck and cascades down to its cards and slots.
 * RLS Policies ensure only the original author can perform this action.
 * 
 * @param id - UUID of the deck to delete
 * @returns Success boolean object
 */
export async function deleteDeck(id: string) {
    const deckId = assertUuid(id, "El mazo");
    const supabase = await createClient();
    const user = await requireAuthenticatedUser(supabase);

    const { error } = await supabase.from("decks").delete().eq("id", deckId).eq("author_id", user.id);
    if (error) throwSafeDatabaseError("delete-deck", error);
    return { success: true };
}

