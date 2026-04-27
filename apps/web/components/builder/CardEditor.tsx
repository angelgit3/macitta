"use client";

import { useState } from "react";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { AnswerSlotEditor } from "./AnswerSlotEditor";
import { HelpCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";

export function CardEditor() {
  const { state, dispatch } = useDeckBuilder();
  const [showFrontMedia, setShowFrontMedia] = useState(false);
  const { cards, activeCardIndex, metadata } = state;
  const activeCard = cards[activeCardIndex];

  if (!activeCard) {
    return <div className="flex-1 p-8 text-text-dim/60 font-medium flex items-center justify-center bg-void">No hay carta seleccionada.</div>;
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
        <div className="bg-stone-surface/30 backdrop-blur-sm rounded-2xl border border-border-subtle p-5 space-y-4 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-focus"></div>
          
          <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-3">
            <HelpCircle size={18} className="text-accent-focus" />
            <h2 className="text-lg font-bold text-white tracking-wide">Pregunta (Frente)</h2>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={activeCard.front_text}
              onChange={(e) => updateCard({ front_text: e.target.value })}
              className="w-full px-4 py-3 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-xl transition-all shadow-inner font-medium text-lg placeholder:font-normal"
              placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
              autoFocus
            />
          </div>

          {!showFrontMedia && !activeCard.front_media ? (
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
                value={activeCard.front_media || ""}
                onChange={(e) => updateCard({ front_media: e.target.value })}
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
            className="flex items-center gap-2 px-8 py-4 bg-accent-focus/10 text-accent-focus hover:bg-accent-focus hover:text-white border border-accent-focus/30 rounded-2xl font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <CheckCircle2 size={20} /> Terminar y Crear Nueva Carta
          </button>
        </div>

      </div>
    </div>
  );
}
