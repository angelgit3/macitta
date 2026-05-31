"use client";

import { useState } from "react";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { AnswerSlotEditor } from "./AnswerSlotEditor";
import { HelpCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { ZenInput } from "@/components/ui/ZenInput";

export function CardEditor() {
  const { state, dispatch } = useDeckBuilder();
  const [showFrontMedia, setShowFrontMedia] = useState(false);
  const { cards, activeCardIndex, metadata } = state;
  const activeCard = cards[activeCardIndex];

  if (!activeCard) {
    return <div className="flex-1 p-8 text-ink-faint/60 font-medium flex items-center justify-center bg-void">No hay carta seleccionada.</div>;
  }

  const updateCard = (updates: Partial<typeof activeCard>) => {
    dispatch({
      type: "UPDATE_CARD",
      payload: { index: activeCardIndex, card: updates },
    });
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-void flex flex-col items-center custom-scrollbar">
      <div className="max-w-3xl w-full space-y-6 pb-20">
        
        {/* Front Question Section */}
        <div className="bg-surface/30 backdrop-blur-sm rounded-2xl border border-border p-5 space-y-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
          
          <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-2">
            <HelpCircle size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-ink tracking-wide">Pregunta (Frente)</h2>
          </div>
          
          <ZenInput
            value={activeCard.front_text}
            onChange={(e) => updateCard({ front_text: e.target.value })}
            placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
            inputClassName="text-lg"
            autoFocus
          />

          {!showFrontMedia && !activeCard.front_media ? (
            <button 
              onClick={() => setShowFrontMedia(true)}
              className="text-xs font-bold text-ink-faint hover:text-accent flex items-center gap-1.5 transition-colors uppercase tracking-wider mt-2"
            >
              <ImageIcon size={14} /> Añadir Imagen o Audio
            </button>
          ) : (
            <div className="pt-2">
              <ZenInput
                label="Multimedia Frontal"
                value={activeCard.front_media || ""}
                onChange={(e) => updateCard({ front_media: e.target.value })}
                placeholder="URL de Imagen o Audio (Ej: https://...)"
              />
            </div>
          )}
        </div>

        {/* Answers Section */}
        <div className="space-y-4 relative">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={20} className="text-success drop-shadow-[0_0_10px_rgba(107,203,142,0.4)]" />
            <h2 className="text-lg font-bold text-ink tracking-wide">Respuestas a Evaluar</h2>
          </div>
          
          <div className="space-y-4">
            {metadata.answer_labels.map((label, idx) => {
              const existingSlot = activeCard.answers.find(a => a.field === label);
              return (
                <AnswerSlotEditor 
                  key={`${activeCard.id}-${label}`} 
                  cardIndex={activeCardIndex} 
                  slotIndex={idx}
                  label={label}
                  slot={existingSlot} 
                />
              );
            })}
          </div>
        </div>

        {/* Actions Bottom */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => dispatch({ type: "ADD_CARD" })}
            className="flex items-center gap-2 px-8 py-4 bg-accent/10 text-accent hover:bg-accent hover:text-void border border-accent/30 rounded-2xl font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(124,133,232,0.35)]"
          >
            <CheckCircle2 size={20} /> Terminar y Crear Nueva Carta
          </button>
        </div>

      </div>
    </div>
  );
}
