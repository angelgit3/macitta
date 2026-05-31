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

/**
 * DeckList — displays personal and global deck collections.
 * Includes a sticky search bar and import/create actions.
 */
export function DeckList({ personalDecks, globalDecks = [] }: DeckListProps) {
    const [search,     setSearch]     = useState("");
    const [showImport, setShowImport] = useState(false);

    const q = search.toLowerCase();
    const filteredPersonal = personalDecks.filter(d => d.title.toLowerCase().includes(q));
    const filteredGlobal   = globalDecks.filter(d => d.title.toLowerCase().includes(q));

    return (
        <div className="flex flex-col gap-6 pb-24">

            {/* ── Hero ──────────────────────────────────────── */}
            <header className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                    <div>
                        <span className="pill-badge bg-accent/10 text-accent border border-accent/20 mb-4">
                            <Boxes size={11} /> Biblioteca
                        </span>
                        <h1 className="text-3xl font-black text-ink">Mis mazos</h1>
                        <p className="readable-copy mt-2">
                            Gestiona tus colecciones, importa material y entra al detalle de cada tarjeta.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="min-h-11 min-w-11 rounded-xl glass-card text-ink-faint flex items-center justify-center hover:text-ink transition-colors"
                            title="Importar JSON"
                            aria-label="Importar JSON"
                        >
                            <FileJson size={20} />
                        </button>
                        <Link
                            href="/vocabulario/nuevo"
                            className="min-h-11 px-4 rounded-xl bg-accent text-void border border-accent/20
                                       font-black flex items-center justify-center gap-2
                                       shadow-[0_4px_14px_rgba(124,133,232,0.28)]
                                       hover:bg-accent-hover transition-all"
                        >
                            <Plus size={20} /> Nuevo
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Sticky search ─────────────────────────────── */}
            <div className="sticky top-0 z-10 bg-void/80 backdrop-blur-lg py-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar mazo..."
                        className="w-full soft-field rounded-xl py-3 pl-12 pr-4"
                    />
                </div>
            </div>

            {/* ── Deck sections ─────────────────────────────── */}
            <div className="space-y-8">
                {globalDecks.length > 0 && (
                    <DeckSection
                        icon={<Globe size={20} />}
                        title="Predeterminados"
                        description="Colecciones globales listas para estudiar"
                        emptyMessage="No hay coincidencias."
                        decks={filteredGlobal}
                        variant="global"
                    />
                )}
                <DeckSection
                    icon={<Library size={20} />}
                    title="Personales"
                    description="Colecciones creadas o importadas por ti"
                    emptyMessage="No tienes mazos personales o no hay coincidencias."
                    decks={filteredPersonal}
                    variant="personal"
                />
            </div>

            {showImport && <ImportDeckDialog onClose={() => setShowImport(false)} />}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────

type DeckVariant = "global" | "personal";

interface DeckSectionProps {
    icon: ReactNode;
    title: string;
    description: string;
    emptyMessage: string;
    decks: Deck[];
    variant?: DeckVariant;
}

function DeckSection({
    icon, title, description, emptyMessage, decks, variant = "personal",
}: DeckSectionProps) {
    const iconColor = variant === "global"
        ? "bg-amber/10 text-amber"
        : "bg-accent/10 text-accent";

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className={`p-2.5 rounded-xl ${iconColor}`}>{icon}</div>
                <div>
                    <h2 className="font-black text-ink text-lg">{title}</h2>
                    <p className="text-xs text-ink-faint">{description}</p>
                </div>
            </div>
            {decks.length === 0
                ? <p className="glass-card rounded-xl p-5 text-sm text-ink-faint">{emptyMessage}</p>
                : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {decks.map(deck => (
                            <DeckCard key={deck.id} deck={deck} variant={variant} />
                        ))}
                    </div>
                )
            }
        </section>
    );
}

function DeckCard({ deck, variant = "personal" }: { deck: Deck; variant?: DeckVariant }) {
    const isGlobal   = variant === "global";
    const iconColor  = isGlobal ? "bg-amber/10 text-amber" : "bg-accent/10 text-accent";
    const hoverColor = isGlobal ? "hover:text-amber" : "hover:text-accent";
    const footerColor = isGlobal ? "text-amber/85 group-hover:text-amber" : "text-accent/85 group-hover:text-accent";

    return (
        <Link
            href={`/vocabulario/${deck.id}`}
            className="glass-card rounded-2xl p-5 hover:border-accent/35 transition-all group flex flex-col h-full"
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className={`font-black text-lg text-ink ${hoverColor} transition-colors line-clamp-2 leading-tight`}>
                    {deck.title}
                </h3>
                <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
                    {isGlobal ? <Globe size={18} /> : <Library size={18} />}
                </div>
            </div>
            {deck.description && (
                <p className="text-sm text-ink-faint line-clamp-3 mb-6 leading-relaxed">
                    {deck.description}
                </p>
            )}
            <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/50">
                <span className={`flex items-center gap-1 text-xs font-bold uppercase ${footerColor} transition-colors`}>
                    Ver detalles <LayoutGrid size={14} />
                </span>
            </div>
        </Link>
    );
}
