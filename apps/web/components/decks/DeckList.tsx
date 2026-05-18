"use client";
import { useState } from "react";
import { Search, Library, Users, Plus, LayoutGrid, FileJson, Globe } from "lucide-react";
import Link from "next/link";
import { ImportDeckDialog } from "./ImportDeckDialog";

interface Deck {
    id: string;
    title: string;
    description: string | null;
    author_id: string;
    created_at: string;
}

interface AssignedDeck {
    id: string;
    deck_id: string;
    classroom_id: string;
    assigned_by: string;
    assigned_at: string;
    decks: Deck; // Joined deck info
}

interface DeckListProps {
    personalDecks: Deck[];
    assignedDecks: AssignedDeck[];
    globalDecks?: Deck[];
}

export function DeckList({ personalDecks, assignedDecks, globalDecks = [] }: DeckListProps) {
    const [search, setSearch] = useState("");
    const [showImport, setShowImport] = useState(false);

    const filteredPersonal = personalDecks.filter(d => 
        d.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredAssigned = assignedDecks.filter(ad => 
        ad.decks.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredGlobal = globalDecks.filter(d => 
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-2xl font-black text-white">Mis Mazos</h1>
                    <p className="text-sm text-text-dim">Gestiona y estudia tus colecciones</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowImport(true)}
                        className="w-10 h-10 rounded-full bg-void border border-border-subtle text-text-dim flex items-center justify-center hover:text-white transition-colors"
                        title="Importar JSON"
                    >
                        <FileJson size={20} />
                    </button>
                    <Link 
                        href="/vocabulario/nuevo"
                        className="w-10 h-10 rounded-full bg-accent-focus text-white flex items-center justify-center hover:bg-accent-focus/90 transition-colors"
                    >
                        <Plus size={20} />
                    </Link>
                </div>
            </header>

            {/* Search */}
            <div className="sticky top-0 z-10 bg-void/80 backdrop-blur-lg py-2 px-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar mazo..."
                        className="w-full bg-stone-surface border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-focus transition-colors"
                    />
                </div>
            </div>

            <div className="px-2 space-y-8">
                {/* Global Decks */}
                {globalDecks.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h2 className="font-black text-white text-lg">Predeterminados</h2>
                                <p className="text-xs text-text-dim">Colecciones globales para todos</p>
                            </div>
                        </div>
                        {filteredGlobal.length === 0 ? (
                            <p className="text-sm text-text-dim/60">No hay coincidencias.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredGlobal.map(deck => (
                                    <DeckCard key={deck.id} deck={deck} isGlobal={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Assigned Decks */}
                {assignedDecks.length > 0 && (
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <h2 className="font-black text-white text-lg">De la clase</h2>
                                <p className="text-xs text-text-dim">Mazos asignados por tu profesor</p>
                            </div>
                        </div>
                        {filteredAssigned.length === 0 ? (
                            <p className="text-sm text-text-dim/60">No hay coincidencias.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredAssigned.map(ad => (
                                    <DeckCard key={ad.id} deck={ad.decks} isAssigned={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Personal Decks */}
                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3 border-b border-border-subtle pb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                            <Library size={20} />
                        </div>
                        <div>
                            <h2 className="font-black text-white text-lg">Personales</h2>
                            <p className="text-xs text-text-dim">Colecciones creadas o importadas por ti</p>
                        </div>
                    </div>
                    {filteredPersonal.length === 0 ? (
                        <p className="text-sm text-text-dim/60">No tienes mazos personales o no hay coincidencias.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredPersonal.map(deck => (
                                <DeckCard key={deck.id} deck={deck} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showImport && <ImportDeckDialog onClose={() => setShowImport(false)} />}
        </div>
    );
}

function DeckCard({ deck, isAssigned = false, isGlobal = false }: { deck: Deck, isAssigned?: boolean, isGlobal?: boolean }) {
    return (
        <Link 
            href={`/vocabulario/${deck.id}`}
            className="block bg-stone-surface border border-border-subtle rounded-2xl p-5 hover:border-accent-focus transition-all group shadow-sm hover:shadow-accent-focus/10 flex flex-col h-full"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-black text-lg text-white group-hover:text-accent-focus transition-colors line-clamp-2 leading-tight">
                    {deck.title}
                </h3>
                <div className={`p-2.5 rounded-xl shrink-0 ${isAssigned ? 'bg-emerald-500/10 text-emerald-400' : isGlobal ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isAssigned ? <Users size={18} /> : isGlobal ? <Globe size={18} /> : <Library size={18} />}
                </div>
            </div>
            {deck.description && (
                <p className="text-sm text-text-dim line-clamp-2 mb-6 leading-relaxed">
                    {deck.description}
                </p>
            )}
            <div className="flex items-center justify-end mt-auto pt-4 border-t border-border-subtle/50">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent-focus/80 group-hover:text-accent-focus transition-colors">
                    Ver detalles <LayoutGrid size={14} />
                </span>
            </div>
        </Link>
    );
}
