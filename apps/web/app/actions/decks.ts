/**
 * Server Actions for Deck Management
 * These functions execute securely on the server side and interact directly with Supabase.
 */
"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Creates a new personal deck for the authenticated user.
 * 
 * @param title - The visible title of the deck
 * @param description - Optional details about the deck's contents
 * @returns The created deck object from the database
 */
export async function createDeck(title: string, description?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { data, error } = await supabase.from("decks").insert({
        title,
        description,
        author_id: user.id
    }).select().single();

    if (error) throw new Error(error.message);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { data, error } = await supabase.from("decks").update({
        title,
        description
    }).eq("id", id).eq("author_id", user.id).select().single();

    if (error) throw new Error(error.message);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("decks").delete().eq("id", id).eq("author_id", user.id);
    if (error) throw new Error(error.message);
    return { success: true };
}

/**
 * Links a deck to a specific classroom so students can study it.
 * Note: A teacher must own/manage the classroom to assign decks to it.
 * 
 * @param deck_id - UUID of the deck to assign
 * @param classroom_id - UUID of the target classroom
 * @returns Success boolean object
 */
export async function assignDeckToClassroom(deck_id: string, classroom_id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("classroom_decks").insert({
        classroom_id,
        deck_id
    });
    if (error) throw new Error(error.message);
    return { success: true };
}

/**
 * Removes a deck from a classroom, revoking student access to study it 
 * (unless the student imported it personally).
 * 
 * @param deck_id - UUID of the deck to unassign
 * @param classroom_id - UUID of the target classroom
 * @returns Success boolean object
 */
export async function unassignDeckFromClassroom(deck_id: string, classroom_id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("classroom_decks").delete().eq("deck_id", deck_id).eq("classroom_id", classroom_id);
    if (error) throw new Error(error.message);
    return { success: true };
}
