"use client";

import { useState } from "react";
import { ArrowLeft, MoreVertical, Plus, Edit2, Trash2, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssignToClassroomDialog } from "@/components/decks/AssignToClassroomDialog";
import { DeleteDeckModal } from "@/components/decks/DeleteDeckModal";
import { deleteCard, createCard } from "@/app/actions/cards";

interface Slot {
    id: string;
    label: string;
    accepted_answers: string[];
}

interface Card {
    id: string;
    front_text: string;
    created_at: string;
    card_slots: Slot[];
}

interface Deck {
    id: string;
    title: string;
    description: string | null;
    author_id: string;
}

interface Classroom {
    id: string;
    name: string;
    join_code: string;
}

interface Props {
    deck: Deck;
    cards: Card[];
    isOwner: boolean;
    isTeacher: boolean;
    classrooms: Classroom[];
    assignedClassroomIds: string[];
}

export function DeckDetailsClient({ deck, cards, isOwner, isTeacher, classrooms, assignedClassroomIds }: Props) {
    const router = useRouter();
    const [showAssign, setShowAssign] = useState(false);
    const [showDeleteDeck, setShowDeleteDeck] = useState(false);
    const [showAddCard, setShowAddCard] = useState(false);
    const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

    async function handleDeleteCard(cardId: string) {
        if (!confirm("Eliminar esta tarjeta de forma permanente?")) return;
        setDeletingCardId(cardId);
        try {
            await deleteCard(cardId);
            router.refresh();
        } catch (e) {
            alert("Error al eliminar la tarjeta");
        } finally {
            setDeletingCardId(null);
        }
    }

    return (
        <div className="flex flex-col gap-6 pb-24">
            <header className="px-2 space-y-4">
                <Link href="/vocabulario" className="inline-flex items-center gap-1 text-sm text-text-dim hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Volver a Mazos
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white">{deck.title}</h1>
                        {deck.description && <p className="text-sm text-text-dim mt-1">{deck.description}</p>}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs font-bold text-text-dim bg-void/50 px-2 py-1 rounded-lg border border-border-subtle">
                                {cards.length} Tarjetas
                            </span>
                            {isOwner && isTeacher && assignedClassroomIds.length > 0 && (
                                <span className="text-xs font-bold text-accent-focus bg-accent-focus/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Users size={12} /> Asignado a {assignedClassroomIds.length} clases
                                </span>
                            )}
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-2">
                            {isTeacher && (
                                <button 
                                    onClick={() => setShowAssign(true)}
                                    className="p-2 rounded-xl bg-stone-surface border border-border-subtle text-text-dim hover:text-white transition-colors"
                                >
                                    <Users size={18} />
                                </button>
                            )}
                            <button 
                                onClick={() => setShowDeleteDeck(true)}
                                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                    <Link
                        href={`/estudio/${deck.id}`}
                        className="flex-1 py-3.5 bg-accent-focus text-white font-bold rounded-2xl flex items-center justify-center hover:bg-accent-focus/90 transition-colors"
                    >
                        Estudiar Mazo
                    </Link>
                    {isOwner && (
                        <button
                            onClick={() => setShowAddCard(true)}
                            className="w-14 h-14 bg-stone-surface border border-border-subtle rounded-2xl flex items-center justify-center text-white hover:border-accent-focus transition-colors"
                        >
                            <Plus size={24} />
                        </button>
                    )}
                </div>
            </header>

            <div className="px-2 space-y-3">
                {cards.length === 0 ? (
                    <div className="text-center text-text-dim py-12 bg-stone-surface rounded-3xl border border-border-subtle">
                        <p className="text-sm">No hay tarjetas en este mazo.</p>
                        {isOwner && (
                            <button 
                                onClick={() => setShowAddCard(true)}
                                className="text-accent-focus text-sm font-bold mt-2 hover:underline"
                            >
                                Agrega la primera tarjeta
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {cards.map(card => (
                            <div key={card.id} className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex items-start justify-between group">
                                <div>
                                    <h3 className="font-bold text-white">{card.front_text}</h3>
                                    <div className="mt-2 space-y-1">
                                        {card.card_slots.map(slot => (
                                            <p key={slot.id} className="text-xs text-text-dim">
                                                <span className="opacity-60">{slot.label}:</span>{' '}
                                                <span className="text-emerald-400/80">{slot.accepted_answers.join(', ')}</span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                {isOwner && (
                                    <button 
                                        onClick={() => handleDeleteCard(card.id)}
                                        disabled={deletingCardId === card.id}
                                        className="text-text-dim/50 hover:text-red-400 transition-colors p-2"
                                    >
                                        {deletingCardId === card.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAssign && (
                <AssignToClassroomDialog 
                    deckId={deck.id}
                    classrooms={classrooms}
                    assignedClassroomIds={assignedClassroomIds}
                    onClose={() => setShowAssign(false)}
                />
            )}

            {showDeleteDeck && (
                <DeleteDeckModal 
                    deckId={deck.id}
                    deckTitle={deck.title}
                    onClose={() => setShowDeleteDeck(false)}
                />
            )}

            {showAddCard && (
                <AddCardModal 
                    deckId={deck.id} 
                    onClose={() => setShowAddCard(false)} 
                    onSuccess={() => { setShowAddCard(false); router.refresh(); }} 
                />
            )}
        </div>
    );
}

function AddCardModal({ deckId, onClose, onSuccess }: { deckId: string; onClose: () => void; onSuccess: () => void }) {
    const [frontText, setFrontText] = useState("");
    const [label, setLabel] = useState("");
    const [answer, setAnswer] = useState("");
    const [saving, setSaving] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!frontText.trim() || !label.trim() || !answer.trim()) return;

        setSaving(true);
        try {
            await createCard(deckId, frontText, [
                { label, accepted_answers: [answer] }
            ]);
            onSuccess();
        } catch (e) {
            alert("Error al agregar tarjeta");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                    <h2 className="text-xl font-black text-white">Nueva Tarjeta</h2>
                    <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
                        <Trash2 size={20} className="hidden" /> {/* Just for spacing consistency? No, X icon */}
                        <span className="text-xl leading-none"></span>
                    </button>
                </div>
                <form onSubmit={handleAdd} className="p-5 space-y-4">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Frente / Término</label>
                        <input type="text" value={frontText} onChange={e => setFrontText(e.target.value)} placeholder="Ej: To eat" className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus text-sm mt-1" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Etiqueta</label>
                            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ej: Español" className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus text-sm mt-1" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Respuesta</label>
                            <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Ej: Comer" className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus text-sm mt-1" />
                        </div>
                    </div>
                    <button type="submit" disabled={saving || !frontText || !answer || !label} className="w-full py-3.5 bg-accent-focus text-white font-bold rounded-2xl disabled:opacity-50 mt-2">
                        {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Agregar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
