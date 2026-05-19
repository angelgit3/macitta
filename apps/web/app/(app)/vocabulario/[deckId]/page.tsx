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

    // Is the user a teacher?
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    const isTeacher = profile?.role === 'teacher';

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

    // Fetch classrooms the user teaches, if teacher and owner
    let classrooms: any[] = [];
    let assignedClassroomIds: string[] = [];
    if (isOwner && isTeacher) {
        const { data: clsData } = await supabase
            .from('classrooms')
            .select('id, name, join_code')
            .eq('teacher_id', user.id);
        
        if (clsData) classrooms = clsData;

        // Fetch assigned classrooms for this deck
        const { data: assignments } = await supabase
            .from('classroom_decks')
            .select('classroom_id')
            .eq('deck_id', deckId);
        
        if (assignments) {
            assignedClassroomIds = assignments.map(a => a.classroom_id);
        }
    }

    return (
        <DeckDetailsClient 
            deck={deck} 
            cards={cards || []} 
            isOwner={isOwner}
            isTeacher={isTeacher}
            classrooms={classrooms}
            assignedClassroomIds={assignedClassroomIds}
        />
    );
}
