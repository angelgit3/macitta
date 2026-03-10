import { createClient } from "@/utils/supabase/server";
import { Search } from "lucide-react";
import { VerbCard } from "@/components/ui/VerbCard";

// Force dynamic rendering — this page depends on user auth context
export const dynamic = 'force-dynamic';

// ─── Types ──────────────────────────────────────────────────────────

interface VerbRow {
    id: string;
    question: string;
    user_items: {
        state: string;
        stability: number;
        difficulty: number;
        due_date: string;
    }[];
}

// ─── Page ───────────────────────────────────────────────────────────

export default async function VocabularioPage() {
    const supabase = await createClient();

    // First, get cards (public table — always accessible)
    const { data: verbs, error } = await supabase
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

    if (error) {
        console.error("[Vocabulario] Error fetching cards:", error);
    }

    const typedVerbs = (verbs || []) as VerbRow[];

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="space-y-1">
                <h1 className="text-2xl font-black text-white px-2">Inventario</h1>
                <p className="text-sm text-zinc-500 px-2">Explora tus verbos y su estado SREM</p>
            </header>

            {/* Sticky Search (placeholder — needs client component for interactivity) */}
            <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-lg py-2 px-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar verbo..."
                        className="w-full bg-stone-surface border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-focus transition-colors"
                    />
                </div>
            </div>

            {/* Verb List */}
            {typedVerbs.length === 0 ? (
                <div className="text-center text-zinc-500 py-12">
                    <p className="text-sm">No se encontraron verbos.</p>
                    {error && <p className="text-xs text-red-400 mt-2">Error: {error.message}</p>}
                </div>
            ) : (
                <div className="grid gap-3 px-2">
                    {typedVerbs.map(verb => (
                        <VerbCard
                            key={verb.id}
                            id={verb.id}
                            question={verb.question}
                            userItem={verb.user_items?.[0] ?? null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
