"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { Plus, Trash2 } from "lucide-react";

/**
 * CardSidebar — horizontal scrolling card thumbnail strip above the builder.
 * Allows switching the active card and adding/deleting cards.
 */
export function CardSidebar() {
  const { state, dispatch } = useDeckBuilder();
  const { cards, activeCardIndex } = state;

  return (
    <div className="w-full border-b border-border bg-surface/30 flex flex-col shrink-0 relative z-10">
      <div className="p-4 border-b border-border flex justify-between items-center bg-void/40 backdrop-blur-md">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-faint/60 ml-1">
          Cartas ({cards.length})
        </h3>
        <button
          onClick={() => dispatch({ type: "ADD_CARD" })}
          className="flex items-center text-xs font-bold px-3 py-1.5 bg-accent text-void border border-accent/20 hover:bg-accent-hover rounded-xl transition-all"
          title="Añadir Carta"
        >
          <Plus size={14} className="mr-1" />
          Nueva Carta
        </button>
      </div>

      {/* Horizontal scrolling card thumbnails */}
      <div className="flex overflow-x-auto p-4 gap-4 snap-x bg-void/50 custom-scrollbar scroll-smooth">
        {cards.map((card, index) => {
          const isActive    = index === activeCardIndex;
          const previewText = card.front_text.trim() || `Carta ${index + 1}`;

          return (
            <div
              key={card.id}
              onClick={() => dispatch({ type: "SET_ACTIVE_CARD", payload: { index } })}
              className={`shrink-0 w-36 h-24 p-4 border rounded-2xl cursor-pointer flex flex-col justify-between group transition-all duration-300 snap-start relative ${
                isActive
                  ? "bg-surface border-accent shadow-[0_0_15px_rgba(124,133,232,0.20)] scale-[1.02]"
                  : "bg-void/50 border-border hover:border-ink-faint/50 hover:bg-surface/50"
              }`}
            >
              <div className={`truncate text-sm font-medium flex-1 ${isActive ? "text-ink" : "text-ink-faint"}`}>
                {previewText}
              </div>
              <div className="flex justify-between items-end w-full">
                <span className={`text-[10px] font-bold tracking-wider ${isActive ? "text-accent" : "text-ink-faint/40"}`}>
                  #{index + 1}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    dispatch({ type: "DELETE_CARD", payload: { index } });
                  }}
                  className={`p-1.5 rounded-lg text-danger hover:text-danger/80 hover:bg-danger/10 transition-colors ${
                    cards.length === 1 ? "hidden" : "opacity-0 group-hover:opacity-100 lg:opacity-100"
                  }`}
                  title="Eliminar Carta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
