"use client";
import { useState } from "react";
import { Search, Library, Plus, LayoutGrid, FileJson, Globe, Boxes } from "lucide-react";
import Link from "next/link";
import { ImportDeckDialog } from "./ImportDeckDialog";
import type { Deck } from "@/types/models";
import type { ReactNode } from "react";

interface DeckListProps {
    personalDecks: Deck[];
    globalDecks?: Deck[];
}

export function DeckList({ personalDecks, globalDecks = [] }: DeckListProps) {
    const [search, setSearch] = useState("");
    const [showImport, setShowImport] = useState(false);

    const filteredPersonal = personalDecks.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredGlobal = globalDecks.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="surface-panel rounded-xl p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-focus/10 text-accent-focus border border-accent-focus/20 text-xs font-bold mb-4">
                            <Boxes size={14} />
                            Biblioteca
                        </div>
                        <h1 className="text-3xl font-black text-ink">Mis mazos</h1>
                        <p className="readable-copy mt-2">Gestiona tus colecciones, importa material y entra al detalle de cada tarjeta.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="min-h-11 min-w-11 rounded-lg surface-card text-text-dim flex items-center justify-center hover:text-ink transition-colors"
                            title="Importar JSON"
                            aria-label="Importar JSON"
                        >
                            <FileJson size={20} />
                        </button>
                        <Link
                            href="/vocabulario/nuevo"
                            className="min-h-11 px-4 rounded-lg bg-brand-primary text-paper border border-paper-soft/25 font-black flex items-center justify-center gap-2 hover:bg-stone-light transition-colors"
                        >
                            <Plus size={20} />
                            <span>Nuevo</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="sticky top-0 z-10 bg-void/80 backdrop-blur-lg py-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar mazo..."
                        className="w-full soft-field rounded-lg py-3 pl-12 pr-4 focus:border-accent-focus"
                    />
                </div>
            </div>

            <div className="space-y-8">
                {globalDecks.length > 0 && (
                    <DeckSection
                        icon={<Globe size={20} />}
                        title="Predeterminados"
                        description="Colecciones globales listas para estudiar"
                        emptyMessage="No hay coincidencias."
                        decks={filteredGlobal}
                        isGlobal
                    />
                )}

                <DeckSection
                    icon={<Library size={20} />}
                    title="Personales"
                    description="Colecciones creadas o importadas por ti"
                    emptyMessage="No tienes mazos personales o no hay coincidencias."
                    decks={filteredPersonal}
                />
            </div>

            {showImport && <ImportDeckDialog onClose={() => setShowImport(false)} />}
        </div>
    );
}

function DeckSection({
    icon,
    title,
    description,
    emptyMessage,
    decks,
    isGlobal = false,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    emptyMessage: string;
    decks: Deck[];
    isGlobal?: boolean;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
                <div className={`p-2.5 rounded-lg ${isGlobal ? "bg-accent-strong/10 text-accent-strong" : "bg-accent-focus/10 text-accent-focus"}`}>
                    {icon}
                </div>
                <div>
                    <h2 className="font-black text-ink text-lg">{title}</h2>
                    <p className="text-xs text-text-dim">{description}</p>
                </div>
            </div>
            {decks.length === 0 ? (
                <p className="surface-card rounded-lg p-5 text-sm text-text-dim">{emptyMessage}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {decks.map(deck => (
                        <DeckCard key={deck.id} deck={deck} isGlobal={isGlobal} />
                    ))}
                </div>
            )}
        </section>
    );
}

function DeckCard({ deck, isGlobal = false }: { deck: Deck, isGlobal?: boolean }) {
    return (
        <Link
            href={`/vocabulario/${deck.id}`}
            className="surface-card rounded-lg p-5 hover:border-accent-focus transition-all group flex flex-col h-full"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-black text-lg text-ink group-hover:text-accent-focus transition-colors line-clamp-2 leading-tight">
                    {deck.title}
                </h3>
                <div className={`p-2.5 rounded-lg shrink-0 ${isGlobal ? 'bg-accent-strong/10 text-accent-strong' : 'bg-accent-focus/10 text-accent-focus'}`}>
                    {isGlobal ? <Globe size={18} /> : <Library size={18} />}
                </div>
            </div>
            {deck.description && (
                <p className="text-sm text-text-dim line-clamp-3 mb-6 leading-relaxed">
                    {deck.description}
                </p>
            )}
            <div className="flex items-center justify-end mt-auto pt-4 border-t border-border-subtle/50">
                <span className="flex items-center gap-1 text-xs font-bold uppercase text-accent-focus/85 group-hover:text-accent-focus transition-colors">
                    Ver detalles <LayoutGrid size={14} />
                </span>
            </div>
        </Link>
    );
}
