import { createClient } from "@/utils/supabase/server";
import { DeckList } from "@/components/decks/DeckList";

export const dynamic = 'force-dynamic';

export default async function DecksDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    // Fetch personal decks (where user is author)
    const { data: personalDecks } = await supabase
        .from('decks')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch global decks (where author_id is null)
    const { data: globalDecks } = await supabase
        .from('decks')
        .select('*')
        .is('author_id', null)
        .order('created_at', { ascending: false });

    return (
        <DeckList 
            personalDecks={personalDecks || []} 
            globalDecks={globalDecks || []}
        />
    );
}
