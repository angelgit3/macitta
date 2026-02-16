import { createClient } from "@/utils/supabase/server";
import { Search, Brain, Clock, CheckCircle2 } from "lucide-react";

export default async function VocabularioPage() {
    const supabase = await createClient();

    // Fetch all verbs with their SRS status
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

    const getStatusColor = (state: string | undefined) => {
        switch (state) {
            case 'review': return 'text-green-400 bg-green-400/10';
            case 'learning': return 'text-blue-400 bg-blue-400/10';
            case 'relearning': return 'text-orange-400 bg-orange-400/10';
            default: return 'text-zinc-500 bg-zinc-500/10';
        }
    };

    const getStatusIcon = (state: string | undefined) => {
        switch (state) {
            case 'review': return <CheckCircle2 size={12} />;
            case 'learning': return <Brain size={12} />;
            case 'relearning': return <Clock size={12} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="space-y-1">
                <h1 className="text-2xl font-black text-white px-2">Inventario</h1>
                <p className="text-sm text-zinc-500 px-2">Explora tus verbos e inteligencia FSRS</p>
            </header>

            {/* Sticky Search (Fake for now, logic can be added with a Client component later) */}
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
            <div className="grid gap-3 px-2">
                {verbs?.map((verb: any) => {
                    const status = verb.user_items?.[0]?.state || 'new';
                    return (
                        <div key={verb.id} className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-colors">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-lg font-bold text-white capitalize">{verb.question}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(status)}`}>
                                        {getStatusIcon(status)}
                                        {status === 'new' ? 'Nuevo' : status === 'review' ? 'Dominado' : 'Aprendiendo'}
                                    </span>
                                    {verb.user_items?.[0]?.difficulty && (
                                        <span className="text-[10px] text-zinc-600 font-medium">Dif: {Math.round(verb.user_items[0].difficulty * 10) / 10}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">Próximo repaso</span>
                                <span className="text-xs font-bold text-zinc-300">
                                    {verb.user_items?.[0]?.due_date
                                        ? new Date(verb.user_items[0].due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                        : '--'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
