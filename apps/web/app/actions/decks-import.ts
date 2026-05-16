"use server";

import { createClient } from "@/utils/supabase/server";

export async function importDeckFromJson(jsonString: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autorizado");

    let parsed: any;
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        throw new Error("Formato JSON inválido");
    }

    if (!parsed.deck || !parsed.cards || !Array.isArray(parsed.cards)) {
        throw new Error("Estructura inválida. Debe tener el objeto 'deck' y el array 'cards'.");
    }

    const { name, description, color, question_labels, answer_labels } = parsed.deck;
    if (!name || !question_labels || !answer_labels) {
        throw new Error("El mazo debe tener name, question_labels, y answer_labels.");
    }

    let deckId: string | null = null;

    try {
        // Fix: Postgres arrays expect proper string arrays. Ensure they are mapped as pure strings.
        const cleanQuestionLabels = Array.isArray(question_labels) ? question_labels.map(String).filter(Boolean) : [];
        const cleanAnswerLabels = Array.isArray(answer_labels) ? answer_labels.map(String).filter(Boolean) : [];

        // Log to server console so we can see what we are sending
        console.log("Saving deck with labels:", { cleanQuestionLabels, cleanAnswerLabels });

        const { data: deckData, error: deckError } = await supabase.from("decks").insert({
            author_id: user.id,
            title: name,
            description: description || null,
            color: color || null,
            question_labels: cleanQuestionLabels,
            answer_labels: cleanAnswerLabels
        }).select("id").single();

        if (deckError) {
            console.error("Deck Insert Error:", deckError);
            throw new Error(`Error en DB: ${deckError.message} / Details: ${deckError.details || 'none'} / Hint: ${deckError.hint || 'none'}`);
        }
        deckId = deckData.id;

        // Prepare cards and slots
        const cardsToInsert = [];
        for (const card of parsed.cards) {
            if (!card.front_text) throw new Error("La tarjeta no tiene front_text");
            if (!card.answers || !Array.isArray(card.answers)) throw new Error("La tarjeta no tiene el array answers");
            
            cardsToInsert.push({
                deck_id: deckId,
                front_text: card.front_text,
                front_media: card.front_media || null,
            });
        }

        if (cardsToInsert.length === 0) {
            throw new Error("El mazo no tiene tarjetas.");
        }

        // Insert cards
        const { data: insertedCards, error: cardsError } = await supabase.from("cards").insert(cardsToInsert).select("id");
        if (cardsError) throw cardsError;

        // Insert slots
        const slotsToInsert = [];
        for (let i = 0; i < parsed.cards.length; i++) {
            const card = parsed.cards[i];
            const dbCard = insertedCards[i];
            
            for (let j = 0; j < card.answers.length; j++) {
                const answer = card.answers[j];
                if (!answer.field || !answer.text) throw new Error("La respuesta no tiene field o text");

                // Determine if it's simple accepted_answers or advanced_rules
                let accepted_answers: string[] = [];
                let advanced_rules: any = null;
                let match_type = 'any';

                if (typeof answer.text === "string") {
                    accepted_answers = [answer.text];
                    match_type = 'exact';
                } else if (Array.isArray(answer.text)) {
                    accepted_answers = answer.text; // Assuming simple array means any of these
                    match_type = 'any';
                } else if (typeof answer.text === "object" && answer.text !== null) {
                    advanced_rules = answer.text;
                    match_type = 'advanced';
                }

                slotsToInsert.push({
                    card_id: dbCard.id,
                    label: answer.field,
                    accepted_answers,
                    match_type,
                    order_index: j,
                    advanced_rules,
                    media: answer.media || null
                });
            }
        }

        if (slotsToInsert.length > 0) {
            const { error: slotsError } = await supabase.from("card_slots").insert(slotsToInsert);
            if (slotsError) throw slotsError;
        }

        return { success: true, deckId };

    } catch (error: any) {
        if (deckId) {
            await supabase.from("decks").delete().eq("id", deckId);
        }
        throw new Error(error.message || "Error al importar el mazo");
    }
}
