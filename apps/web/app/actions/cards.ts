"use server";

import { createClient } from "@/utils/supabase/server";

export async function createCard(deck_id: string, front_text: string, slots: any[], front_media?: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    // Start transaction: insert card
    const { data: card, error: cardError } = await supabase.from("cards").insert({
        deck_id,
        front_text,
        front_media
    }).select().single();

    if (cardError || !card) throw new Error(cardError?.message || "Error al crear la tarjeta");

    // Insert slots
    if (slots.length > 0) {
        const slotsData = slots.map((s, i) => {
            // Determine match_type and accepted_answers from text payload
            let accepted_answers: string[] = [];
            let advanced_rules: any = null;
            let match_type = 'any';

            if (typeof s.text === "string") {
                accepted_answers = [s.text];
                match_type = 'exact';
            } else if (Array.isArray(s.text)) {
                accepted_answers = s.text;
                match_type = 'any';
            } else if (typeof s.text === "object" && s.text !== null) {
                advanced_rules = s.text;
                match_type = 'advanced';
            }

            return {
                card_id: card.id,
                label: s.field,
                accepted_answers,
                match_type,
                order_index: i,
                advanced_rules,
                media: s.media || null
            };
        });
        
        const { error: slotsError } = await supabase.from("card_slots").insert(slotsData);
        if (slotsError) {
            throw new Error(slotsError.message);
        }
    }

    return card;
}

export async function editCard(card_id: string, front_text: string, slots: any[], front_media?: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    // Update card front
    const { data: card, error: cardError } = await supabase.from("cards").update({
        front_text,
        front_media
    }).eq("id", card_id).select().single();

    if (cardError || !card) throw new Error(cardError?.message || "Error al actualizar la tarjeta");

    // Replace slots. First delete old slots, then insert new ones.
    const { error: deleteError } = await supabase.from("card_slots").delete().eq("card_id", card_id);
    if (deleteError) throw new Error(deleteError.message);

    if (slots.length > 0) {
        const slotsData = slots.map((s, i) => {
            // Determine match_type and accepted_answers from text payload
            let accepted_answers: string[] = [];
            let advanced_rules: any = null;
            let match_type = 'any';

            if (typeof s.text === "string") {
                accepted_answers = [s.text];
                match_type = 'exact';
            } else if (Array.isArray(s.text)) {
                accepted_answers = s.text;
                match_type = 'any';
            } else if (typeof s.text === "object" && s.text !== null) {
                advanced_rules = s.text;
                match_type = 'advanced';
            }

            return {
                card_id: card.id,
                label: s.field,
                accepted_answers,
                match_type,
                order_index: i,
                advanced_rules,
                media: s.media || null
            };
        });
        
        const { error: slotsError } = await supabase.from("card_slots").insert(slotsData);
        if (slotsError) {
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
