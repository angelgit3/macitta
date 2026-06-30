import { createClient } from "@/utils/supabase/server";
import { DeckList } from "@/components/decks/DeckList";
import type { Deck } from "@/types/models";

export const dynamic = 'force-dynamic';

export default async function DecksDashboardPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('decks')
        .select('id, title, description, author_id, created_at, answer_labels, question_labels, color')
        .order('created_at', { ascending: false });

    // RLS exposes only global decks and decks owned by the signed-in user.
    // Split one response instead of paying for an auth lookup plus two queries.
    const visibleDecks = (data ?? []) as Deck[];
    const personalDecks = visibleDecks.filter((deck) => deck.author_id !== null);
    const globalDecks = visibleDecks.filter((deck) => deck.author_id === null);

    return (
        <DeckList 
            personalDecks={personalDecks || []} 
            globalDecks={globalDecks || []}
        />
    );
}
