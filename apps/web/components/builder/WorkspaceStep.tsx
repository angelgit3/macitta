"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { CardSidebar } from "./CardSidebar";
import { CardEditor } from "./CardEditor";
import { exportDeckJson } from "../../contexts/deckBuilderUtils";
import { importDeckFromJson } from "../../app/actions/decks-import";

export function WorkspaceStep() {
  const { state, dispatch } = useDeckBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const jsonString = exportDeckJson(state);
      const result = await importDeckFromJson(jsonString);
      
      if (result.success) {
        router.push("/vocabulario");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save deck.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-theme(spacing.16))] w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch({ type: "PREV_STEP" })}
            className="flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Metadatos
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">{state.metadata.name || "Nuevo Mazo"}</h2>
            <span className="text-xs text-gray-500">
              {state.cards.length} tarjeta{state.cards.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
          <button
            onClick={handleSave}
            disabled={isSaving || state.cards.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Guardando..." : "Guardar Mazo"}
          </button>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <CardSidebar />
        <CardEditor />
      </div>
    </div>
  );
}
