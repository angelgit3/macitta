"use server";

import { createClient } from "@/utils/supabase/server";

export async function createCard(deck_id: string, front_text: string, slots: { label: string, accepted_answers: string[] }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    // Start transaction: insert card
    const { data: card, error: cardError } = await supabase.from("cards").insert({
        deck_id,
        front_text
    }).select().single();

    if (cardError || !card) throw new Error(cardError?.message || "Error al crear la tarjeta");

    // Insert slots
    if (slots.length > 0) {
        const slotsData = slots.map((s, i) => ({
            card_id: card.id,
            label: s.label,
            accepted_answers: s.accepted_answers,
            order_index: i
        }));
        
        const { error: slotsError } = await supabase.from("card_slots").insert(slotsData);
        if (slotsError) {
            // Rollback is complicated without stored procedures, so we just return the error
            throw new Error(slotsError.message);
        }
    }

    return card;
}

export async function deleteCard(card_id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    const { error } = await supabase.from("cards").delete().eq("id", card_id);
    if (error) throw new Error(error.message);
    return { success: true };
}
