"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { AnswerSlotEditor } from "./AnswerSlotEditor";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export function CardEditor() {
  const { state, dispatch } = useDeckBuilder();
  const { cards, activeCardIndex, metadata } = state;
  const activeCard = cards[activeCardIndex];

  if (!activeCard) {
    return <div className="flex-1 p-8 text-text-dim/60 font-medium flex items-center justify-center bg-void">No hay tarjeta seleccionada.</div>;
  }

  const updateCard = (updates: Partial<typeof activeCard>) => {
    dispatch({
      type: "UPDATE_CARD",
      payload: { index: activeCardIndex, card: updates },
    });
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-void flex flex-col items-center custom-scrollbar">
      <div className="max-w-4xl w-full space-y-10 pb-20">
        
        {/* Front Question Section */}
        <div className="bg-stone-surface/30 backdrop-blur-sm rounded-3xl border border-border-subtle p-8 space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-focus"></div>
          
          <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-4">
            <HelpCircle size={22} className="text-accent-focus" />
            <h2 className="text-xl font-bold text-white tracking-wide">Pregunta (Frente)</h2>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Texto Principal</label>
            <textarea
              value={activeCard.front_text}
              onChange={(e) => updateCard({ front_text: e.target.value })}
              className="w-full px-5 py-4 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all resize-none shadow-inner"
              rows={3}
              placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Media (URL Opcional)</label>
            <input
              type="text"
              value={activeCard.front_media || ""}
              onChange={(e) => updateCard({ front_media: e.target.value })}
              className="w-full px-5 py-3.5 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all shadow-inner"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6 relative">
          <div className="flex items-center gap-3 px-2">
            <CheckCircle2 size={24} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Respuestas Esperadas (Reverso)</h2>
          </div>
          
          <div className="space-y-6">
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

      </div>
    </div>
  );
}
