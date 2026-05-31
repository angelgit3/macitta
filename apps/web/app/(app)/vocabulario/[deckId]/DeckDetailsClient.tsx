"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, Search, ArrowUpDown, Calendar } from "lucide-react";
import Link from "next/link";
import { DeleteDeckModal } from "@/components/decks/DeleteDeckModal";

import { CardFormModal } from "@/components/decks/CardFormModal";
import type { Deck, Card } from "@/types/models";

interface Props {
    deck: Deck;
    cards: Card[];
    isOwner: boolean;
}

import { useDeckDetails } from "@/hooks/useDeckDetails";

export function DeckDetailsClient({ deck, cards, isOwner }: Props) {
    const { state, actions, router } = useDeckDetails();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"default" | "alpha">("default");

    const processedCards = useMemo(() => {
        let result = [...cards];
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c => c.front_text.toLowerCase().includes(query));
        }

        if (sortOrder === "alpha") {
            result.sort((a, b) => a.front_text.localeCompare(b.front_text));
        }

        return result;
    }, [cards, searchQuery, sortOrder]);

    const formatNextReview = (dateStr?: string) => {
        if (!dateStr) return "Nueva tarjeta";
        const date = new Date(dateStr);
        const now = new Date();
        if (date <= now) return "Programada para repasar ahora";
        return `Próximo repaso: ${date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`;
    };

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="px-2 space-y-4">
                <Link href="/vocabulario" className="inline-flex items-center gap-1 text-sm text-text-dim hover:text-ink transition-colors">
                    <ArrowLeft size={16} /> Volver a Mazos
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-ink">{deck.title}</h1>
                        {deck.description && <p className="text-sm text-text-dim mt-1">{deck.description}</p>}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs font-bold text-text-dim bg-void/50 px-2 py-1 rounded-lg border border-border-subtle">
                                {cards.length} Tarjetas
                            </span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => actions.setShowDeleteDeck(true)}
                                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <Link
                        href={`/estudio/${deck.id}`}
                        className="flex-1 py-4 bg-brand-primary hover:bg-stone-light text-paper border border-paper-soft/25 font-black rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-black/25 text-lg"
                    >
                        Estudiar Mazo
                    </Link>
                    {isOwner && (
                        <button
                            onClick={() => actions.setShowAddCard(true)}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary hover:bg-stone-light text-paper border border-paper-soft/25 font-bold rounded-2xl transition-all shadow-lg shadow-black/25"
                        >
                            <Plus size={20} strokeWidth={3} />
                            <span className="hidden sm:inline">Nueva Tarjeta</span>
                        </button>
                    )}
                </div>
            </header>

            {cards.length > 0 && (
                <div className="px-2 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar tarjeta..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-stone-surface border border-border-subtle rounded-xl text-ink placeholder:text-text-dim/60 focus:outline-none focus:border-accent-focus/50 transition-colors"
                        />
                    </div>
                    <div className="relative shrink-0">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "default" | "alpha")}
                            className="w-full sm:w-auto appearance-none pl-10 pr-10 py-3 bg-stone-surface border border-border-subtle rounded-xl text-ink focus:outline-none focus:border-accent-focus/50 transition-colors"
                        >
                            <option value="default">Por defecto</option>
                            <option value="alpha">A-Z (Alfabético)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim"/>
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-2 space-y-3">
                {cards.length === 0 ? (
                    <div className="text-center py-16 bg-stone-surface rounded-3xl border border-border-subtle border-dashed">
                        <div className="w-16 h-16 bg-void/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle/50">
                            <Plus size={24} className="text-text-dim" />
                        </div>
                        <h3 className="text-lg font-bold text-ink mb-2">Mazo vacío</h3>
                        <p className="text-sm text-text-dim mb-6 max-w-sm mx-auto">No hay tarjetas en este mazo todavía. Comienza a agregar contenido para estudiar.</p>
                        {isOwner && (
                            <button 
                                onClick={() => actions.setShowAddCard(true)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-paper border border-paper-soft/25 font-bold rounded-2xl hover:bg-stone-light transition-all shadow-lg shadow-black/25"
                            >
                                <Plus size={18} strokeWidth={3} />
                                Agrega la primera tarjeta
                            </button>
                        )}
                    </div>
                ) : processedCards.length === 0 ? (
                    <div className="text-center py-12 bg-stone-surface rounded-3xl border border-border-subtle border-dashed">
                        <Search size={24} className="text-text-dim mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-ink mb-2">Sin resultados</h3>
                        <p className="text-sm text-text-dim">No se encontraron tarjetas que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {processedCards.map(card => (
                            <div key={card.id} className="bg-stone-surface border border-border-subtle rounded-2xl p-5 flex flex-col justify-between group hover:border-accent-focus/50 transition-all">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h3 className="font-black text-lg text-ink leading-tight break-words">{card.front_text}</h3>
                                    {isOwner && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={() => actions.setEditingCard(card)}
                                                className="text-text-dim/40 hover:text-accent-focus hover:bg-accent-focus/10 rounded-xl p-2 transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => actions.handleDeleteCard(card.id)}
                                                disabled={state.deletingCardId === card.id}
                                                className="text-text-dim/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl p-2 transition-all"
                                            >
                                                {state.deletingCardId === card.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {card.card_slots.map(slot => (
                                        <div key={slot.id} className="flex flex-col gap-1 p-3 bg-void/50 rounded-xl border border-border-subtle/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim/80">{slot.label}</span>
                                            <span className="text-sm font-medium text-accent-success/90">{slot.accepted_answers.join(' • ')}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center gap-1.5 text-[11px] font-medium text-text-dim/60">
                                    <Calendar size={12} className="shrink-0" />
                                    <span>{formatNextReview(card.user_items?.[0]?.due_date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {state.showDeleteDeck && (
                <DeleteDeckModal 
                    deckId={deck.id}
                    deckTitle={deck.title}
                    onClose={() => actions.setShowDeleteDeck(false)}
                />
            )}

            {(state.showAddCard || state.editingCard) && (
                <CardFormModal 
                    deck={deck} 
                    card={state.editingCard || undefined}
                    onClose={() => { actions.setShowAddCard(false); actions.setEditingCard(null); }} 
                    onSuccess={() => { actions.setShowAddCard(false); actions.setEditingCard(null); router.refresh(); }} 
                />
            )}
        </div>
    );
}
