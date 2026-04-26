"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { AnswerSlotEditor } from "./AnswerSlotEditor";

export function CardEditor() {
  const { state, dispatch } = useDeckBuilder();
  const { cards, activeCardIndex, metadata } = state;
  const activeCard = cards[activeCardIndex];

  if (!activeCard) {
    return <div className="p-8 text-gray-500">No hay tarjeta seleccionada.</div>;
  }

  const updateCard = (updates: Partial<typeof activeCard>) => {
    dispatch({
      type: "UPDATE_CARD",
      payload: { index: activeCardIndex, card: updates },
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Front Question Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Pregunta (Frente)</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Texto Principal</label>
            <textarea
              value={activeCard.front_text}
              onChange={(e) => updateCard({ front_text: e.target.value })}
              className="w-full p-3 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ej: ¿Cómo se dice 'Manzana' en inglés?"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Media (URL Opcional)</label>
            <input
              type="text"
              value={activeCard.front_media || ""}
              onChange={(e) => updateCard({ front_media: e.target.value })}
              className="w-full p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 px-1">Respuestas Esperadas (Reverso)</h2>
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
  );
}
