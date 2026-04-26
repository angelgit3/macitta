"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { Plus, Trash2 } from "lucide-react";

export function CardSidebar() {
  const { state, dispatch } = useDeckBuilder();
  const { cards, activeCardIndex } = state;

  return (
    <div className="w-full border-b bg-white flex flex-col shrink-0">
      <div className="p-3 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-700 text-sm">Tarjetas ({cards.length})</h3>
        <button
          onClick={() => dispatch({ type: "ADD_CARD" })}
          className="flex items-center text-xs font-medium px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          title="Añadir Tarjeta"
        >
          <Plus size={14} className="mr-1" />
          Nueva
        </button>
      </div>
      
      {/* Horizontal scrolling list of cards */}
      <div className="flex overflow-x-auto p-2 gap-2 snap-x">
        {cards.map((card, index) => {
          const isActive = index === activeCardIndex;
          const previewText = card.front_text.trim() || `T${index + 1}`;
          
          return (
            <div
              key={card.id}
              onClick={() => dispatch({ type: "SET_ACTIVE_CARD", payload: { index } })}
              className={`shrink-0 w-32 p-3 border rounded-lg cursor-pointer flex justify-between items-start group transition-colors snap-start ${
                isActive ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
            >
              <div className="truncate text-sm font-medium text-gray-800 flex-1">
                {previewText}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "DELETE_CARD", payload: { index } });
                }}
                className={`ml-1 p-1 -m-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
                  cards.length === 1 ? "hidden" : "opacity-0 group-hover:opacity-100 lg:opacity-100"
                }`}
                title="Eliminar Tarjeta"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
