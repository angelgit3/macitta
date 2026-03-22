import { createClient } from "@/utils/supabase/server";
import { VocabularioClient } from "./VocabularioClient";

// Force dynamic rendering — this page depends on user auth context
export const dynamic = 'force-dynamic';

export default async function VocabularioPage() {
    const supabase = await createClient();

    const { data: verbs } = await supabase
        .from('cards')
        .select(`
            id,
            question,
            user_items (
                state,
                stability,
                difficulty,
                due_date
            )
        `)
        .order('question', { ascending: true });

    return <VocabularioClient verbs={verbs || []} />;
}
