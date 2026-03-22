"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { VerbCard } from "@/components/ui/VerbCard";

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

export function VocabularioClient({ verbs }: { verbs: VerbRow[] }) {
    const [search, setSearch] = useState("");

    const filtered = search.trim()
        ? verbs.filter(v =>
            v.question.toLowerCase().includes(search.toLowerCase())
        )
        : verbs;

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="space-y-1">
                <h1 className="text-2xl font-black text-white px-2">Inventario</h1>
                <p className="text-sm text-text-dim px-2">Explora tus verbos y su estado SREM</p>
            </header>

            {/* Search */}
            <div className="sticky top-0 z-10 bg-void/80 backdrop-blur-lg py-2 px-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar verbo..."
                        className="w-full bg-stone-surface border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-focus transition-colors"
                    />
                </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="text-center text-text-dim py-12">
                    <p className="text-sm">
                        {search ? `No se encontró "${search}"` : "No se encontraron verbos."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 px-2">
                    {filtered.map(verb => (
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
