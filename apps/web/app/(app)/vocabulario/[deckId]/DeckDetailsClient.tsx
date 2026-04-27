"use client";

import { useState } from "react";
import { ArrowLeft, MoreVertical, Plus, Edit2, Trash2, Users, Loader2, X, HelpCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssignToClassroomDialog } from "@/components/decks/AssignToClassroomDialog";
import { DeleteDeckModal } from "@/components/decks/DeleteDeckModal";
import { deleteCard, createCard, editCard } from "@/app/actions/cards";
import { AnswerSlotEditor } from "@/components/builder/AnswerSlotEditor";

interface Slot {
    id: string;
    label: string;
    accepted_answers: string[];
    match_type?: string;
    advanced_rules?: any;
    media?: string;
}

interface Card {
    id: string;
    front_text: string;
    front_media?: string | null;
    created_at: string;
    card_slots: Slot[];
}

interface Deck {
    id: string;
    title: string;
    description: string | null;
    author_id: string;
    answer_labels?: string[];
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
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    async function handleDeleteCard(cardId: string) {
        if (!confirm("¿Eliminar esta tarjeta de forma permanente?")) return;
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

                <div className="pt-4 flex items-center gap-3">
                    <Link
                        href={`/estudio/${deck.id}`}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 text-lg"
                    >
                        Estudiar Mazo
                    </Link>
                    {isOwner && (
                        <button
                            onClick={() => setShowAddCard(true)}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-accent-focus hover:bg-accent-focus/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-accent-focus/20"
                        >
                            <Plus size={20} strokeWidth={3} />
                            <span className="hidden sm:inline">Nueva Tarjeta</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="px-2 space-y-3">
                {cards.length === 0 ? (
                    <div className="text-center py-16 bg-stone-surface rounded-3xl border border-border-subtle border-dashed">
                        <div className="w-16 h-16 bg-void/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle/50">
                            <Plus size={24} className="text-text-dim" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Mazo vacío</h3>
                        <p className="text-sm text-text-dim mb-6 max-w-sm mx-auto">No hay tarjetas en este mazo todavía. Comienza a agregar contenido para estudiar.</p>
                        {isOwner && (
                            <button 
                                onClick={() => setShowAddCard(true)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-focus text-white font-bold rounded-2xl hover:bg-accent-focus/90 transition-all shadow-lg shadow-accent-focus/20"
                            >
                                <Plus size={18} strokeWidth={3} />
                                Agrega la primera tarjeta
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cards.map(card => (
                            <div key={card.id} className="bg-stone-surface border border-border-subtle rounded-2xl p-5 flex flex-col justify-between group hover:border-accent-focus/50 transition-all">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h3 className="font-black text-lg text-white leading-tight break-words">{card.front_text}</h3>
                                    {isOwner && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={() => setEditingCard(card)}
                                                className="text-text-dim/40 hover:text-accent-focus hover:bg-accent-focus/10 rounded-xl p-2 transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCard(card.id)}
                                                disabled={deletingCardId === card.id}
                                                className="text-text-dim/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl p-2 transition-all"
                                            >
                                                {deletingCardId === card.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {card.card_slots.map(slot => (
                                        <div key={slot.id} className="flex flex-col gap-1 p-3 bg-void/50 rounded-xl border border-border-subtle/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim/80">{slot.label}</span>
                                            <span className="text-sm font-medium text-emerald-400/90">{slot.accepted_answers.join(' • ')}</span>
                                        </div>
                                    ))}
                                </div>
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

            {(showAddCard || editingCard) && (
                <CardFormModal 
                    deck={deck} 
                    card={editingCard || undefined}
                    onClose={() => { setShowAddCard(false); setEditingCard(null); }} 
                    onSuccess={() => { setShowAddCard(false); setEditingCard(null); router.refresh(); }} 
                />
            )}
        </div>
    );
}

function dbSlotToBuilderSlot(dbSlot: any, label: string) {
    if (!dbSlot) return { field: label, text: "" };

    let textPayload: any = "";
    if (dbSlot.advanced_rules) {
        textPayload = dbSlot.advanced_rules;
    } else if (dbSlot.accepted_answers && dbSlot.accepted_answers.length > 0) {
        if (dbSlot.match_type === 'exact' && dbSlot.accepted_answers.length === 1) {
            textPayload = dbSlot.accepted_answers[0];
        } else {
            textPayload = dbSlot.accepted_answers;
        }
    }

    return {
        field: label,
        text: textPayload,
        media: dbSlot.media
    };
}

function CardFormModal({ deck, card, onClose, onSuccess }: { deck: Deck; card?: Card; onClose: () => void; onSuccess: () => void }) {
    const [frontText, setFrontText] = useState(card?.front_text || "");
    const [frontMedia, setFrontMedia] = useState(card?.front_media || "");
    const [saving, setSaving] = useState(false);
    const [showFrontMedia, setShowFrontMedia] = useState(!!card?.front_media);

    // Determine the labels we should ask for.
    const labelsToAsk = (deck.answer_labels && deck.answer_labels.length > 0) 
        ? deck.answer_labels 
        : (card ? card.card_slots.map(s => s.label) : ["Respuesta"]);

    // State for full slot objects instead of just strings
    const [slots, setSlots] = useState<any[]>(() => {
        return labelsToAsk.map(label => {
            const dbSlot = card?.card_slots.find(s => s.label === label);
            return dbSlotToBuilderSlot(dbSlot, label);
        });
    });

    const handleSlotChange = (index: number, updatedSlot: any) => {
        const next = [...slots];
        next[index] = updatedSlot;
        setSlots(next);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!frontText.trim()) return;

        setSaving(true);
        try {
            if (card) {
                await editCard(card.id, frontText, slots, frontMedia);
            } else {
                await createCard(deck.id, frontText, slots, frontMedia);
            }
            onSuccess();
        } catch (e: any) {
            alert(e.message || "Error al guardar tarjeta");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl my-auto">
                <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-void/50 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Edit2 size={20} className="text-accent-focus" />
                        <h2 className="text-xl font-black text-white">{card ? "Editar Tarjeta" : "Nueva Tarjeta"}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 bg-stone-surface border border-border-subtle rounded-xl text-text-dim hover:text-white hover:border-accent-focus transition-all">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-void flex flex-col gap-6">
                    {/* Front Question Section */}
                    <div className="bg-stone-surface/30 backdrop-blur-sm rounded-2xl border border-border-subtle p-5 space-y-4 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-focus"></div>
                        
                        <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-3">
                            <HelpCircle size={18} className="text-accent-focus" />
                            <h2 className="text-lg font-bold text-white tracking-wide">Pregunta (Frente)</h2>
                        </div>
                        
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={frontText}
                                onChange={e => setFrontText(e.target.value)}
                                className="w-full px-4 py-3 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-xl transition-all shadow-inner font-medium text-lg placeholder:font-normal"
                                placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
                                autoFocus
                            />
                        </div>

                        {!showFrontMedia && !frontMedia ? (
                            <button 
                                onClick={() => setShowFrontMedia(true)}
                                className="text-xs font-bold text-text-dim hover:text-accent-focus flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                            >
                                <ImageIcon size={14} /> Añadir Imagen o Audio
                            </button>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Multimedia Frontal</label>
                                <input
                                    type="text"
                                    value={frontMedia}
                                    onChange={e => setFrontMedia(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-xl transition-all shadow-inner text-sm"
                                    placeholder="URL de Imagen o Audio (Ej: https://...)"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answers Section */}
                    <div className="space-y-4 relative">
                        <div className="flex items-center gap-2 px-1">
                            <CheckCircle2 size={20} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                            <h2 className="text-lg font-bold text-white tracking-wide">Respuestas a Evaluar</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {labelsToAsk.map((label, idx) => (
                                <AnswerSlotEditor 
                                    key={label}
                                    label={label}
                                    slot={slots[idx]}
                                    onChangeSlot={(updatedSlot) => handleSlotChange(idx, updatedSlot)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end sticky bottom-0 z-10 bg-void/80 backdrop-blur-md pb-2">
                        <button 
                            onClick={handleSave}
                            disabled={saving || !frontText} 
                            className="flex items-center gap-2 px-8 py-3.5 bg-accent-focus text-white font-bold rounded-2xl disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-accent-focus/90"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {saving ? "Guardando..." : "Guardar Tarjeta"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
