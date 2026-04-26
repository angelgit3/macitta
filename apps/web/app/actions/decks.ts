"use server";

import { createClient } from "@/utils/supabase/server";

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

export async function deleteDeck(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("decks").delete().eq("id", id).eq("author_id", user.id);
    if (error) throw new Error(error.message);
    return { success: true };
}

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

export async function unassignDeckFromClassroom(deck_id: string, classroom_id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("classroom_decks").delete().eq("deck_id", deck_id).eq("classroom_id", classroom_id);
    if (error) throw new Error(error.message);
    return { success: true };
}
