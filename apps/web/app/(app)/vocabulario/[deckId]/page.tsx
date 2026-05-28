import { createClient } from "@/utils/supabase/server";
import { DeckDetailsClient } from "./DeckDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DeckDetailsPage({ params }: { params: Promise<{ deckId: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    const deckId = (await params).deckId;

    // Fetch deck
    const { data: deck } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

    if (!deck) {
        notFound();
    }

    // Is the user the owner?
    const isOwner = deck.author_id === user.id;

    // Fetch cards for this deck
    const { data: cards } = await supabase
        .from('cards')
        .select(`
            id,
            front_text,
            front_media,
            created_at,
            card_slots (
                id,
                label,
                accepted_answers,
                match_type,
                order_index,
                advanced_rules,
                media
            ),
            user_items (
                due_date
            )
        `)
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false });

    return (
        <DeckDetailsClient 
            deck={deck} 
            cards={cards || []} 
            isOwner={isOwner}
        />
    );
}
