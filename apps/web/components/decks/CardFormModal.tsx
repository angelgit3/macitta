"use client";

import { useState } from "react";
import { Edit2, X, HelpCircle, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { createCard, editCard } from "@/app/actions/cards";
import { AnswerSlotEditor } from "@/components/builder/AnswerSlotEditor";
import { ZenInput } from "@/components/ui/ZenInput";
import { ZenButton } from "@/components/ui/ZenButton";

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

interface CardFormModalProps {
    deck: Deck;
    card?: Card;
    onClose: () => void;
    onSuccess: () => void;
}

export function dbSlotToBuilderSlot(dbSlot: any, label: string) {
    if (!dbSlot) return { field: label, text: "" };

    let textPayload: any = "";
    if (dbSlot.advanced_rules) {
        textPayload = dbSlot.advanced_rules;
    } else if (dbSlot.accepted_answers && dbSlot.accepted_answers.length > 0) {
        // Only treat as simple string (Exacta) if the DB explicitly says 'exact' 
        // OR if it's implicitly exact because it was created before we fixed the match_type saving
        if (dbSlot.match_type === 'exact' || (dbSlot.match_type === 'any' && dbSlot.accepted_answers.length === 1)) {
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

export function CardFormModal({ deck, card, onClose, onSuccess }: CardFormModalProps) {
    const [frontText, setFrontText] = useState(card?.front_text || "");
    const [frontMedia, setFrontMedia] = useState(card?.front_media || "");
    const [saving, setSaving] = useState(false);
    const [showFrontMedia, setShowFrontMedia] = useState(!!card?.front_media);

    const labelsToAsk = (deck.answer_labels && deck.answer_labels.length > 0) 
        ? deck.answer_labels 
        : (card ? card.card_slots.map(s => s.label) : ["Respuesta"]);

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
                        
                        <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-3 mb-2">
                            <HelpCircle size={18} className="text-accent-focus" />
                            <h2 className="text-lg font-bold text-white tracking-wide">Pregunta (Frente)</h2>
                        </div>
                        
                        <ZenInput
                            value={frontText}
                            onChange={e => setFrontText(e.target.value)}
                            placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
                            inputClassName="text-lg"
                            autoFocus
                        />

                        {!showFrontMedia && !frontMedia ? (
                            <button 
                                onClick={() => setShowFrontMedia(true)}
                                className="text-xs font-bold text-text-dim hover:text-accent-focus flex items-center gap-1.5 transition-colors uppercase tracking-wider mt-2"
                            >
                                <ImageIcon size={14} /> Añadir Imagen o Audio
                            </button>
                        ) : (
                            <div className="pt-2">
                                <ZenInput
                                    label="Multimedia Frontal"
                                    value={frontMedia}
                                    onChange={e => setFrontMedia(e.target.value)}
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

                    <div className="pt-4 flex justify-end sticky bottom-0 z-10 bg-void/80 backdrop-blur-md pb-2">
                        <ZenButton 
                            onClick={handleSave}
                            disabled={saving || !frontText} 
                            className="px-8 py-3.5"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {saving ? "Guardando..." : "Guardar Tarjeta"}
                        </ZenButton>
                    </div>
                </div>
            </div>
        </div>
    );
}